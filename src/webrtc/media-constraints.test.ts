import {
  makeStandardAudioConstraints,
  makeStandardVideoConstraints,
} from "./media-constraints";

describe("Media Constraints", () => {
  test("should make standard audio constraints correctly", () => {
    const deviceId = "mockDeviceId";
    const result = makeStandardAudioConstraints(deviceId);

    expect(result).toEqual({
      deviceId: {
        exact: deviceId,
      },
      advanced: [
        { echoCancellation: { exact: true } },
        { autoGainControl: { exact: true } },
        { noiseSuppression: { exact: true } },
      ],
    });
  });

  test("should return default audio constraints when deviceId is true", () => {
    const result = makeStandardAudioConstraints(true);

    expect(result).toEqual({
      advanced: [
        { echoCancellation: { exact: true } },
        { autoGainControl: { exact: true } },
        { noiseSuppression: { exact: true } },
      ],
    });
  });

  test("should return false when deviceId is false or undefined", () => {
    expect(makeStandardAudioConstraints(false)).toEqual(false);
    expect(makeStandardAudioConstraints(undefined)).toEqual(false);
  });

  test("should make standard video constraints correctly", () => {
    const deviceId = "mockDeviceId";
    const result = makeStandardVideoConstraints(deviceId);

    expect(result).toEqual({
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
    });
  });

  test("should return default video constraints when deviceId is true", () => {
    const result = makeStandardVideoConstraints(true);

    expect(result).toEqual({
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
  });

  test("should return false when deviceId is false or undefined", () => {
    expect(makeStandardVideoConstraints(false)).toEqual(false);
    expect(makeStandardVideoConstraints(undefined)).toEqual(false);
  });
});
