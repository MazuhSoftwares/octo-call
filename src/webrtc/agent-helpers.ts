import adapter from "webrtc-adapter";

export function isChromeBased(): boolean {
  return adapter.browserDetails.browser === "chrome";
}

export function isFirefoxBased(): boolean {
  return adapter.browserDetails.browser === "firefox";
}

export function isSafariBased(): boolean {
  return adapter.browserDetails.browser === "safari";
}

export function canRunWebRTC(): boolean {
  // well, adapterjs must at least know it, so it can provide the assumed API.
  return Boolean(adapter.browserDetails.browser && window.RTCPeerConnection);
}
