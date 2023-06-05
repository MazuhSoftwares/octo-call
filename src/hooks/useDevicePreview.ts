import { useCallback, useMemo, useRef } from "react";
import type { PreviewCleanup } from "../webrtc/media-devices-preview";
import webrtc, { MediaType } from "../webrtc";

export interface DevicePreview<T extends MediaType> {
  start: (deviceId: string) => Promise<void>;
  stop: () => void;
  setResultListener: (callback: ResultListener<T>) => void;
  setStatusChangeListener: (callback: StatusListener) => void;
}

export type DevicePreviewStatus = "idle" | "preparing" | "running" | "error";

export type ResultListener<T extends MediaType> = T extends "audio"
  ? AudioPercentageListener
  : T extends "video"
  ? VideoStreamListener
  : never;

export type AudioPercentageListener = (percentage: number) => void;

export type VideoStreamListener = (stream: MediaStream | null) => void;

export type StatusListener = (status: DevicePreviewStatus) => void;

export function useDevicePreview(type: MediaType) {
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

  const hasPendingCancelationRef = useRef<boolean>(false);

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
      // (Input devices usually have some delay to physically turn on.)
      if (hasPendingCancelationRef.current) {
        // This `stop` is probably already being executed as a cancelation.
        // And yet, no `cleanup` is ready... it's tricky a bug, have fun.
        console.error(
          "Tried to handle preview cancelation. But still no cleanup available for:",
          deviceId
        );
      } else {
        // Let's mark for cancelation so the `start` itself will stop as soon
        // as it ends its async ops.
        console.log(
          "Tried to stop preview, but no cleanup was ready. Marking for cancelation:",
          deviceId
        );
      }

      hasPendingCancelationRef.current = true;
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
        if (hasPendingCancelationRef.current) {
          console.log(
            "Tried to preview a device that is currently canceled. Minds change. Cleaning cancelation for:",
            deviceId
          );
          hasPendingCancelationRef.current = false;
        } else {
          console.log(
            "Tried to preview a device that still has a pending previewing. Ignoring it:",
            deviceId
          );
        }

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

        if (hasPendingCancelationRef.current) {
          console.log(
            "Preview ready but got canceled, so will be cleaned for:",
            deviceId
          );
          hasPendingCancelationRef.current = false;
          stop();
        } else {
          console.log("Previewing device:", deviceId);
          onStatusChangeRef.current("running");
        }
      } catch (error) {
        console.error("Error on device preview:", deviceId, error);
        onStatusChangeRef.current("error");
      }
    },
    [type, stop]
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

  return audioPreview;
}

interface DeviceLock {
  deviceId: string;
  cleanup: PreviewCleanup;
}

const NO_DEVICE_ID = "";

const NO_CLEANUP = () => null;
