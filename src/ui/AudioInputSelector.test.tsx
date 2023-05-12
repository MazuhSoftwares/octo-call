import { screen, waitFor } from "@testing-library/react";
import AudioInputSelector from "./AudioInputSelector";
import fullRender from "../testing-helpers/fullRender";
import webrtc from "../webrtc";

jest.mock("../webrtc", () => ({
  retrieveMediaInputs: jest.fn(),
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
  });

  it("renders", async () => {
    fullRender(<AudioInputSelector />);

    await waitFor(() => screen.getByText(/Audio input/));
  });

  it("displays errors from webrtc", async () => {
    (webrtc.retrieveMediaInputs as jest.Mock).mockRejectedValue(
      new Error("Permission denied.")
    );

    fullRender(<AudioInputSelector />);

    await waitFor(() => screen.getByText(/Permission denied./));
  });

  it("shows options from webrtc", async () => {
    fullRender(<AudioInputSelector />);

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
});
