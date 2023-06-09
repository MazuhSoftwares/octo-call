import "../../testing-helpers/mock-firestore-signaling";
import CallCreationMain from "./CallCreationMain";
import { act, fireEvent, screen } from "@testing-library/react";
import webrtc from "../../webrtc";
import fullRender from "../../testing-helpers/fullRender";
import firestoreSignaling from "../../services/firestore-signaling";
import { userInitialState } from "../../state/user";
import { devicesInitialState } from "../../state/devices";

jest.mock("../../webrtc", () => ({
  agentHelpers: {
    isChromeBased: jest.fn(() => true),
    isFirefoxBased: jest.fn(() => false),
    isSafariBased: jest.fn(() => false),
    canRunWebRTC: jest.fn(() => true),
  },
  retrieveMediaInputs: jest.fn(),
}));

describe("CallCreationMain", () => {
  beforeEach(() => {
    (firestoreSignaling.createCall as jest.Mock).mockClear();
    (firestoreSignaling.askToJoinCall as jest.Mock).mockClear();

    (webrtc.retrieveMediaInputs as jest.Mock).mockResolvedValue([
      {
        deviceId: "my-mic-42",
        kind: "audioinput",
        label: "My Mic 42",
      },
    ]);
  });

  it("renders", async () => {
    await act(() => fullRender(<CallCreationMain />));
  });

  it("call creation is integrated with firebase", async () => {
    await act(() =>
      fullRender(<CallCreationMain />, {
        preloadedState: {
          user: {
            ...userInitialState,
            uid: "1m2kkn3",
            displayName: "John Doe",
            status: "authenticated",
          },
          devices: {
            ...devicesInitialState,
            userAudioId: "my-mic-42",
          },
        },
      })
    );

    const callNameInputElement = screen.getByLabelText("Call public name:");

    const callCreationButtonElement = screen.getByRole("button", {
      name: "Create call",
    });

    fireEvent.change(callNameInputElement, { target: { value: "Daily" } });
    await act(() => fireEvent.click(callCreationButtonElement));

    expect(firestoreSignaling.createCall).toBeCalledTimes(1);
  });

  it("can not create call if has no device", async () => {
    await act(() =>
      fullRender(<CallCreationMain />, {
        preloadedState: {
          user: {
            ...userInitialState,
            uid: "1m2kkn3",
            displayName: "John Doe",
            status: "authenticated",
          },
        },
      })
    );

    // unselect the default device found by the webrtc module
    await act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Toggle microphone" }))
    );

    expect(
      screen.queryByRole("button", {
        name: "Create call",
      })
    ).toBe(null);
    expect(
      screen.getByText(
        "At least one enabled device is required to create call."
      )
    ).toBeVisible();
  });
});
