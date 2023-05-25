import {
  startAudioPreview,
  AudioPreviewOptions,
} from "./media-devices-preview";

describe("startAudioPreview", () => {
  let audioPreviewOptions: AudioPreviewOptions;

  beforeEach(() => {
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: jest.fn().mockReturnValue([]),
        }),
      },
      writable: true,
      configurable: true,
    });

    window.AudioContext = jest.fn().mockImplementation(() => ({
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      createScriptProcessor: jest.fn().mockReturnValue({
        connect: jest.fn(),
        onaudioprocess: jest.fn(),
      }),
      close: jest.fn(),
    }));

    audioPreviewOptions = {
      audioInputDeviceId: "inputDeviceId",
      onResult: jest.fn(),
      visualGainRate: 1.5,
    };
  });

  it("starts audio preview is mainly an integration of GetUserMedia and AudioContext", async () => {
    await startAudioPreview(audioPreviewOptions);

    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
  });

  it("the start command returns a cleanup function that can stop stream tracks and closes AudioContext to free resources", async () => {
    const mockTrackStop = jest.fn();

    // Override the mocked getUserMedia to return a stream with a mock track
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: jest.fn().mockReturnValue([
            {
              stop: mockTrackStop,
            },
          ]),
        }),
      },
      writable: true,
      configurable: true,
    });

    const mockClose = jest.fn();
    window.AudioContext = jest.fn().mockImplementation(() => ({
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      createScriptProcessor: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      close: mockClose,
    }));

    const cleanup = await startAudioPreview(audioPreviewOptions);

    // manually call cleanup, desired for this particular use case.
    expect(cleanup).toBeInstanceOf(Function);
    cleanup();

    // consequences of the manual cleanup.
    expect(mockTrackStop).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  it("will automatically will do cleanup if something goes wrong", async () => {
    expect.assertions(3);

    const mockTrackStop = jest.fn();
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: jest.fn().mockReturnValue([
            {
              stop: mockTrackStop,
            },
          ]),
        }),
      },
      writable: true,
      configurable: true,
    });

    const mockClose = jest.fn();
    window.AudioContext = jest.fn().mockImplementation(() => ({
      createMediaStreamSource: jest.fn().mockImplementation(() => {
        throw new Error("Some error.");
      }),
      close: mockClose,
    }));

    try {
      await startAudioPreview(audioPreviewOptions);
    } catch (e: unknown) {
      expect((e as Error).message).toBe("Some error.");
      expect(mockTrackStop).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    }
  });

  it("calls onResult callback with a given percentage", async () => {
    const inputData = Float32Array.from([0.5, -0.5, 0.5]);

    const audioProcessingEvent = {
      inputBuffer: {
        getChannelData: jest.fn().mockReturnValue(inputData),
      },
    };

    window.AudioContext = jest.fn().mockImplementation(() => ({
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      createScriptProcessor: jest.fn().mockReturnValue({
        connect: jest.fn(),
        // setting a callback will automatically call it once.
        set onaudioprocess(fn: jest.Mock) {
          fn(audioProcessingEvent);
        },
      }),
      close: jest.fn(),
    }));

    const mockOnResult = jest.fn();

    // finally, let's do it!
    await startAudioPreview({
      audioInputDeviceId: "default",
      onResult: mockOnResult,
      visualGainRate: 1,
    });

    // Given the three 0.5 data pieces of `inputData`, its total is 1.5 and
    // its RMS is ~0.708, thus implicating in 71% percentage
    // of voice activity after calcs and ceilings.
    expect(mockOnResult).toHaveBeenCalledWith(71);
  });
});
