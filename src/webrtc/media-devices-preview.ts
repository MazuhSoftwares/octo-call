export type PreviewCleanup = () => void;

export interface AudioPreviewOptions {
  audioInputDeviceId: string;
  onResult: (percentage: number) => void;
  visualGainRate?: number;
}

export async function startAudioPreview({
  audioInputDeviceId,
  onResult,
  visualGainRate = 1.5,
}: AudioPreviewOptions): Promise<PreviewCleanup> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { deviceId: audioInputDeviceId },
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
        const inputDataLength = inputData.length;
        const total = inputData.reduce((acc, it) => acc + Math.abs(it), 0);
        const rootMeanSquare = Math.sqrt(total / inputDataLength);
        const rawPercentage = rootMeanSquare * 100;
        const unsafeGainedPercentage = rawPercentage * visualGainRate;
        const percentage =
          Math.ceil(unsafeGainedPercentage) >= 100
            ? 100
            : Math.ceil(unsafeGainedPercentage);
        onResult(percentage);
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
