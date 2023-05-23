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

function mediaTypeToInputKind(type: MediaType): MediaDeviceKind | "?" {
  if (type === "audio") {
    return "audioinput";
  } else if (type === "video") {
    return "videoinput";
  } else {
    return "?";
  }
}
