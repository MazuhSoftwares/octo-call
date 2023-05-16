import "../../testing-helpers/mock-firestore-auth";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import firestoreAuth from "../../services/firestore-auth";
import fullRender from "../../testing-helpers/fullRender";
import AuthMain from "./AuthMain";

describe("CurrentUserStateIndicator", () => {
  beforeEach(() => {
    (firestoreAuth.login as jest.Mock).mockClear();
  });

  it("can login", async () => {
    const { store } = fullRender(<AuthMain />);

    const loginButtonElement = screen.getByRole("button", {
      name: "Continue with Google",
    });
    await act(() => fireEvent.click(loginButtonElement));

    await waitFor(() => expect(store.getState().user.uid).not.toBe(""));
  });

  it("login is integrated with firestore", async () => {
    fullRender(<AuthMain />);

    const loginButtonElement = screen.getByRole("button", {
      name: "Continue with Google",
    });
    await act(() => fireEvent.click(loginButtonElement));

    expect(firestoreAuth.login).toBeCalledTimes(1);
  });
});
