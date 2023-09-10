import fullRender from "../../testing-helpers/fullRender";
import Video from "./Video";

describe("Video", () => {
  it("renders", () => {
    const ref: { current: HTMLVideoElement | null } = { current: null };
    const { container } = fullRender(
      <Video ref={(el) => (ref.current = el)} />
    );
    expect(container).toBeInTheDocument();
  });

  it("renders video element with provided display name", () => {
    const ref: { current: HTMLVideoElement | null } = { current: null };
    const { getByText } = fullRender(
      <Video ref={(el) => (ref.current = el)} displayName="John Doe" />
    );

    expect(getByText("John Doe")).toBeInTheDocument();
  });
});
