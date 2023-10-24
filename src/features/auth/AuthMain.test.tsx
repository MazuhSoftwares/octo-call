import "../../testing-helpers/mock-firestore-auth";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import firestoreAuth from "../../services/firestore-auth";
import fullRender from "../../testing-helpers/fullRender";
import AuthMain from "./AuthMain";

describe("CurrentUserStateIndicator", () => {
  beforeEach(() => {
    (firestoreAuth.login as jest.Mock).mockClear();
  });

  it("login will set loading ui to prevent double trigger", async () => {
    (firestoreAuth.login as jest.Mock).mockResolvedValue(
      new Promise((resolve) => setTimeout(resolve, 500))
    );

    const { store } = fullRender(<AuthMain />);

    const loginButtonElement = screen.getByRole("button", {
      name: "Continue with Google",
    });
    await act(() => fireEvent.click(loginButtonElement));

    await waitFor(() => expect(store.getState().user.uid).toBe(""));
    await waitFor(() => expect(screen.getByText("Checking...")).toBeTruthy());
  });

  it("triggering login will rely on firestore module", async () => {
    fullRender(<AuthMain />);

    const loginButtonElement = screen.getByRole("button", {
      name: "Continue with Google",
    });
    await act(() => fireEvent.click(loginButtonElement));

    expect(firestoreAuth.login).toBeCalledTimes(1);
  });
});
