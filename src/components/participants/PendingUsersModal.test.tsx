import "../../testing-helpers/mock-firestore-signaling";
import { fireEvent, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import type { PreloadedAppState } from "../../state";
import { callInitialState } from "../../state/call";
import { callUsersInitialState } from "../../state/callUsers";
import firestoreSignaling from "../../services/firestore-signaling";
import PendingUsersModal from "./PendingUsersModal";
import fullRender from "../../testing-helpers/fullRender";

describe("PendingUsersModal", () => {
  const preloadedState: PreloadedAppState = {
    call: {
      ...callInitialState,
      uid: "callUid-46ea-4dab-a476-505a4b1b1c95",
    },
    callUsers: {
      ...callUsersInitialState,
      pendingUsers: [
        {
          userDisplayName: "Rodrigo Muniz",
          userUid: "userUid_zJTvoYDGr9PuN1z69vheO0b4iWF2",
          uid: "callUserId-6db9ad2e-19f9-4a85-b383-7731e347b7d0",
        },
      ],
    },
  };

  beforeEach(() => {
    (firestoreSignaling.acceptPendingUser as jest.Mock).mockClear();
    (firestoreSignaling.refusePendingUser as jest.Mock).mockClear();
  });

  it("accepting pending user is integrated with firebase", async () => {
    fullRender(<PendingUsersModal isOpen={true} />, {
      preloadedState,
    });

    const acceptButtonElement = await screen.findByRole("button", {
      name: "Allow",
    });
    await act(() => fireEvent.click(acceptButtonElement));

    expect(firestoreSignaling.acceptPendingUser).toHaveBeenCalledTimes(1);
    expect(firestoreSignaling.acceptPendingUser).toHaveBeenCalledWith(
      "callUserId-6db9ad2e-19f9-4a85-b383-7731e347b7d0",
      "callUid-46ea-4dab-a476-505a4b1b1c95"
    );
  });

  it("refusing pending user is integrated with firebase", async () => {
    fullRender(<PendingUsersModal isOpen={true} />, {
      preloadedState,
    });

    const acceptButtonElement = await screen.findByRole("button", {
      name: "Not Allow",
    });
    await act(() => fireEvent.click(acceptButtonElement));

    expect(firestoreSignaling.refusePendingUser).toHaveBeenCalledTimes(1);
    expect(firestoreSignaling.refusePendingUser).toHaveBeenCalledWith(
      "callUserId-6db9ad2e-19f9-4a85-b383-7731e347b7d0",
      "callUid-46ea-4dab-a476-505a4b1b1c95"
    );
  });
});
