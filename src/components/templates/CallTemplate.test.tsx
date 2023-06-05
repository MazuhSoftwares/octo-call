import "../../testing-helpers/mock-firestore-signaling";
import { fireEvent, screen } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import CallTemplate from "./CallTemplate";
import type { PreloadedAppState } from "../../state";
import { userInitialState } from "../../state/user";
import { callInitialState } from "../../state/call";

describe("CallTemplate", () => {
  const preloadedState: PreloadedAppState = {
    user: {
      ...userInitialState,
      uid: "1m2kkn3",
      displayName: "John Doe",
      status: "authenticated",
    },
    call: {
      ...callInitialState,
      uid: "c2a35f1f-46ea-4dab-a476-505a4b1b1c95",
      displayName: "1:1 Jane Doe + John Doe",
      hostId: "UOpsZn96IJUn8Jc2c8YFIcGRpzj1",
      hostDisplayName: "Jane Doe",
      status: "inProgress",
    },
  };

  it("renders", async () => {
    fullRender(<CallTemplate>Call.</CallTemplate>, { preloadedState });

    const participantsModal = await screen.findByText(
      "1:1 Jane Doe + John Doe"
    );
    expect(participantsModal).toBeInTheDocument();
  });

  it("redirects elsewhere if it is not in call", async () => {
    fullRender(<CallTemplate>Call.</CallTemplate>, {
      preloadedState: {
        call: callInitialState,
      },
    });
    const participantsModal = screen.queryByText("1:1 Jane Doe + John Doe");
    expect(participantsModal).toBe(null);
  });

  it("can show participants modal", async () => {
    fullRender(<CallTemplate>Call.</CallTemplate>, { preloadedState });

    const participantsButton = screen.getByRole("button", {
      name: "Participants",
    });
    fireEvent.click(participantsButton);
    const participantsModal = await screen.findByText(/Participants/);
    expect(participantsModal).toBeInTheDocument();
  });

  it("toggles microphone status", () => {
    fullRender(<CallTemplate>Call.</CallTemplate>, { preloadedState });
    const micButton = screen.getByTitle("Toggle microphone");
    expect(screen.getByText("Microphone is on.")).toBeInTheDocument();

    fireEvent.click(micButton);
    expect(screen.getByText("Microphone is off.")).toBeInTheDocument();

    fireEvent.click(micButton);
    expect(screen.getByText("Microphone is on.")).toBeInTheDocument();
  });

  it("toggles camera status", () => {
    fullRender(<CallTemplate>Call.</CallTemplate>, { preloadedState });
    const camButton = screen.getByTitle("Toggle camera");
    expect(screen.getByText("Camera is off.")).toBeInTheDocument();

    fireEvent.click(camButton);
    expect(screen.getByText("Camera is on.")).toBeInTheDocument();

    fireEvent.click(camButton);
    expect(screen.getByText("Camera is off.")).toBeInTheDocument();
  });
});
