import "../../testing-helpers/mock-firestore-signaling";
import { fireEvent, screen } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import CallTemplate from "./CallTemplate";
import { UserState, userInitialState } from "../../state/user";
import { CallState, callInitialState } from "../../state/call";
import { createCall, createUser } from "../../testing-helpers/call-fixtures";
import { act } from "react-dom/test-utils";

jest.mock("../../hooks/useRedirectionRule", () =>
  jest.fn().mockReturnValue("")
);
import { CallUserState, callUsersInitialState } from "../../state/callUsers";
import firestoreSignaling from "../../services/firestore-signaling";

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
    status: "inProgress",
  };
  const callUsers: CallUserState = {
    ...callUsersInitialState,
    pendingUsers: [
      {
        userDisplayName: "Rodrigo Muniz",
        userUid: "userUid_zJTvoYDGr9PuN1z69vheO0b4iWF2",
        uid: "callUserId-6db9ad2e-19f9-4a85-b383-7731e347b7d0",
      },
    ],
  };

  beforeEach(() => {
    (firestoreSignaling.acceptPendingUser as jest.Mock).mockClear();
    (firestoreSignaling.refusePendingUser as jest.Mock).mockClear();
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

  it("can show pending users modal", async () => {
    fullRender(<CallTemplate>Call.</CallTemplate>, {
      preloadedState: {
        user,
        call: {
          ...callInitialState,
          uid: "c2a35f1f-46ea-4dab-a476-505a4b1b1c95",
          displayName: "1:1 Jane Doe + John Doe",
          hostId: "1m2kkn3",
          hostDisplayName: "John Doe",
          status: "inProgress",
        },
        callUsers,
      },
    });

    const pendingUsersModal = await screen.findByRole("heading", {
      name: "New Participants",
    });
    expect(pendingUsersModal).toBeInTheDocument();
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
});
