export function makeStandardAudioConstraints(
  deviceId: string
): MediaTrackConstraints {
  return {
    deviceId: {
      exact: deviceId,
    },
    advanced: [
      { echoCancellation: { exact: true } },
      { autoGainControl: { exact: true } },
      { noiseSuppression: { exact: true } },
      // { highpassFilter: { exact: true } },
      // { audioMirroring: { exact: true } },
    ],
  };
}

export function makeStandardVideoConstraints(
  deviceId: string
): MediaTrackConstraints {
  return {
    deviceId: {
      exact: deviceId,
    },
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
  };
}
