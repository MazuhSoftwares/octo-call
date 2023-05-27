import {
  startAudioPreview,
  AudioPreviewOptions,
  startVideoPreview,
  VideoPreviewOptions,
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
      audioInputDeviceId: "audio-device-123",
      onPercentage: jest.fn(),
      visualGainRate: 1.5,
    };
  });

  it("starts audio preview is mainly an integration of GetUserMedia and AudioContext", async () => {
    await startAudioPreview(audioPreviewOptions);

    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
  });

  it("the start command returns a cleanup function that stops stream tracks and closes AudioContext to free resources", async () => {
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
      createMediaStreamSource: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      createScriptProcessor: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      close: mockClose,
    }));

    // ok, doing it
    const cleanup = await startAudioPreview(audioPreviewOptions);

    // manually call cleanup, desired for this particular use case.
    expect(cleanup).toBeInstanceOf(Function);
    cleanup();

    // consequences of the manual cleanup.
    expect(mockTrackStop).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  it("will automatically do cleanup if something goes wrong", async () => {
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
      // consequences of automatic cleanup
      expect(mockTrackStop).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    }
  });

  it("calls onPercentage callback with a given percentage", async () => {
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

    const mockOnPercentage = jest.fn();

    // finally, let's do it!
    await startAudioPreview({
      audioInputDeviceId: "default",
      onPercentage: mockOnPercentage,
      visualGainRate: 1,
    });

    // Given the three 0.5 data pieces of `inputData`, its total is 1.5 and
    // its RMS is ~0.708, thus implicating in 71% percentage
    // of voice activity after calcs and ceilings.
    expect(mockOnPercentage).toHaveBeenCalledWith(71);
  });
});

describe("startVideoPreview", () => {
  let videoPreviewOptions: VideoPreviewOptions;

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

    videoPreviewOptions = {
      videoInputDeviceId: "video-device-123",
      onStream: jest.fn(),
    };
  });

  it("starts video preview is mainly an integration of GetUserMedia", async () => {
    await startVideoPreview(videoPreviewOptions);

    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("the start command returns a cleanup function that stops stream tracks to free resources", async () => {
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

    // ok, doing it
    const cleanup = await startVideoPreview(videoPreviewOptions);

    // manually call cleanup, desired for this particular use case.
    expect(cleanup).toBeInstanceOf(Function);
    cleanup();

    // consequences of the manual cleanup.
    expect(mockTrackStop).toHaveBeenCalled();
  });

  it("will automatically do cleanup if something goes wrong", async () => {
    expect.assertions(2);

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

    try {
      await startVideoPreview({
        ...videoPreviewOptions,
        onStream: () => {
          throw new Error("My own client error.");
        },
      });
    } catch (error: unknown) {
      expect((error as Error).message).toBe("My own client error.");
      expect(mockTrackStop).toHaveBeenCalled();
    }
  });

  it("calls stream callback with the native stream, so UI can attach it anywhere", async () => {
    const mockStream = { test: "native stream" };

    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });

    const mockOnStreamCb = jest.fn();
    await startVideoPreview({
      ...videoPreviewOptions,
      onStream: mockOnStreamCb,
    });

    expect(mockOnStreamCb).toHaveBeenCalledTimes(1);
    expect(mockOnStreamCb).toHaveBeenCalledWith(mockStream);
  });
});
