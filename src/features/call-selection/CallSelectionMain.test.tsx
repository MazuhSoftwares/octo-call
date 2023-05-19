import "../../testing-helpers/mock-firestore-signaling";
import CallSelectionMain from "./CallSelectionMain";
import { act, fireEvent, screen } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import firestoreSignaling from "../../services/firestore-signaling";
import { userInitialState } from "../../state/user";

describe("CallSelectionMain", () => {
  beforeEach(() => {
    (firestoreSignaling.create as jest.Mock).mockClear();
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

    const callNameInputElement = screen.getByLabelText("Call Name");

    const callCreationButtonElement = screen.getByRole("button", {
      name: "Create",
    });

    fireEvent.change(callNameInputElement, { target: { value: "Daily" } });
    await act(() => fireEvent.click(callCreationButtonElement));

    expect(firestoreSignaling.create).toBeCalledTimes(1);
  });
});
