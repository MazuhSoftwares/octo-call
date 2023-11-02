import fullRender from "../../testing-helpers/fullRender";
import P2PCallMain from "./P2PCallMain";
import { CallState, callInitialState } from "../../state/call";
import { UserState, userInitialState } from "../../state/user";
import {
  createUser,
  createCall,
  createCallParticipant,
} from "../../testing-helpers/call-fixtures";
import { act, screen, waitFor } from "@testing-library/react";
import type { P2PCallConnectionOptions } from "../../webrtc";

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

jest.mock("../../services/signaling-backend", () => ({
  create: jest.fn(),
  createCall: jest.fn(),
  askToJoinCall: jest.fn(),
  listenCallUsers: jest.fn().mockReturnValue(jest.fn()),
  listenP22Descriptions: jest.fn(),
}));

jest.mock("../../hooks/useRedirectionRule", () =>
  jest.fn().mockReturnValue("")
);

jest.mock("../../hooks/useWindowSize", () =>
  jest.fn().mockReturnValue({ width: 800, height: 600 })
);

describe("P2PCallMain", () => {
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

  it("will begin the call with at least the title and the only host as video slot", async () => {
    await act(() =>
      fullRender(<P2PCallMain />, { preloadedState: { user, call } })
    );
    await waitFor(() => expect(screen.getAllByRole("video").length).toBe(1));
    expect(screen.getByText("Daily Meeting")).toBeVisible();
    expect(screen.getByRole("video")).toBeVisible();
    expect(screen.getByText("Marcell G. (Me)")).toBeVisible();
  });

  it.skip("displays participants slots along with the host", async () => {
    await act(() =>
      fullRender(<P2PCallMain />, {
        preloadedState: {
          user,
          call: {
            ...call,
            participants: [
              createCallParticipant({
                userUid: "123-321-123-321",
                userDisplayName: "Amanda C.",
              }),
            ],
            p2pDescriptions: [
              {
                uid: "111111",
                newerPeerUid: "123-321-123-321",
                olderPeerUid: user.uid,
              },
            ],
          },
        },
      })
    );
    await waitFor(() => expect(screen.getAllByRole("video").length).toBe(2));
    expect(screen.getByText("Marcell G.")).toBeVisible();
    expect(screen.getByText("Amanda C.")).toBeVisible();
  });
});
