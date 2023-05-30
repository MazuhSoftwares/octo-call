export function makeStandardAudioConstraints(
  deviceId: string | boolean | undefined
): MediaTrackConstraints | false {
  if (!deviceId) {
    return false;
  }

  if (typeof deviceId === "boolean") {
    return stdAudioConstraints;
  }

  return {
    deviceId: {
      exact: deviceId,
    },
    ...stdAudioConstraints,
  };
}

const stdAudioConstraints: MediaTrackConstraints = Object.freeze({
  advanced: [
    { echoCancellation: { exact: true } },
    { autoGainControl: { exact: true } },
    { noiseSuppression: { exact: true } },
    // { highpassFilter: { exact: true } },
    // { audioMirroring: { exact: true } },
  ],
});

export function makeStandardVideoConstraints(
  deviceId: string | boolean | undefined
): MediaTrackConstraints | false {
  if (!deviceId) {
    return false;
  }

  if (typeof deviceId === "boolean") {
    return stdVideoConstraints;
  }

  return {
    deviceId: {
      exact: deviceId,
    },
    ...stdVideoConstraints,
  };
}

const stdVideoConstraints: MediaTrackConstraints = Object.freeze({
  width: { ideal: 1280 },
  height: { ideal: 720 },
  advanced: [
    { frameRate: { min: 30 } },
    { frameRate: { max: 30 } },
    { width: { min: 1280 } },
    { width: { max: 1280 } },
    { height: { min: 720 } },
    { height: { max: 720 } },
    { aspectRatio: { exact: 1.77778 } },
  ],
});
