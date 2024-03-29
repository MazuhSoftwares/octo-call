import {
  ReactNode,
  SyntheticEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";
import Typography from "@mui/material/Typography";
import PendingIcon from "@mui/icons-material/Pending";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ErrorAlert from "../basic/ErrorAlert";
import InfoAlert from "../basic/InfoAlert";
import BlockIcon from "@mui/icons-material/Block";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  retrieveVideoInputs,
  selectVideoDevices,
  selectUserVideoId,
  setUserVideoId,
} from "../../state/devices";
import { getThemedColor } from "../app/mui-styles";
import {
  DevicePreviewStatus,
  useDevicePreview,
} from "../../hooks/useDevicePreview";

export default function VideoInputSelector() {
  const selectFieldId = useId();

  const dispatch = useAppDispatch();

  const userVideoId = useAppSelector(selectUserVideoId);
  const { videoInputs, videoStatus, videoErrorMessage } =
    useAppSelector(selectVideoDevices);

  useEffect(() => {
    dispatch(retrieveVideoInputs());
  }, [dispatch]);

  const handleDeviceChange = (event: SyntheticEvent) =>
    dispatch(setUserVideoId((event.target as HTMLSelectElement).value));

  const isDisabled = videoStatus !== "done" || videoInputs.length === 0;
  const isLoading = videoStatus === "pending";

  return (
    <Container>
      {isLoading && (
        <InfoAlert message="Checking device/browser permission... This possibly requires your manual approval." />
      )}
      <ErrorAlert message={videoErrorMessage} />
      <FormControl fullWidth>
        <Typography variant="label" component="label" htmlFor={selectFieldId}>
          Video input
        </Typography>
        <NativeSelect
          value={userVideoId}
          onChange={handleDeviceChange}
          disabled={isDisabled}
          inputProps={{ id: selectFieldId }}
        >
          <option value="">Disabled camera</option>
          {videoInputs.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
      <VideoMirror deviceId={userVideoId} />
    </Container>
  );
}

interface VideoMirrorProps {
  deviceId: string;
}

function VideoMirror({ deviceId }: VideoMirrorProps) {
  const videoPreview = useDevicePreview("video");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [status, setStatus] = useState<DevicePreviewStatus>("idle");

  useEffect(() => {
    videoPreview.setResultListener((stream: MediaStream | null) => {
      if (!videoRef.current && stream) {
        console.error(
          "Unable to put stream in the video preview element at result callback."
        );
      }

      if (!videoRef.current) {
        return;
      }

      videoRef.current.muted = true;
      videoRef.current.srcObject = stream;
    });

    videoPreview.setStatusChangeListener((status) => setStatus(status));

    videoPreview.start(deviceId);
    return () => videoPreview.stop();
  }, [videoPreview, deviceId]);

  const getStatusEl = (): ReactNode => {
    if (!deviceId) {
      return (
        <>
          <VideocamOffIcon fontSize="medium" /> No camera.
        </>
      );
    }

    if (status === "preparing") {
      return (
        <>
          <PendingIcon fontSize="medium" /> Preparing...
        </>
      );
    }

    if (status === "error") {
      return (
        <>
          <BlockIcon /> Unknown error.
        </>
      );
    }

    return null;
  };

  return (
    <Box aria-label="Video mirror" sx={{ mt: 3 }}>
      <Box
        sx={{
          position: "relative",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: getThemedColor("commonBorder"),
        }}
      >
        <Box
          component="video"
          ref={videoRef}
          sx={{
            display: "flex",
            width: "100%",
            transform: "scale(-1, 1)",
          }}
          disablePictureInPicture
          autoPlay
          playsInline
        />
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            top: "50%",
            display: "flex",
            alignItems: "end",
            justifyContent: "center",
          }}
        >
          {getStatusEl()}
        </Box>
      </Box>
    </Box>
  );
}
