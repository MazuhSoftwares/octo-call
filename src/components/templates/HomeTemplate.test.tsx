import "../../testing-helpers/mock-firestore-auth";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import HomeTemplate from "../templates/HomeTemplate";
import fullRender from "../../testing-helpers/fullRender";
import firestoreAuth from "../../services/firestore-auth";
import { userInitialState } from "../../state/user";

jest.mock("../../webrtc", () => ({
  agentHelpers: {
    isChromeBased: jest.fn(() => true),
    isFirefoxBased: jest.fn(() => false),
    isSafariBased: jest.fn(() => false),
    canRunWebRTC: jest.fn(() => true),
  },
}));

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

  it("shows error if user is using unsuportted browser", () => {
    (
      jest.requireMock("../../webrtc").agentHelpers.canRunWebRTC as jest.Mock
    ).mockReturnValueOnce(false);

    fullRender(
      <HomeTemplate>
        <p>Hello World!</p>
      </HomeTemplate>
    );

    expect(
      screen.getByText(
        "This browser does not fully implement WebRTC technology. This app won't work."
      )
    ).toBeVisible();
  });

  it("shows warning if user is using Safari", () => {
    (
      jest.requireMock("../../webrtc").agentHelpers.canRunWebRTC as jest.Mock
    ).mockReturnValueOnce(true);
    (
      jest.requireMock("../../webrtc").agentHelpers.isChromeBased as jest.Mock
    ).mockReturnValueOnce(false);
    (
      jest.requireMock("../../webrtc").agentHelpers.isFirefoxBased as jest.Mock
    ).mockReturnValueOnce(false);
    (
      jest.requireMock("../../webrtc").agentHelpers.isSafariBased as jest.Mock
    ).mockReturnValueOnce(true);

    fullRender(
      <HomeTemplate>
        <p>Hello World!</p>
      </HomeTemplate>
    );

    expect(
      screen.getByText("Recommended browsers are any Chrome-based or Firefox.")
    ).toBeVisible();
  });

  it("does not show any error or warning if user is in Chrome", () => {
    (
      jest.requireMock("../../webrtc").agentHelpers.canRunWebRTC as jest.Mock
    ).mockReturnValueOnce(true);
    (
      jest.requireMock("../../webrtc").agentHelpers.isChromeBased as jest.Mock
    ).mockReturnValueOnce(true);
    (
      jest.requireMock("../../webrtc").agentHelpers.isFirefoxBased as jest.Mock
    ).mockReturnValueOnce(false);
    (
      jest.requireMock("../../webrtc").agentHelpers.isSafariBased as jest.Mock
    ).mockReturnValueOnce(false);

    fullRender(
      <HomeTemplate>
        <p>Hello World!</p>
      </HomeTemplate>
    );

    expect(
      screen.queryByText(
        "This browser does not fully implement WebRTC technology. This app won't work."
      )
    ).toBe(null);

    expect(
      screen.queryByText(
        "Recommended browsers are any Chrome-based or Firefox."
      )
    ).toBe(null);
  });
});
