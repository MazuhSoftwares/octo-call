import "../../testing-helpers/mock-firestore-signaling";
import CallSelectionMain from "./CallSelectionMain";
import { act, fireEvent, screen } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import firestoreSignaling from "../../services/firestore-signaling";
import { userInitialState } from "../../state/user";

describe("CallSelectionMain", () => {
  beforeEach(() => {
    (firestoreSignaling.createCall as jest.Mock).mockClear();
    (firestoreSignaling.askToJoinCall as jest.Mock).mockClear();
  });

  it("renders", () => {
    fullRender(<CallSelectionMain />);
  });

  it("call creation is integrated with firebase", async () => {
    fullRender(<CallSelectionMain />, {
      preloadedState: {
        user: {
          ...userInitialState,
          uid: "1m2kkn3",
          displayName: "John Doe",
          status: "authenticated",
        },
      },
    });

    const callNameInputElement = screen.getByLabelText("Create a new call");

    const callCreationButtonElement = screen.getByRole("button", {
      name: "Create call",
    });

    fireEvent.change(callNameInputElement, { target: { value: "Daily" } });
    await act(() => fireEvent.click(callCreationButtonElement));

    expect(firestoreSignaling.createCall).toBeCalledTimes(1);
  });

  it("asking to join a call is integrated with firebase", async () => {
    fullRender(<CallSelectionMain />, {
      preloadedState: {
        user: {
          ...userInitialState,
          uid: "1m2kkn3",
          displayName: "John Doe",
          status: "authenticated",
        },
      },
    });

    const callUidInputElement = screen.getByLabelText("Join a call");

    const joinCallButtonElement = screen.getByRole("button", {
      name: "Join call",
    });

    fireEvent.change(callUidInputElement, {
      target: { value: "b385c5fe-5da5-476d-b66f-a4580581be61" },
    });
    await act(() => fireEvent.click(joinCallButtonElement));

    expect(firestoreSignaling.askToJoinCall).toHaveBeenCalledTimes(1);
  });
});
