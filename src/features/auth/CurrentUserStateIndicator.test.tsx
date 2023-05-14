import "../../testing-helpers/mock-firestore-auth";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import firestoreAuth from "../../services/firestore-auth";
import { CurrentUserStateIndicator } from "./CurrentUserStateIndicator";
import fullRender from "../../testing-helpers/fullRender";
import { userInitialState } from "../../state/user";

describe("CurrentUserStateIndicator", () => {
  beforeEach(() => {
    (firestoreAuth.login as jest.Mock).mockClear();
    (firestoreAuth.logoff as jest.Mock).mockClear();
  });

  it("should render the current user name", async () => {
    const { container } = fullRender(<CurrentUserStateIndicator />);

    const loginButtonElement = screen.getByRole("button", { name: "Login" });
    await act(() => fireEvent.click(loginButtonElement));

    await waitFor(() => expect(container.textContent).toMatch(/Jane Doe/));
  });

  it("should render the current user status", () => {
    const { container } = fullRender(<CurrentUserStateIndicator />);
    expect(container.textContent).toMatch(/User status is idle/);
  });

  it("can login", async () => {
    const { container } = fullRender(<CurrentUserStateIndicator />);

    const loginButtonElement = screen.getByRole("button", { name: "Login" });
    await act(() => fireEvent.click(loginButtonElement));

    await waitFor(() =>
      expect(container.textContent).toMatch(/User status is authenticated/)
    );
  });

  it("login is integrated with firestore", async () => {
    fullRender(<CurrentUserStateIndicator />);

    const loginButtonElement = screen.getByRole("button", { name: "Login" });
    await act(() => fireEvent.click(loginButtonElement));

    expect(firestoreAuth.login).toBeCalledTimes(1);
  });

  it("can logoff", async () => {
    const { container } = fullRender(<CurrentUserStateIndicator />, {
      preloadedState: {
        user: { ...userInitialState, status: "authenticated" },
      },
    });

    const logoffButtonElement = screen.getByRole("button", { name: "Logoff" });
    await act(() => fireEvent.click(logoffButtonElement));

    await waitFor(() =>
      expect(container.textContent).toMatch(/User status is idle/)
    );
  });

  it("logoff is integrated with firestore", async () => {
    fullRender(<CurrentUserStateIndicator />, {
      preloadedState: {
        user: { ...userInitialState, status: "authenticated" },
      },
    });

    const logoffButtonElement = screen.getByRole("button", { name: "Logoff" });
    await act(() => fireEvent.click(logoffButtonElement));

    expect(firestoreAuth.logoff).toBeCalledTimes(1);
  });
});
