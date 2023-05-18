import type { MediaDeviceData, MediaType } from ".";

export async function retrieveMediaPermission(type: MediaType): Promise<void> {
  const constraints: MediaStreamConstraints = { [type]: true };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  stream.getTracks().forEach(async (t) => t.stop());
}

export async function retrieveMediaInputs(
  type: MediaType,
  __isDeep = false
): Promise<MediaDeviceData[]> {
  const allNonSerializableDevices =
    await navigator.mediaDevices.enumerateDevices();
  const allDevices = allNonSerializableDevices.map((d) => ({
    deviceId: d.deviceId,
    kind: d.kind,
    label: d.label,
  }));
  const devices = allDevices.filter(
    (d) => d.kind === mediaTypeToInputKind(type)
  );

  const hasDevices = devices.length > 0;
  if (!hasDevices) {
    return [];
  }

  const areAllEmpty = devices.every((d) => !d.label);
  if (areAllEmpty && !__isDeep) {
    await retrieveMediaPermission(type);
    return retrieveMediaInputs(type, true);
  }

  if (areAllEmpty) {
    throw new Error(
      "Detected that only temporary permissions were given, but that's not enough."
    );
  }

  return devices;
}

export function spawnAudioMeter(
  audioInputDeviceId: string,
  onResult: (percentage: number) => void,
  visualGainRate = 1.5
): () => void {
  let isRunning = true;
  const checkStopCondition = ({
    stream,
    audioContext,
  }: {
    stream?: MediaStream;
    audioContext?: AudioContext;
  }): boolean => {
    if (isRunning) {
      return true;
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    if (audioContext) {
      audioContext.close();
    }

    return false;
  };

  navigator.mediaDevices
    .getUserMedia({
      audio: { deviceId: audioInputDeviceId },
    })
    .then((stream) => {
      if (!checkStopCondition({ stream })) {
        return;
      }

      const audioContext = new AudioContext();
      if (!checkStopCondition({ stream, audioContext })) {
        return;
      }

      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);

      mediaStreamSource.connect(audioContext.destination); // echo?
      mediaStreamSource.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        if (!checkStopCondition({ stream, audioContext })) {
          return;
        }

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
      };
    });

  return () => {
    isRunning = false;
  };
}

function mediaTypeToInputKind(type: MediaType): MediaDeviceKind | "?" {
  if (type === "audio") {
    return "audioinput";
  } else if (type === "video") {
    return "videoinput";
  } else {
    return "?";
  }
}
