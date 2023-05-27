import { ReactNode, createContext, useCallback, useMemo, useRef } from "react";
import type { PreviewCleanup } from "../webrtc/media-devices-preview";
import webrtc, { MediaType } from "../webrtc";

export interface DevicePreview<T extends MediaType> {
  start: (deviceId: string) => Promise<void>;
  stop: () => void;
  setResultListener: (callback: ResultListener<T>) => void;
  setStatusChangeListener: (callback: StatusListener) => void;
}

export const DevicePreviewContext = createContext<DevicePreview<MediaType>>({
  start: () => Promise.resolve(),
  stop: () => null,
  setResultListener: () => null,
  setStatusChangeListener: () => null,
});

export type DevicePreviewStatus = "idle" | "preparing" | "running" | "error";

export type ResultListener<T extends MediaType> = T extends "audio"
  ? AudioPercentageListener
  : T extends "video"
  ? VideoStreamListener
  : never;

export type AudioPercentageListener = (percentage: number) => void;

export type VideoStreamListener = (stream: MediaStream | null) => void;

export type StatusListener = (status: DevicePreviewStatus) => void;

export interface DevicePreviewProviderProps {
  children: ReactNode;
  type: MediaType;
}

export function DevicePreviewProvider({
  children,
  type,
}: DevicePreviewProviderProps) {
  const deviceLockRef = useRef<DeviceLock>({
    deviceId: NO_DEVICE_ID,
    cleanup: NO_CLEANUP,
  });

  const onResultRef = useRef<ResultListener<typeof type>>(() => null);
  const setResultListener = useCallback(
    (callback: ResultListener<typeof type>) => {
      onResultRef.current = callback;
    },
    []
  );

  const onStatusChangeRef = useRef<StatusListener>(() => null);
  const setStatusChangeListener = useCallback((callback: StatusListener) => {
    onStatusChangeRef.current = callback;
  }, []);

  const stop = useCallback(() => {
    // destructuring to primitive stuff,
    // to prevent (race condition) changes in the middle of the function.
    const { deviceId, cleanup } = deviceLockRef.current;

    if (deviceId === NO_DEVICE_ID) {
      console.log(
        "Tried to stop preview. But will be ignored, cause no device was in preview."
      );
      return;
    }

    if (cleanup === NO_CLEANUP) {
      // It means the `start` function locked it,
      // but didn't have time yet to be done and provide a valid `cleanup`.
      // Maybe react life cycle (in strict mode?) tried too soon,
      // so let's give up, and it'll probably try again another time.
      console.warn(
        "Tried to stop preview. But will be ignored, cause no cleanup was ready for:",
        deviceId
      );
      return;
    }

    // actual cleanup.
    console.log("Stopping preview for:", deviceId);
    try {
      cleanup();
    } catch (error) {
      console.error(
        "Tried to stop preview, and will be unlocking it anyway, but it failed to run cleanup for:",
        deviceId,
        error
      );
    }

    // release the locks.
    deviceLockRef.current = {
      deviceId: NO_DEVICE_ID,
      cleanup: NO_CLEANUP,
    };

    try {
      if (type === "audio") {
        (onResultRef.current as AudioPercentageListener)(0);
      } else if (type === "video") {
        (onResultRef.current as VideoStreamListener)(null);
      }
    } finally {
      onStatusChangeRef.current("idle");
    }
  }, [type]);

  const start = useCallback(
    async (deviceId: string) => {
      if (deviceId === "") {
        console.log("Tried to preview empty device. Ignoring it.");
        return;
      }

      if (deviceLockRef.current.deviceId === deviceId) {
        console.log(
          "Tried to preview an device that is already being previewed. Ignoring it:",
          deviceId
        );
        return;
      }

      console.log("Preparing to preview device:", deviceId);
      deviceLockRef.current.deviceId = deviceId; // already lock it.

      onStatusChangeRef.current("preparing");
      try {
        if (type === "audio") {
          deviceLockRef.current.cleanup = await webrtc.startAudioPreview({
            audioInputDeviceId: deviceId,
            onPercentage: (percentage) =>
              (onResultRef.current as AudioPercentageListener)(percentage),
          });
        } else if (type === "video") {
          deviceLockRef.current.cleanup = await webrtc.startVideoPreview({
            videoInputDeviceId: deviceId,
            onStream: (stream) =>
              (onResultRef.current as VideoStreamListener)(stream),
          });
        }

        onStatusChangeRef.current("running");
      } catch (error) {
        console.error("Error on device preview:", deviceId, error);
        onStatusChangeRef.current("error");
      }
    },
    [type]
  );

  const audioPreview = useMemo<DevicePreview<typeof type>>(
    () => ({
      start,
      stop,
      setResultListener,
      setStatusChangeListener,
    }),
    [start, stop, setResultListener, setStatusChangeListener]
  );

  return (
    <DevicePreviewContext.Provider value={audioPreview}>
      {children}
    </DevicePreviewContext.Provider>
  );
}

interface DeviceLock {
  deviceId: string;
  cleanup: PreviewCleanup;
}

const NO_DEVICE_ID = "";

const NO_CLEANUP = () => null;
