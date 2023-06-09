import {
  isChromeBased,
  isFirefoxBased,
  isSafariBased,
  canRunWebRTC,
} from "./agent-helpers";

jest.mock("webrtc-adapter", () => ({
  browserDetails: {
    browser: "",
  },
}));

describe("Browser Detection Module", () => {
  beforeEach(() => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "chrome";
    window.RTCPeerConnection = jest.fn(() => ({})) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  it("correctly detects Chrome-based browser", () => {
    expect(isChromeBased()).toBeTruthy();
  });

  it("does not falsely detect non-Chrome-based browser", () => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "firefox";

    expect(isChromeBased()).toBeFalsy();
  });

  it("correctly detects Firefox-based browser", () => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "firefox";

    expect(isFirefoxBased()).toBeTruthy();
  });

  it("does not falsely detect non-Firefox-based browser", () => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "chrome";

    expect(isFirefoxBased()).toBeFalsy();
  });

  it("correctly detects Safari-based browser", () => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "safari";

    expect(isSafariBased()).toBeTruthy();
  });

  it("does not falsely detect non-Safari-based browser", () => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "chrome";

    expect(isSafariBased()).toBeFalsy();
  });

  it("can run WebRTC when browser is detected and RTCPeerConnection is available", () => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "chrome";
    window.RTCPeerConnection = jest.fn(() => ({})) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(canRunWebRTC()).toBeTruthy();
  });

  it("cannot run WebRTC if adapterjs doesnt support it", () => {
    jest.requireMock("webrtc-adapter").browserDetails.browser = "";
    expect(canRunWebRTC()).toBeFalsy();
  });

  it("cannot run WebRTC if RTCPeerConnection doesnt exist", () => {
    global.window.RTCPeerConnection = null as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(canRunWebRTC()).toBeFalsy();
  });
});
