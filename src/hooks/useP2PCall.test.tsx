import useP2PCall from "./useP2PCall";
import type { CallP2PDescription, P2PCallConnectionOptions } from "../webrtc";
import * as webrtc from "../webrtc";
import fullHookRender from "../testing-helpers/fullHookRender";
import { UserState, userInitialState } from "../state/user";
import { CallState, callInitialState } from "../state/call";
import { createCall, createUser } from "../testing-helpers/call-fixtures";

jest.mock("../webrtc", () => ({
  makeP2PCallConnection: jest.fn((options: P2PCallConnectionOptions) => ({
    uuid: options.uuid || "blank-test-uuid",
    options,
    start: jest.fn(),
    stop: jest.fn(),
    incomingSignaling: {
      handleRemoteJsepAction: () => Promise.resolve(),
      handleRemoteIceCandidate: () => Promise.resolve(),
    },
    onLocalStream: options.onLocalStream || null,
    onRemoteStream: options.onRemoteStream || null,
  })),
  domHelpers: {
    initVideoElement: jest.fn(),
  },
}));

describe("useP2PCall", () => {
  const user: UserState = {
    ...userInitialState,
    ...createUser({ displayName: "Marcell G." }),
    status: "authenticated",
  };
  const call: CallState = {
    ...callInitialState,
    ...createCall({
      displayName: "Daily Meeting",
      hostId: user.uid,
      hostDisplayName: user.displayName,
    }),
    userStatus: "participant",
  };
  const otherPeerP2pDescription: CallP2PDescription = {
    uid: "111111",
    newestPeerUid: "123-321-123-321",
    oldestPeerUid: user.uid,
  };

  beforeEach(() => {
    (webrtc.makeP2PCallConnection as jest.Mock).mockClear();
  });

  it("runs ok by caling webrtc module", async () => {
    const result = await fullHookRender(
      () =>
        useP2PCall({
          p2pDescriptionUid: otherPeerP2pDescription.uid,
          isLocalPeerTheOfferingNewest: false,
          remoteVideo: () => document.createElement("video"),
        }),
      {
        preloadedState: {
          user,
          call: {
            ...call,
            p2pDescriptions: [otherPeerP2pDescription],
          },
        },
      }
    );

    expect(result).not.toBeInstanceOf(Error);

    expect(webrtc.makeP2PCallConnection).toHaveBeenCalledTimes(1);
  });

  it("throws an error if description is not found", async () => {
    const result = await fullHookRender(
      () =>
        useP2PCall({
          p2pDescriptionUid: otherPeerP2pDescription.uid,
          isLocalPeerTheOfferingNewest: false,
          remoteVideo: () => document.createElement("video"),
        }),
      {
        preloadedState: {
          user,
          call: {
            ...call,
            p2pDescriptions: [], // empty, not including this participation uid
          },
        },
      }
    ).catch((error) => error);

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe(
      "Description not found for useP2PCall hook: " +
        otherPeerP2pDescription.uid
    );

    expect(webrtc.makeP2PCallConnection).not.toHaveBeenCalled();
  });
});
