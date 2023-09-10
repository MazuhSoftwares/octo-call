import {
  initVideoElement,
  attachLocalStream,
  attachRemoteStream,
} from "./dom-helpers";

describe("DOM helpers", () => {
  const mockStream = {
    active: true,
    getTracks: jest.fn(),
  } as unknown as MediaStream;

  it("initializes a video element, becoming muted and with common WebRTC call attributes", () => {
    const video = document.createElement("video");

    initVideoElement(video);

    expect(video.muted).toBe(true);

    expect(video.disablePictureInPicture).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(video.playsInline).toBe(true);
  });

  it("does not initialize a non-video element, and prints a soft error", () => {
    const div = document.createElement("div");
    const consoleSpy = jest.spyOn(console, "error");

    initVideoElement(div as unknown as HTMLVideoElement);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toBe(
      "Programming error: expected a video tag element but got something else."
    );
  });

  it("attaches a local stream correctly, mirroed", () => {
    const video = document.createElement("video");

    attachLocalStream(video, mockStream);

    expect(video.srcObject).toBe(mockStream);
    expect(video.style.transform).toBe("scale(-1, 1)");
  });

  it("attaches a remote stream correctly, also unmutes it", () => {
    const video = document.createElement("video");

    attachRemoteStream(video, mockStream);

    expect(video.srcObject).toBe(mockStream);
    expect(video.muted).toBe(false);
  });

  it("ignores attachment of local null, not creating runtime errors", () => {
    attachLocalStream(null as unknown as HTMLVideoElement, mockStream);
  });

  it("ignores attachment of remote null, not creating runtime errors", () => {
    attachRemoteStream(null as unknown as HTMLVideoElement, mockStream);
  });
});
