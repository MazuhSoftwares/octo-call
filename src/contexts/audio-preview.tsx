import { ReactNode, createContext, useCallback, useMemo, useRef } from "react";
import type { PreviewCleanup } from "../webrtc/media-devices-preview";
import webrtc from "../webrtc";

export interface AudioPreview {
  start: (deviceId: string) => Promise<void>;
  stop: () => void;
  setOnResultListener: (callback: PercentageListener) => void;
  setOnStatusChangeListener: (callback: StatusListener) => void;
}

export const AudioPreviewContext = createContext<AudioPreview>({
  start: () => Promise.resolve(),
  stop: () => null,
  setOnResultListener: () => null,
  setOnStatusChangeListener: () => null,
});

export type AudioPreviewStatus = "idle" | "preparing" | "running" | "error";

export interface AudioPreviewProviderProps {
  children: ReactNode;
}

export type PercentageListener = (percentage: number) => void;

export type StatusListener = (status: AudioPreviewStatus) => void;

export function AudioPreviewProvider({ children }: AudioPreviewProviderProps) {
  const deviceLockRef = useRef<DeviceLock>({
    deviceId: NO_DEVICE_ID,
    cleanup: NO_CLEANUP,
  });

  const onResultRef = useRef<PercentageListener>(() => null);
  const setOnResultListener = useCallback((callback: PercentageListener) => {
    onResultRef.current = callback;
  }, []);

  const onStatusChangeRef = useRef<StatusListener>(() => null);
  const setOnStatusChangeListener = useCallback((callback: StatusListener) => {
    onStatusChangeRef.current = callback;
  }, []);

  const stop = useCallback(() => {
    // destructuring to primitive stuff,
    // to prevent (race condition) changes in the middle of the function.
    const { deviceId, cleanup } = deviceLockRef.current;

    if (deviceId === NO_DEVICE_ID) {
      console.log(
        "Tried to stop audio preview. But will be ignored, cause no device was in preview."
      );
      return;
    }

    if (cleanup === NO_CLEANUP) {
      // probably the start function locked it,
      // but didn't have time yet to provide the cleanup,
      // maybe react life cycle (in strict mode?) tried too soon.
      console.warn(
        "Tried to stop audio preview. But will be ignored, cause no cleanup was ready for:",
        deviceId
      );
      return;
    }

    // actual cleanup.
    console.log("Stopping audio preview for:", deviceId);
    cleanup();

    // release the locks.
    deviceLockRef.current = {
      deviceId: NO_DEVICE_ID,
      cleanup: NO_CLEANUP,
    };
    onStatusChangeRef.current("idle");
    onResultRef.current(0);
  }, []);

  const start = useCallback(async (deviceId: string) => {
    if (deviceId === "") {
      console.log("Tried to preview an empty device. Ignoring it.");
      return;
    }

    if (deviceLockRef.current.deviceId === deviceId) {
      console.log(
        "Tried to preview an audio that is already being previewed. Ignoring it:",
        deviceId
      );
      return;
    }

    console.log("Preparing to preview audio:", deviceId);
    deviceLockRef.current.deviceId = deviceId; // already lock it.

    onStatusChangeRef.current("preparing");
    try {
      deviceLockRef.current.cleanup = await webrtc.startAudioPreview({
        audioInputDeviceId: deviceId,
        onResult: (percentage) => onResultRef.current(percentage),
      });
      onStatusChangeRef.current("running");
      console.log("Running.", deviceId);
    } catch (error) {
      console.error("Error on audio preview:", deviceId, error);
      onStatusChangeRef.current("error");
    }
  }, []);

  const audioPreview = useMemo<AudioPreview>(
    () => ({
      start,
      stop,
      setOnResultListener,
      setOnStatusChangeListener,
    }),
    [start, stop, setOnResultListener, setOnStatusChangeListener]
  );

  return (
    <AudioPreviewContext.Provider value={audioPreview}>
      {children}
    </AudioPreviewContext.Provider>
  );
}

interface DeviceLock {
  deviceId: string;
  cleanup: PreviewCleanup;
}

const NO_DEVICE_ID = "";

const NO_CLEANUP = () => null;
