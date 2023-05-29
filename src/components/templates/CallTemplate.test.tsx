import { fireEvent, screen } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import CallTemplate from "./CallTemplate";

describe("CallTemplate", () => {
  it("can show participants modal", async () => {
    fullRender(<CallTemplate>Call.</CallTemplate>);

    const participantsButton = screen.getByRole("button", {
      name: "Participants",
    });
    fireEvent.click(participantsButton);
    const participantsModal = await screen.findByText(/Participants/);
    expect(participantsModal).toBeInTheDocument();
  });

  it("toggles microphone status", () => {
    fullRender(<CallTemplate>Call.</CallTemplate>);
    const micButton = screen.getByTitle("Toggle microphone");
    expect(screen.getByText("Microphone is on.")).toBeInTheDocument();

    fireEvent.click(micButton);
    expect(screen.getByText("Microphone is off.")).toBeInTheDocument();

    fireEvent.click(micButton);
    expect(screen.getByText("Microphone is on.")).toBeInTheDocument();
  });

  it("toggles camera status", () => {
    fullRender(<CallTemplate>Call.</CallTemplate>);
    const camButton = screen.getByTitle("Toggle camera");
    expect(screen.getByText("Camera is off.")).toBeInTheDocument();

    fireEvent.click(camButton);
    expect(screen.getByText("Camera is on.")).toBeInTheDocument();

    fireEvent.click(camButton);
    expect(screen.getByText("Camera is off.")).toBeInTheDocument();
  });
});
