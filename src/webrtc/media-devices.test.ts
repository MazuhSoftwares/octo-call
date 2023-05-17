import { retrieveMediaInputs } from "./media-devices";

describe("retrieveMediaInputs", () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn(() =>
          Promise.resolve({ getTracks: jest.fn(() => [{ stop: jest.fn() }]) })
        ),
        enumerateDevices: jest.fn(() =>
          Promise.resolve([
            {
              deviceId: "111a",
              kind: "audioinput",
              label: "Microphone 1 (gathered from WebRTC API)",
            },
            {
              deviceId: "222b",
              kind: "audioinput",
              label: "Microphone 2 (gathered from WebRTC API)",
            },
            {
              deviceId: "333c",
              kind: "videoinput",
              label: "Webcam A (gathered from WebRTC API)",
            },
            {
              deviceId: "444d",
              kind: "videoinput",
              label: "Webcam B (gathered from WebRTC API)",
            },
            {
              deviceId: "555e",
              kind: "audiooutput",
              label: "Speakers I (gathered from WebRTC API)",
            },
            {
              deviceId: "666f",
              kind: "audiooutput",
              label: "Speakers II (gathered from WebRTC API)",
            },
          ])
        ),
      },
      writable: true,
    });
  });

  it("should retrieve audio inputs", async () => {
    const expected = [
      {
        deviceId: "111a",
        kind: "audioinput",
        label: "Microphone 1 (gathered from WebRTC API)",
      },
      {
        deviceId: "222b",
        kind: "audioinput",
        label: "Microphone 2 (gathered from WebRTC API)",
      },
    ];

    const result = await retrieveMediaInputs("audio");

    expect(result).toEqual(expected);
  });

  it("should retrieve video inputs", async () => {
    const expected = [
      {
        deviceId: "333c",
        kind: "videoinput",
        label: "Webcam A (gathered from WebRTC API)",
      },
      {
        deviceId: "444d",
        kind: "videoinput",
        label: "Webcam B (gathered from WebRTC API)",
      },
    ];

    const result = await retrieveMediaInputs("video");

    expect(result).toEqual(expected);
  });

  it("should not call getUserMedia if enumerated devices already have labels", async () => {
    await retrieveMediaInputs("audio");

    expect(global.navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it("should call getUserMedia only once if enumerated devices have no labels", async () => {
    (
      global.navigator.mediaDevices.enumerateDevices as jest.Mock
    ).mockResolvedValue([
      { deviceId: "111a", kind: "audioinput", label: "" },
      { deviceId: "222b", kind: "audioinput", label: "" },
      {
        deviceId: "333c",
        kind: "videoinput",
        label: "Webcam A (gathered from WebRTC API)",
      },
      {
        deviceId: "555e",
        kind: "audiooutput",
        label: "Speakers I (gathered from WebRTC API)",
      },
    ]);

    await retrieveMediaInputs("audio").catch(() => null);

    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("triggers permission error if it can find devices but having empty labels", async () => {
    expect.assertions(1);

    (
      global.navigator.mediaDevices.enumerateDevices as jest.Mock
    ).mockResolvedValue([
      { deviceId: "111a", kind: "audioinput", label: "" },
      { deviceId: "222b", kind: "audioinput", label: "" },
      {
        deviceId: "333c",
        kind: "videoinput",
        label: "Webcam A (gathered from WebRTC API)",
      },
      {
        deviceId: "555e",
        kind: "audiooutput",
        label: "Speakers I (gathered from WebRTC API)",
      },
    ]);

    try {
      await retrieveMediaInputs("audio");
    } catch (error) {
      expect(error).toEqual(
        new Error(
          "Detected that only temporary permissions were given, but that's not enough."
        )
      );
    }
  });
});
