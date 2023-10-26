import { makeStandardAudioConstraints } from "./media-constraints";
import {
  P2PCallConnectionDetailed,
  P2PCallConnectionOptions,
  P2PCallOutgoingSignaling,
  buildLocalMedia,
  destroyLocalMedia,
  destroyRemoteMedia,
  doNewerPeerOffer,
  doOlderPeerAnswer,
  handleLocalIceCandidate,
  handleNewerPeerOffer,
  handleOlderPeerAnswer,
  handleRemoteIceCandidate,
  makeP2PCallConnection,
} from "./p2p-call-connection";

jest.mock("uuid", () => ({ v4: jest.fn(() => "random-123-uuid-321-abcd") }));

describe("ICE trickling", () => {
  const mockIceCandidate = {
    toJSON: jest.fn(() => ({
      candidate: "candidate:1234",
      sdpMid: "data",
      sdpMLineIndex: 0,
    })),
  } as unknown as RTCIceCandidate;

  let mockOutgoingSignaling: P2PCallOutgoingSignaling;
  let mockOptions: P2PCallConnectionOptions;
  let mockConnection: RTCPeerConnection;
  let mockP2PCall: P2PCallConnectionDetailed;

  beforeEach(() => {
    mockOutgoingSignaling = {
      onLocalJsepAction: jest.fn(),
      onLocalIceCandidate: jest.fn(),
      onCompletedLocalIceCandidates: jest.fn(),
    };

    mockOptions = {
      audio: true,
      video: true,
      isLocalPeerTheOfferingNewer: false,
      outgoingSignaling: mockOutgoingSignaling,
    };

    mockConnection = {
      addIceCandidate: jest.fn(),
      setConfiguration: jest.fn(),
    } as unknown as RTCPeerConnection;

    mockP2PCall = {
      uuid: "test-uuid-123-abc-321-defg",
      options: mockOptions,
      start: jest.fn(),
      stop: jest.fn(),
      _connection: mockConnection,
      incomingSignaling: {
        handleRemoteJsepAction: jest.fn(),
        handleRemoteIceCandidate: jest.fn(),
      },
      _localStream: null,
      _remoteStream: null,
      _iceCandidates: [],
    };
  });

  test("handleLocalIceCandidate: notifies outgoing signaling of local candidate, so it may forward such candidate to the other peer", async () => {
    await handleLocalIceCandidate(mockP2PCall, mockIceCandidate);

    expect(mockOutgoingSignaling.onLocalIceCandidate).toHaveBeenCalledWith({
      candidate: "candidate:1234",
      sdpMid: "data",
      sdpMLineIndex: 0,
    });
  });

  test("handleLocalIceCandidate: if nullish local candidate, then dont invoke individual callback, the gathering is finished", async () => {
    await handleLocalIceCandidate(mockP2PCall, null);
    expect(mockOutgoingSignaling.onLocalIceCandidate).not.toHaveBeenCalled();
  });

  test("handleLocalIceCandidate: if nullish local candidate, then invoke a single callback for non-tricke use cases, the gathering is finished", async () => {
    mockP2PCall._iceCandidates = [
      {
        toJSON: jest.fn(() => ({ previousCandidate: "a" })),
      } as unknown as RTCIceCandidate,
      {
        toJSON: jest.fn(() => ({ previousCandidate: "b" })),
      } as unknown as RTCIceCandidate,
      {
        toJSON: jest.fn(() => ({ previousCandidate: "c" })),
      } as unknown as RTCIceCandidate,
    ];

    await handleLocalIceCandidate(mockP2PCall, null);

    expect(
      mockOutgoingSignaling.onCompletedLocalIceCandidates
    ).toHaveBeenCalledWith([
      { previousCandidate: "a" },
      { previousCandidate: "b" },
      { previousCandidate: "c" },
    ]);
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
  let mockP2PCall: P2PCallConnectionDetailed;

  beforeEach(() => {
    mockOutgoingSignaling = {
      onLocalJsepAction: jest.fn(),
      onLocalIceCandidate: jest.fn(),
    };

    mockOptions = {
      audio: true,
      video: true,
      isLocalPeerTheOfferingNewer: false,
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
      setConfiguration: jest.fn(),
      setLocalDescription: jest.fn(),
      setRemoteDescription: jest.fn(),
    } as unknown as RTCPeerConnection;

    mockP2PCall = {
      uuid: "test-uuid-123-abc-321-defg",
      options: mockOptions,
      start: jest.fn(),
      stop: jest.fn(),
      _connection: mockConnection,
      incomingSignaling: {
        handleRemoteJsepAction: jest.fn(),
        handleRemoteIceCandidate: jest.fn(),
      },
      _localStream: null,
      _remoteStream: null,
      _iceCandidates: [],
    } as P2PCallConnectionDetailed;
  });

  test("doNewerPeerOffer: creates local offer, saves it, notifies signaling about it", async () => {
    await doNewerPeerOffer(mockP2PCall);

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

  test("handleNewerPeerOffer: receives remote offer, saves it, proceed to mount local answer", async () => {
    await handleNewerPeerOffer(mockP2PCall, {
      type: "offer",
      sdp: "mock SDP",
    });

    // saves it (remote offer)
    expect(mockConnection.setRemoteDescription).toHaveBeenCalledWith({
      type: "offer",
      sdp: "mock SDP",
    });

    // evidences of mounting local answer -- doOlderPeerAnswer
    expect(mockConnection.createAnswer).toHaveBeenCalledTimes(1);
    expect(mockConnection.setLocalDescription).toHaveBeenCalledTimes(1);
    expect(mockOutgoingSignaling.onLocalJsepAction).toHaveBeenCalledTimes(1);
  });

  test("doOlderPeerAnswer: creates local answer, saves it, notifies signaling about it", async () => {
    await doOlderPeerAnswer(mockP2PCall);

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

  test("handleOlderPeerAnswer: receives the remote answer, saves it, and that's the final jsep step", async () => {
    await handleOlderPeerAnswer(mockP2PCall, {
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
  let mockP2PCall: P2PCallConnectionDetailed;
  let mockGetUserMedia: typeof global.navigator.mediaDevices.getUserMedia;
  let mockStream: MediaStream;
  let mockTracks: MediaStreamTrack[];

  beforeEach(() => {
    mockOptions = {
      audio: true,
      video: true,
      isLocalPeerTheOfferingNewer: false,
      outgoingSignaling: {
        onLocalJsepAction: jest.fn(),
        onLocalIceCandidate: jest.fn(),
      },
    };

    mockConnection = {
      addTrack: jest.fn(),
      createOffer: jest.fn(),
      setConfiguration: jest.fn(),
      setLocalDescription: jest.fn(),
      close: jest.fn(),
    } as unknown as RTCPeerConnection;

    mockP2PCall = {
      uuid: "test-uuid-123-abc-321-defg",
      options: mockOptions,
      start: jest.fn(),
      stop: jest.fn(),
      _connection: mockConnection,
      incomingSignaling: {
        handleRemoteJsepAction: jest.fn(),
        handleRemoteIceCandidate: jest.fn(),
      },
      _localStream: null,
      _remoteStream: null,
      _iceCandidates: [],
    } as P2PCallConnectionDetailed;
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

  test("destroyRemoteMedia: stop all tracks found on connection and invokes callback of empty stream", async () => {
    const remoteTrack = { stop: jest.fn() };
    mockP2PCall._remoteStream = {
      getTracks: jest.fn(() => [remoteTrack]),
    } as unknown as MediaStream;

    destroyRemoteMedia(mockP2PCall);

    expect(remoteTrack.stop).toBeCalledTimes(1);
    expect(mockP2PCall.onRemoteStream).toHaveBeenCalledWith(null);
  });
});

describe("P2PCallConnection, its creator, start, stop and a few callbacks", () => {
  let mockConnection: RTCPeerConnection;
  let mockOptions: P2PCallConnectionOptions;
  let mockGetUserMedia: typeof global.navigator.mediaDevices.getUserMedia;
  let mockStream: MediaStream;
  let mockTracks: MediaStreamTrack[];

  beforeEach(() => {
    mockOptions = {
      audio: true,
      video: true,
      isLocalPeerTheOfferingNewer: false,
      outgoingSignaling: {
        onLocalJsepAction: jest.fn(),
        onLocalIceCandidate: jest.fn(),
      },
    };

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
      setConfiguration: jest.fn(),
      setLocalDescription: jest.fn(),
      setRemoteDescription: jest.fn(),
      addEventListener: jest.fn(),
      addTrack: jest.fn(),
      close: jest.fn(),
    } as unknown as RTCPeerConnection;

    global.RTCPeerConnection = jest
      .fn()
      .mockImplementation(() => mockConnection) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  test("correctly initializes it with unique identifier, RTC peer connection and preserved options", () => {
    const p2pCall = makeP2PCallConnection(mockOptions);

    expect(p2pCall.uuid).toEqual("random-123-uuid-321-abcd");
    expect(p2pCall.options).toEqual(mockOptions);
    expect((p2pCall as P2PCallConnectionDetailed)._connection).toBe(
      mockConnection
    );
  });

  test("will set ice servers configuration (when provided) to the RTC connection", () => {
    (mockConnection.setConfiguration as jest.Mock).mockClear();

    const iceServersConfig = {
      username: "dovahkiin",
      credential: "fus-ro-dah",
      urls: [
        "stun:foo.bar",
        "turn:foo.bar:80?transport=udp",
        "turn:foo.bar:3478?transport=udp",
        "turn:foo.bar:80?transport=tcp",
        "turn:foo.bar:3478?transport=tcp",
        "turns:foo.bar:443?transport=tcp",
        "turns:foo.bar:5349?transport=tcp",
      ],
    };

    makeP2PCallConnection({ ...mockOptions, iceServersConfig });

    expect(mockConnection.setConfiguration).toBeCalledTimes(1);
    expect(mockConnection.setConfiguration).toBeCalledWith({
      iceServers: [iceServersConfig],
    });
  });

  test("will not set any default ice servers configuration (when not provided) to the RTC connection", () => {
    (mockConnection.setConfiguration as jest.Mock).mockClear();

    makeP2PCallConnection(mockOptions);

    expect(mockConnection.setConfiguration).toBeCalledTimes(1);
    expect(mockConnection.setConfiguration).toBeCalledWith({
      iceServers: [],
    });
  });

  test("starting as newer peer who begins by offer, indeed do the offer", async () => {
    const p2pCall = makeP2PCallConnection({
      ...mockOptions,
      isLocalPeerTheOfferingNewer: true,
    });
    await p2pCall.start();
    expect(mockGetUserMedia).toBeCalled();
    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.createOffer
    ).toBeCalled();
  });

  test("starting as older peer who doest not begin the interaction, dont call offer nor answer for now", async () => {
    const p2pCall = makeP2PCallConnection({
      ...mockOptions,
      isLocalPeerTheOfferingNewer: false,
    });
    await p2pCall.start();
    expect(mockGetUserMedia).toBeCalledTimes(1);
    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.createOffer
    ).not.toBeCalled();
    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.createAnswer
    ).not.toBeCalled();
  });

  test("stopping will close the connection and destroy the local media", async () => {
    const p2pCall = makeP2PCallConnection(mockOptions);
    await p2pCall.start();
    p2pCall.stop();

    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.close
    ).toHaveBeenCalled();
    expect(mockTracks[0].stop).toBeCalledTimes(1);
  });

  test("(STRESS) the start can be aborted", async () => {
    (mockGetUserMedia as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockStream), 300))
    );

    const p2pCall = makeP2PCallConnection(mockOptions);

    p2pCall.start(); // doesnt await
    p2pCall.stop(); // premature stop, ignored but marked for lazy run
    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.close
    ).not.toHaveBeenCalled();
    expect(mockTracks[0].stop).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 300));
    // now lazily executed the command stop
    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.close
    ).toHaveBeenCalled();
    expect(mockTracks[0].stop).toHaveBeenCalled();
  });

  test("(STRESS) the start abortion can be resumed, and not duplicating startings", async () => {
    (mockGetUserMedia as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockStream), 300))
    );

    const p2pCall = makeP2PCallConnection({
      ...mockOptions,
      isLocalPeerTheOfferingNewer: true,
    });

    p2pCall.start(); // doesnt await
    p2pCall.stop(); // premature stop, ignored but marked for lazy run
    p2pCall.start(); // oh, wait, forget the canceling

    await new Promise((resolve) => setTimeout(resolve, 2 * 300));
    // did not perform the stop
    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.close
    ).not.toHaveBeenCalled();
    expect(mockTracks[0].stop).not.toHaveBeenCalled();
    // and finished the start, but equivalent as just 1 call, ignoring duplicated startings
    expect(mockGetUserMedia).toBeCalledTimes(1);
    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.createOffer
    ).toBeCalledTimes(1);
  });

  test("has an interface handle incoming offer correctly", async () => {
    const p2pCall = makeP2PCallConnection({
      ...mockOptions,
      isLocalPeerTheOfferingNewer: false,
    });

    await p2pCall.incomingSignaling.handleRemoteJsepAction({
      type: "offer",
      sdp: "mock sdp",
    });

    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.setRemoteDescription
    ).toHaveBeenCalledWith({
      type: "offer",
      sdp: "mock sdp",
    });
  });

  test("has an interface handle incoming answer correctly", async () => {
    const p2pCall = makeP2PCallConnection({
      ...mockOptions,
      isLocalPeerTheOfferingNewer: true,
    });

    await p2pCall.incomingSignaling.handleRemoteJsepAction({
      type: "answer",
      sdp: "mock sdp",
    });

    expect(
      (p2pCall as P2PCallConnectionDetailed)._connection.setRemoteDescription
    ).toHaveBeenCalledWith({
      type: "answer",
      sdp: "mock sdp",
    });
  });

  test("when connection finds a local ice candidates, the outgoing signaling is notified", async () => {
    const mockCandidate = {
      toJSON: jest.fn(() => ({
        candidate: "candidate:1234",
        sdpMid: "data",
        sdpMLineIndex: 0,
      })),
    };

    (mockConnection.addEventListener as jest.Mock).mockImplementation(
      (type, listener) => {
        if (type === "icecandidate") {
          listener({ candidate: mockCandidate });
        }
      }
    );

    const p2pCall = makeP2PCallConnection(mockOptions);
    expect(
      p2pCall.options.outgoingSignaling.onLocalIceCandidate
    ).toBeCalledWith({
      candidate: "candidate:1234",
      sdpMid: "data",
      sdpMLineIndex: 0,
    });
  });

  test("when connection finds a remote tracks, the p2pcall triggers a callback", async () => {
    const mockStream = jest.fn();

    (mockConnection.addEventListener as jest.Mock).mockImplementation(
      (type, listener) => {
        if (type === "track") {
          setTimeout(() => listener({ streams: [mockStream] }), 300);
        }
      }
    );

    const p2pCall = makeP2PCallConnection(mockOptions);
    p2pCall.onRemoteStream = jest.fn();

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(p2pCall.onRemoteStream).toBeCalledWith(mockStream);
  });
});
