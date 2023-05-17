import { screen, waitFor } from "@testing-library/react";
import VideoInputSelector from "./VideoInputSelector";
import fullRender from "../../testing-helpers/fullRender";
import webrtc from "../../webrtc";

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
});
