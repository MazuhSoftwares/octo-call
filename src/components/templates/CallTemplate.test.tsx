import "../../testing-helpers/mock-firestore-signaling";
import { fireEvent, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import fullRender from "../../testing-helpers/fullRender";
import CallTemplate from "./CallTemplate";
import { UserState, userInitialState } from "../../state/user";
import { CallState, callInitialState } from "../../state/call";
import { createCall, createUser } from "../../testing-helpers/call-fixtures";
import signalingBackend from "../../services/signaling-backend";

jest.mock("../../hooks/useRedirectionRule", () =>
  jest.fn().mockReturnValue("")
);

jest.mock("../../hooks/useCallUsersListener", () => jest.fn());

jest.mock("../../services/signaling-backend", () => ({
  leaveCall: jest.fn(),
}));

describe("CallTemplate", () => {
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
      displayName: "1:1 Jane Doe + John Doe",
    }),
    userStatus: "participant",
  };

  beforeEach(() => {
    (signalingBackend.acceptPendingUser as jest.Mock).mockClear();
    (signalingBackend.rejectPendingUser as jest.Mock).mockClear();
  });

  it("renders", async () => {
    await act(() =>
      fullRender(<CallTemplate>Call.</CallTemplate>, {
        preloadedState: { user, call },
      })
    );

    const participantsModal = await screen.findByText(
      "1:1 Jane Doe + John Doe"
    );
    expect(participantsModal).toBeInTheDocument();
  });

  it("can show participants modal", async () => {
    await act(() =>
      fullRender(<CallTemplate>Call.</CallTemplate>, {
        preloadedState: { user, call },
      })
    );

    const participantsButton = screen.getByRole("button", {
      name: "Participants",
    });
    fireEvent.click(participantsButton);
    const participantsModal = await screen.findByRole("heading", {
      name: "Participants",
    });
    expect(participantsModal).toBeInTheDocument();
  });

  it("toggles microphone status", async () => {
    await act(() =>
      fullRender(<CallTemplate>Call.</CallTemplate>, {
        preloadedState: { user, call },
      })
    );
    const micButton = screen.getByTitle("Toggle microphone");
    expect(screen.getByText("Microphone is on.")).toBeInTheDocument();

    fireEvent.click(micButton);
    expect(screen.getByText("Microphone is off.")).toBeInTheDocument();

    fireEvent.click(micButton);
    expect(screen.getByText("Microphone is on.")).toBeInTheDocument();
  });

  it("toggles camera status", async () => {
    await act(() =>
      fullRender(<CallTemplate>Call.</CallTemplate>, {
        preloadedState: { user, call },
      })
    );
    const camButton = screen.getByTitle("Toggle camera");
    expect(screen.getByText("Camera is off.")).toBeInTheDocument();

    fireEvent.click(camButton);
    expect(screen.getByText("Camera is on.")).toBeInTheDocument();

    fireEvent.click(camButton);
    expect(screen.getByText("Camera is off.")).toBeInTheDocument();
  });

  it("leaves call", async () => {
    signalingBackend.leaveCall = jest.fn().mockResolvedValueOnce(null);
    const { store } = await act(() =>
      fullRender(<CallTemplate>Call.</CallTemplate>, {
        preloadedState: { user, call },
      })
    );

    const leaveBtn = screen.getByRole("button", { name: "Leave this call" });
    await act(() => fireEvent.click(leaveBtn));
    expect(store.getState().call.uid).toBe("");
  });

  it("leaves call even if signaling throws error", async () => {
    signalingBackend.leaveCall = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    const { store } = await act(() =>
      fullRender(<CallTemplate>Call.</CallTemplate>, {
        preloadedState: { user, call },
      })
    );

    const leaveBtn = screen.getByRole("button", { name: "Leave this call" });
    await act(() => fireEvent.click(leaveBtn));
    expect(store.getState().call.uid).toBe("");
  });
});
