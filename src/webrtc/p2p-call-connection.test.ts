import { makeStandardAudioConstraints } from "./media-constraints";
import {
  P2PCallConnection,
  P2PCallConnectionOptions,
  P2PCallOutgoingSignaling,
  buildLocalMedia,
  destroyLocalMedia,
  doNewestPeerOffer,
  doOldestPeerAnswer,
  handleLocalIceCandidate,
  handleNewestPeerOffer,
  handleOldestPeerAnswer,
  handleRemoteIceCandidate,
} from "./p2p-call-connection";

describe("ICE trickling", () => {
  const mockIceCandidate = {
    candidate: "candidate:1234",
    sdpMid: "data",
    sdpMLineIndex: 0,
  } as unknown as RTCIceCandidate;

  let mockOutgoingSignaling: P2PCallOutgoingSignaling;
  let mockOptions: P2PCallConnectionOptions;
  let mockConnection: RTCPeerConnection;
  let mockP2PCall: P2PCallConnection;

  beforeEach(() => {
    mockOutgoingSignaling = {
      onLocalJsepAction: jest.fn(),
      onLocalIceCandidate: jest.fn(),
    };

    mockOptions = {
      audio: true,
      video: true,
      isLocalPeerTheOfferingNewest: false,
      outgoingSignaling: mockOutgoingSignaling,
    };

    mockConnection = {
      addIceCandidate: jest.fn(),
    } as unknown as RTCPeerConnection;

    mockP2PCall = {
      uuid: "test-uuid-123-abc-321-defg",
      options: mockOptions,
      start: jest.fn(),
      stop: jest.fn(),
      connection: mockConnection,
      incomingSignaling: {
        handleRemoteJsepAction: jest.fn(),
        handleRemoteIceCandidate: jest.fn(),
      },
    };
  });

  test("handleLocalIceCandidate: notifies outgoing signaling of local candidate, so it may forward such candidate to the other peer", async () => {
    await handleLocalIceCandidate(mockP2PCall, mockIceCandidate);
    expect(mockOutgoingSignaling.onLocalIceCandidate).toHaveBeenCalledWith(
      mockIceCandidate
    );
  });

  test("handleLocalIceCandidate: if nullish local candidate, then does nothing, the gathering is finished", async () => {
    await handleLocalIceCandidate(mockP2PCall, null);
    expect(mockOutgoingSignaling.onLocalIceCandidate).not.toHaveBeenCalled();
  });

  test("handleRemoteIceCandidate: adds candidate to connection", async () => {
    await handleRemoteIceCandidate(mockP2PCall, mockIceCandidate);
    expect(mockConnection.addIceCandidate).toHaveBeenCalledWith(
      mockIceCandidate
    );
  });
});

describe("JSEP flow", () => {
  let mockOutgoingSignaling: P2PCallOutgoingSignaling;
  let mockOptions: P2PCallConnectionOptions;
  let mockConnection: RTCPeerConnection;
  let mockP2PCall: P2PCallConnection;

  beforeEach(() => {
    mockOutgoingSignaling = {
      onLocalJsepAction: jest.fn(),
      onLocalIceCandidate: jest.fn(),
    };

    mockOptions = {
      audio: true,
      video: true,
      isLocalPeerTheOfferingNewest: false,
      outgoingSignaling: mockOutgoingSignaling,
    };

    mockConnection = {
      addIceCandidate: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({
        type: "offer",
        sdp: "mock SDP",
      }),
      createAnswer: jest.fn().mockResolvedValue({
        type: "answer",
        sdp: "mock SDP",
      }),
      setLocalDescription: jest.fn(),
      setRemoteDescription: jest.fn(),
    } as unknown as RTCPeerConnection;

    mockP2PCall = {
      uuid: "test-uuid-123-abc-321-defg",
      options: mockOptions,
      start: jest.fn(),
      stop: jest.fn(),
      connection: mockConnection,
      incomingSignaling: {
        handleRemoteJsepAction: jest.fn(),
        handleRemoteIceCandidate: jest.fn(),
      },
    };
  });

  test("doNewestPeerOffer: creates local offer, saves it, notifies signaling about it", async () => {
    await doNewestPeerOffer(mockP2PCall);

    // creates local offer
    expect(mockConnection.createOffer).toHaveBeenCalled();
    // saves it
    expect(mockConnection.setLocalDescription).toHaveBeenCalledWith({
      type: "offer",
      sdp: "mock SDP",
    });
    // notifies signaling about it
    expect(mockOutgoingSignaling.onLocalJsepAction).toHaveBeenCalledWith({
      type: "offer",
      sdp: "mock SDP",
    });
  });

  test("handleNewestPeerOffer: receives remote offer, saves it, proceed to mount local answer", async () => {
    await handleNewestPeerOffer(mockP2PCall, {
      type: "offer",
      sdp: "mock SDP",
    });

    // saves it (remote offer)
    expect(mockConnection.setRemoteDescription).toHaveBeenCalledWith({
      type: "offer",
      sdp: "mock SDP",
    });

    // evidences of mounting local answer -- doOldestPeerAnswer
    expect(mockConnection.createAnswer).toHaveBeenCalledTimes(1);
    expect(mockConnection.setLocalDescription).toHaveBeenCalledTimes(1);
    expect(mockOutgoingSignaling.onLocalJsepAction).toHaveBeenCalledTimes(1);
  });

  test("doOldestPeerAnswer: creates local answer, saves it, notifies signaling about it", async () => {
    await doOldestPeerAnswer(mockP2PCall);

    // creates local answer
    expect(mockConnection.createAnswer).toHaveBeenCalled();
    // saves it
    expect(mockConnection.setLocalDescription).toHaveBeenCalledWith({
      type: "answer",
      sdp: "mock SDP",
    });
    // notifies signaling about it
    expect(mockOutgoingSignaling.onLocalJsepAction).toHaveBeenCalledWith({
      type: "answer",
      sdp: "mock SDP",
    });
  });

  test("handleOldestPeerAnswer: receives the remote answer, saves it, and that's the final jsep step", async () => {
    await handleOldestPeerAnswer(mockP2PCall, {
      type: "answer",
      sdp: "mock SDP",
    });

    expect(mockConnection.setRemoteDescription).toHaveBeenCalledWith({
      type: "answer",
      sdp: "mock SDP",
    });
  });
});

describe("Media gathering for RTC connection", () => {
  let mockOptions: P2PCallConnectionOptions;
  let mockConnection: RTCPeerConnection;
  let mockP2PCall: P2PCallConnection;
  let mockGetUserMedia: typeof global.navigator.mediaDevices.getUserMedia;
  let mockStream: MediaStream;
  let mockTracks: MediaStreamTrack[];

  beforeEach(() => {
    mockOptions = {
      audio: true,
      video: true,
      isLocalPeerTheOfferingNewest: false,
      outgoingSignaling: {
        onLocalJsepAction: jest.fn(),
        onLocalIceCandidate: jest.fn(),
      },
    };

    mockConnection = {
      addTrack: jest.fn(),
      createOffer: jest.fn(),
      setLocalDescription: jest.fn(),
      close: jest.fn(),
    } as unknown as RTCPeerConnection;

    mockP2PCall = {
      uuid: "test-uuid-123-abc-321-defg",
      options: mockOptions,
      start: jest.fn(),
      stop: jest.fn(),
      connection: mockConnection,
      incomingSignaling: {
        handleRemoteJsepAction: jest.fn(),
        handleRemoteIceCandidate: jest.fn(),
      },
    };
    mockP2PCall.onLocalStream = jest.fn();
    mockP2PCall.onRemoteStream = jest.fn();

    mockTracks = [
      {
        kind: "audio",
        stop: jest.fn(),
      },
      {
        kind: "video",
        stop: jest.fn(),
      },
    ] as unknown as MediaStreamTrack[];

    mockStream = {
      getTracks: jest.fn().mockReturnValue(mockTracks),
    } as unknown as MediaStream;

    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });

    mockGetUserMedia = global.navigator.mediaDevices.getUserMedia;
  });

  test("buildLocalMedia: request user stream and adds its tracks to the RTC connection and invokes callback of new stream", async () => {
    await buildLocalMedia(mockP2PCall);

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: makeStandardAudioConstraints(mockOptions.audio),
      video: makeStandardAudioConstraints(mockOptions.video),
    });
    expect(mockConnection.addTrack).toHaveBeenCalledTimes(mockTracks.length);
    expect(mockP2PCall.onLocalStream).toHaveBeenCalledWith(mockStream);
  });

  test("destroyLocalMedia: stop all tracks (the same previously built) and invokes callback of empty stream", async () => {
    await buildLocalMedia(mockP2PCall);

    destroyLocalMedia(mockP2PCall);

    expect(mockTracks[0].stop).toHaveBeenCalledTimes(1);
    expect(mockTracks[1].stop).toHaveBeenCalledTimes(1);
    expect(mockP2PCall.onLocalStream).toHaveBeenCalledWith(null);
  });
});
