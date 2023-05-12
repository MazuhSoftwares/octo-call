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

  it("should return empty array for non-existing inputs", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await retrieveMediaInputs("non-existent" as any);

    expect(result).toEqual([]);
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

    await retrieveMediaInputs("audio");

    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });
});
