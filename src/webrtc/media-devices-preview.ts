export type PreviewCleanup = () => void;

export interface AudioPreviewOptions {
  audioInputDeviceId: string;
  onPercentage: (percentage: number) => void;
  visualGainRate?: number;
}

export async function startAudioPreview({
  audioInputDeviceId,
  onPercentage,
  visualGainRate = 1.5,
}: AudioPreviewOptions): Promise<PreviewCleanup> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { deviceId: audioInputDeviceId },
    video: false,
  });

  const audioContext = new AudioContext();

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    if (audioContext) {
      audioContext.close();
    }
  };

  try {
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(2048, 1, 1);

    mediaStreamSource.connect(audioContext.destination); // echo?
    mediaStreamSource.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (event) => {
      try {
        const inputData = event.inputBuffer.getChannelData(0);
        const total = inputData.reduce((acc, it) => acc + Math.abs(it), 0);
        const rootMeanSquare = Math.sqrt(total / inputData.length);
        const rawPercentage = rootMeanSquare * 100;
        const unsafeGainedPercentage = rawPercentage * visualGainRate;
        const percentage =
          Math.ceil(unsafeGainedPercentage) >= 100
            ? 100
            : Math.ceil(unsafeGainedPercentage);
        onPercentage(percentage);
      } catch (error) {
        cleanup();
        processor.onaudioprocess = null;
      }
    };
  } catch (error) {
    cleanup();
    throw error;
  }

  return cleanup;
}

export interface VideoPreviewOptions {
  videoInputDeviceId: string;
  onStream: (stream: MediaStream | null) => void;
}

export async function startVideoPreview({
  videoInputDeviceId,
  onStream,
}: VideoPreviewOptions): Promise<PreviewCleanup> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { deviceId: videoInputDeviceId },
  });

  const cleanup = () => stream.getTracks().forEach((t) => t.stop());

  try {
    onStream(stream);
  } catch (error) {
    cleanup();
    throw error;
  }

  return cleanup;
}
