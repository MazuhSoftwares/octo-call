export function initVideoElement(video: HTMLVideoElement) {
  if (!checkValidRuntimeVideoEl(video)) {
    return;
  }

  video.disablePictureInPicture = true;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;
}

export function attachLocalStream(
  video: HTMLVideoElement,
  stream: MediaStream | null
) {
  if (!checkValidRuntimeVideoEl(video)) {
    return;
  }

  video.srcObject = stream;

  if (!video.style.transform) {
    video.style.transform = "scale(-1, 1)";
  }
}

export function attachRemoteStream(
  video: HTMLVideoElement,
  stream: MediaStream | null
) {
  if (!checkValidRuntimeVideoEl(video)) {
    return;
  }

  video.srcObject = stream;
  video.muted = false;
}

function checkValidRuntimeVideoEl(element: HTMLElement): boolean {
  if (!element || element.tagName.toLowerCase() !== "video") {
    console.error(
      "Programming error: expected a video tag element but got something else.",
      element
    );
    return false;
  }

  return true;
}
