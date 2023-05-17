import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import VideoInputSelector from "./VideoInputSelector";
import fullRender from "../../testing-helpers/fullRender";
import webrtc from "../../webrtc";
import { devicesInitialState } from "../../state/devices";

jest.mock("../../webrtc", () => ({
  retrieveMediaInputs: jest.fn(),
}));

describe("VideoInputSelector", () => {
  beforeEach(() => {
    (webrtc.retrieveMediaInputs as jest.Mock).mockReset();
    (webrtc.retrieveMediaInputs as jest.Mock).mockResolvedValue([
      {
        deviceId: "333c",
        kind: "videoinput",
        label: "Webcam A (gathered from WebRTC API)",
      },
      {
        deviceId: "444d",
        kind: "videoinput",
        label: "Webcam B (gathered from WebRTC API)",
      },
    ]);
  });

  it("renders", async () => {
    fullRender(<VideoInputSelector />);

    await waitFor(() => screen.getByText(/Video input/));
  });

  it("displays errors from webrtc", async () => {
    (webrtc.retrieveMediaInputs as jest.Mock).mockRejectedValue(
      new Error("Permission denied.")
    );

    fullRender(<VideoInputSelector />);

    await waitFor(() => screen.getByText(/Permission denied./));
  });

  it("shows options from webrtc", async () => {
    fullRender(<VideoInputSelector />);

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Disabled camera" })
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        screen.getByRole("option", {
          name: "Webcam A (gathered from WebRTC API)",
        })
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        screen.getByRole("option", {
          name: "Webcam B (gathered from WebRTC API)",
        })
      ).toBeInTheDocument()
    );
  });

  it("can select a video", async () => {
    await act(() => fullRender(<VideoInputSelector />));

    const selectEl = screen.getByRole("combobox");
    const optionEl = screen.getByRole("option", {
      name: "Webcam B (gathered from WebRTC API)",
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

  it("can unselect a video", async () => {
    await act(() =>
      fullRender(<VideoInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userVideoId: "444d",
            userVideoLabel: "Webcam B (gathered from WebRTC API)",
          },
        },
      })
    );

    const selectEl = screen.getByRole("combobox");
    const optionEl = screen.getByRole("option", {
      name: "Disabled camera",
    });
    fireEvent.change(selectEl, {
      target: { value: optionEl.getAttribute("value") },
    });

    await waitFor(() => expect(screen.getByRole("combobox")).toHaveValue(""));
  });

  it("finds a fixed equivalent device id from webrtc module after loading outdated id from state", async () => {
    await act(() =>
      fullRender(<VideoInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userVideoId: "123outdated321",
            userVideoLabel: "Webcam B (gathered from WebRTC API)",
          },
        },
      })
    );

    const optionEl = screen.getByRole("option", {
      name: "Webcam B (gathered from WebRTC API)",
    });
    await waitFor(() => expect(optionEl).toHaveValue("444d"));

    const selectEl = screen.getByRole("combobox");
    await waitFor(() => expect(selectEl).toHaveValue("444d"));
  });

  it("resets selected device to a default if state mod has nothing close to what webrtc mod found", async () => {
    await act(() =>
      fullRender(<VideoInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userVideoId: "666",
            userVideoLabel: "Camera 666 (maybe an unpluged accessory)",
          },
        },
      })
    );

    const selectEl = screen.getByRole("combobox");
    await waitFor(() => expect(selectEl).toHaveValue("333c"));
  });

  it("clears selected device if state mod has no options from webrtc mod", async () => {
    (webrtc.retrieveMediaInputs as jest.Mock).mockResolvedValue([]);

    await act(() =>
      fullRender(<VideoInputSelector />, {
        preloadedState: {
          devices: {
            ...devicesInitialState,
            userVideoId: "666",
            userVideoLabel: "Camera 666 (maybe an unpluged accessory)",
          },
        },
      })
    );

    const selectEl = screen.getByRole("combobox");
    await waitFor(() => expect(selectEl).toHaveValue(""));
  });
});
