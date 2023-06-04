import { waitFor } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import webrtc from "../../webrtc";
import type { P2PCallConnectionOptions } from "../../webrtc";
import P2PCallMain from "./P2PCallMain";

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
}));

describe("P2PCallMain", () => {
  it("renders", () => {
    fullRender(<P2PCallMain />);
  });

  it("starts calls", async () => {
    fullRender(<P2PCallMain />);
    await waitFor(() => expect(webrtc.makeP2PCallConnection).toBeCalled());
  });
});
