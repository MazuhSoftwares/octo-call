import "../../testing-helpers/mock-firestore-auth";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import HomeTemplate from "../templates/HomeTemplate";
import fullRender from "../../testing-helpers/fullRender";
import firestoreAuth from "../../services/firestore-auth";
import { userInitialState } from "../../state/user";

describe("HomeTemplate", () => {
  beforeEach(() => {
    (firestoreAuth.logout as jest.Mock).mockClear();
  });

  it("renders heading and a given content", () => {
    fullRender(
      <HomeTemplate>
        <p>Hello World!</p>
      </HomeTemplate>
    );

    expect(
      screen.getByRole("heading", { name: "Octo Call" })
    ).toBeInTheDocument();
    expect(screen.getByText("Hello World!")).toBeInTheDocument();
  });

  it("also renders subtitle along with existing heading and content", () => {
    fullRender(
      <HomeTemplate subtitle="Greetings">
        <p>Hello World!</p>
      </HomeTemplate>
    );

    expect(
      screen.getByRole("heading", { name: "Octo Call" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Greetings" })
    ).toBeInTheDocument();
    expect(screen.getByText("Hello World!")).toBeInTheDocument();
  });

  it("can logout", async () => {
    fullRender(
      <HomeTemplate>
        <p>Hello World!</p>
      </HomeTemplate>,
      {
        preloadedState: {
          user: { ...userInitialState, uid: "123", status: "authenticated" },
        },
      }
    );

    const ButtonElement = screen.getByRole("button", { name: "Logout" });
    expect(ButtonElement).toBeInTheDocument();

    await act(() => fireEvent.click(ButtonElement));

    await waitFor(() => expect(ButtonElement).not.toBeInTheDocument());
  });

  it("logout is integrated with firestore", async () => {
    fullRender(
      <HomeTemplate>
        <p>Hello World!</p>
      </HomeTemplate>,
      {
        preloadedState: {
          user: { ...userInitialState, uid: "123", status: "authenticated" },
        },
      }
    );

    const ButtonElement = screen.getByRole("button", { name: "Logout" });
    await act(() => fireEvent.click(ButtonElement));

    expect(firestoreAuth.logout).toBeCalledTimes(1);
  });
});