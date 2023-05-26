import { act, fireEvent } from "@testing-library/react";
import fullRender from "../../testing-helpers/fullRender";
import SettingsModal from "./SettingsModal";

describe("SettingsModal", () => {
  it("should render the SettingsModal when isOpen is true", async () => {
    const { queryByRole } = await act(() =>
      fullRender(<SettingsModal isOpen={true} close={() => null} />)
    );
    const dialog = queryByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should not render the SettingsModal when isOpen is false", async () => {
    const { queryByRole } = await act(() =>
      fullRender(<SettingsModal isOpen={false} close={() => null} />)
    );
    const dialog = queryByRole("dialog");
    expect(dialog).not.toBeInTheDocument();
  });

  it("should render the correct tabs", async () => {
    const { getByText } = await act(() =>
      fullRender(<SettingsModal isOpen={true} close={() => null} />)
    );
    const audioTab = getByText("Microphone");
    const videoTab = getByText("Camera");
    expect(audioTab).toBeInTheDocument();
    expect(videoTab).toBeInTheDocument();
  });

  it("should render the correct content when a tab is selected", async () => {
    const { getByText, queryByText } = await act(() =>
      fullRender(<SettingsModal isOpen={true} close={() => null} />)
    );
    const audioTab = getByText("Microphone");
    fireEvent.click(audioTab);
    expect(queryByText("Audio input")).toBeVisible();
    expect(queryByText("Video input")).toBe(null);

    const videoTab = getByText("Camera");
    fireEvent.click(videoTab);
    expect(queryByText("Audio input")).toBe(null);
    expect(queryByText("Video input")).toBeVisible();
  });

  it("should close when the close button is clicked", async () => {
    const closeFunction = jest.fn();
    const { getByLabelText } = await act(() =>
      fullRender(<SettingsModal isOpen={true} close={closeFunction} />)
    );
    const closeButton = getByLabelText("Close");
    fireEvent.click(closeButton);
    expect(closeFunction).toHaveBeenCalledTimes(1);
  });
});
