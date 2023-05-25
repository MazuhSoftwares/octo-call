import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import AudioInputSelector from "./AudioInputSelector";
import fullRender from "../../testing-helpers/fullRender";
import webrtc from "../../webrtc";
import { devicesInitialState } from "../../state/devices";

jest.mock("../../webrtc", () => ({
  retrieveMediaInputs: jest.fn(),
  startAudioPreview: jest.fn(),
}));

describe("AudioInputSelector", () => {
  beforeEach(() => {
    (webrtc.retrieveMediaInputs as jest.Mock).mockReset();
    (webrtc.retrieveMediaInputs as jest.Mock).mockResolvedValue([
      {
        deviceId: "111a",
        kind: "audioinput",
        label: "Microphone 1 (gathered from WebRTC API)",
      },
      {
        deviceId: "222b",
        kind: "audioinput",
        label: "Microphone 2 (gathered from WebRTC API)",
      },
    ]);

    (webrtc.startAudioPreview as jest.Mock).mockReset();
    (webrtc.startAudioPreview as jest.Mock).mockResolvedValue(() => null);
  });

  it("renders", async () => {
    await act(() => fullRender(<AudioInputSelector />));

    await waitFor(() => screen.getByText(/Audio input/));
  });

  it("displays errors from webrtc", async () => {
    (webrtc.retrieveMediaInputs as jest.Mock).mockRejectedValue(
      new Error("Permission denied.")
    );

    await act(() => fullRender(<AudioInputSelector />));

    await waitFor(() => screen.getByText(/Permission denied./));
  });

  it("shows options from webrtc", async () => {
    await act(() => fullRender(<AudioInputSelector />));

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Disabled microphone" })
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        screen.getByRole("option", {
          name: "Microphone 1 (gathered from WebRTC API)",
        })
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        screen.getByRole("option", {
          name: "Microphone 2 (gathered from WebRTC API)",
        })
      ).toBeInTheDocument()
    );
  });

  it("can select an audio", async () => {
    await act(() => fullRender(<AudioInputSelector />));

    const selectEl = screen.getByRole("combobox");
    const optionEl = screen.getByRole("option", {
      name: "Microphone 2 (gathered from WebRTC API)",
    });
    fireEvent.change(selectEl, {
      target: { value: optionEl.getAttribute("value") },
    });

    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveValue(
        optionEl.getAttribute("value")
      )
    );
  });

  it("can unselect the audio", async () => {
    await act(() =>
      fullRender(<AudioInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userAudioId: "222b",
            userAudioLabel: "Microphone 2 (gathered from WebRTC API)",
          },
        },
      })
    );

    const selectEl = screen.getByRole("combobox");
    const optionEl = screen.getByRole("option", {
      name: "Disabled microphone",
    });
    fireEvent.change(selectEl, {
      target: { value: optionEl.getAttribute("value") },
    });

    await waitFor(() => expect(screen.getByRole("combobox")).toHaveValue(""));
  });

  it("finds a fixed equivalent device id from webrtc module after loading outdated id from state", async () => {
    await act(() =>
      fullRender(<AudioInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userAudioId: "123outdated321",
            userAudioLabel: "Microphone 2 (gathered from WebRTC API)",
          },
        },
      })
    );

    const optionEl = screen.getByRole("option", {
      name: "Microphone 2 (gathered from WebRTC API)",
    });
    await waitFor(() => expect(optionEl).toHaveValue("222b"));

    const selectEl = screen.getByRole("combobox");
    expect(selectEl).toHaveValue("222b");
  });

  it("resets selected device to a default if state mod has nothing close to what webrtc mod found", async () => {
    await act(() =>
      fullRender(<AudioInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userAudioId: "666",
            userAudioLabel: "Microphone 666 (maybe an unpluged accessory)",
          },
        },
      })
    );

    const selectEl = screen.getByRole("combobox");
    await waitFor(() => expect(selectEl).toHaveValue("111a"));
  });

  it("clears selected device if state mod has no options from webrtc mod", async () => {
    (webrtc.retrieveMediaInputs as jest.Mock).mockResolvedValue([]);

    await act(() =>
      fullRender(<AudioInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userAudioId: "666",
            userAudioLabel: "Microphone 666 (maybe an unpluged accessory)",
          },
        },
      })
    );

    const selectEl = screen.getByRole("combobox");
    await waitFor(() => expect(selectEl).toHaveValue(""));
  });

  it("integrates with webrtc module to preview the (initial) selected device", async () => {
    await act(() => fullRender(<AudioInputSelector />));

    await waitFor(() =>
      expect(webrtc.startAudioPreview).toHaveBeenCalledTimes(1)
    );

    const firstCall = (webrtc.startAudioPreview as jest.Mock).mock.calls[0];
    const [arg0] = firstCall;
    expect(arg0.audioInputDeviceId).toBe("111a");
  });

  it("integrates with webrtc module to stop a preview before selecting another", async () => {
    const stopMock = jest.fn();
    (webrtc.startAudioPreview as jest.Mock).mockResolvedValue(stopMock);

    await act(() => fullRender(<AudioInputSelector />));

    const selectEl = screen.getByRole("combobox");
    const optionEl = screen.getByRole("option", {
      name: "Microphone 2 (gathered from WebRTC API)",
    });
    await act(() =>
      fireEvent.change(selectEl, {
        target: { value: optionEl.getAttribute("value") },
      })
    );

    expect(stopMock).toBeCalledTimes(1);

    expect(webrtc.startAudioPreview).toBeCalledTimes(2);
    const secondCall = (webrtc.startAudioPreview as jest.Mock).mock.calls[1];
    const [arg0] = secondCall;
    expect(arg0.audioInputDeviceId).toBe("222b");
  });
});
