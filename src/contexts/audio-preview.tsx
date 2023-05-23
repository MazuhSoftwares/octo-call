import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import webrtc from "../webrtc";

export type AudioPreviewStatus = "idle" | "preparing" | "running" | "error";

export interface AudioPreview {
  status: AudioPreviewStatus;
  deviceId: string;
  start: (deviceId: string) => Promise<void>;
  stop: () => void;
  activityPct: number;
}

export const AudioPreviewContext = createContext<AudioPreview>({
  status: "idle",
  deviceId: "",
  start: () => Promise.resolve(),
  stop: () => null,
  activityPct: 0,
});

export interface AudioPreviewProviderProps {
  children: ReactNode;
}

export function AudioPreviewProvider({ children }: AudioPreviewProviderProps) {
  const [activeDeviceId, setActiveDeviceId] = useState<string>("");
  const [status, setStatus] = useState<AudioPreviewStatus>("idle");

  const [activityPct, setActivityPct] = useState<number>(0);

  const cleanupRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    console.log("Stopping audio preview for:", activeDeviceId);

    if (cleanupRef.current) {
      cleanupRef.current();
    }

    cleanupRef.current = null;
    setActiveDeviceId("");
    setStatus("idle");
  }, [activeDeviceId]);

  const isBusy = status !== "idle";

  const start = useCallback(
    async (deviceId: string) => {
      const isNone = deviceId === "";
      const isAlreadyHandled = activeDeviceId === deviceId;
      if (isAlreadyHandled || isNone || isBusy) {
        return;
      }

      setActiveDeviceId(deviceId);

      console.log("Preparing to preview audio:", deviceId);
      setStatus("preparing");
      try {
        cleanupRef.current = await webrtc.startAudioPreview({
          audioInputDeviceId: deviceId,
          onResult: (percentage) => setActivityPct(percentage),
        });
        setStatus("running");
      } catch (error) {
        console.error("Error on audio preview.", error);
        setStatus("error");
      }
    },
    [isBusy, activeDeviceId]
  );

  const audioPreview = useMemo<AudioPreview>(
    () => ({
      status: "idle",
      deviceId: "",
      start,
      stop,
      activityPct,
    }),
    [start, stop]
  );

  return (
    <AudioPreviewContext.Provider value={audioPreview}>
      {children}
    </AudioPreviewContext.Provider>
  );
}
