import { waitFor } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import webrtc from "../../webrtc";
import type { P2PCallConnectionOptions } from "../../webrtc";
import P2PCallMain from "./P2PCallMain";
import { CallState, callInitialState } from "../../state/call";
import { UserState, userInitialState } from "../../state/user";
import { createUser, createCall } from "../../testing-helpers/call-fixtures";

jest.mock("../../webrtc", () => ({
  makeP2PCallConnection: jest.fn((options: P2PCallConnectionOptions) => ({
    uuid: "call-uuid-123",
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

jest.mock("../../services/firestore-signaling", () => ({
  create: jest.fn(),
  createCall: jest.fn(),
  askToJoinCall: jest.fn(),
  listenCallUsers: jest.fn().mockReturnValue(jest.fn()),
}));

describe("P2PCallMain", () => {
  const user: UserState = {
    ...userInitialState,
    ...createUser(),
    status: "authenticated",
  };
  const call: CallState = {
    ...callInitialState,
    ...createCall({
      hostId: user.uid,
      hostDisplayName: user.displayName,
    }),
    userStatus: "participant",
  };

  it("renders", () => {
    fullRender(<P2PCallMain />, { preloadedState: { user, call } });
  });

  it("starts calls", async () => {
    fullRender(<P2PCallMain />, { preloadedState: { user, call } });
    await waitFor(() => expect(webrtc.makeP2PCallConnection).toBeCalled());
  });
});
