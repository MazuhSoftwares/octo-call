import {
  ReactNode,
  SyntheticEvent,
  useContext,
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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BlockIcon from "@mui/icons-material/Block";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  retrieveVideoInputs,
  selectVideoDevices,
  selectUserVideoId,
  setUserVideoId,
} from "../../state/devices";
import DevicePreviewContext, {
  DevicePreviewProvider,
  DevicePreviewStatus,
} from "../../contexts/DevicePreviewContext";

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
    <DevicePreviewProvider type="video">
      <Container>
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
        {videoErrorMessage && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "flex", mt: 1 }}
          >
            <ErrorOutlineIcon /> {videoErrorMessage}
          </Typography>
        )}
        {isLoading && (
          <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
            Checking permission...
          </Typography>
        )}
        <VideoMirror deviceId={userVideoId} />
      </Container>
    </DevicePreviewProvider>
  );
}

interface VideoMirrorProps {
  deviceId: string;
}

function VideoMirror({ deviceId }: VideoMirrorProps) {
  const videoPreview = useContext(DevicePreviewContext);
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          borderColor: (theme: any) =>
            theme.components.MuiCard.styleOverrides.root.borderColor,
        }}
      >
        <Box
          component="video"
          ref={videoRef}
          sx={{
            display: "flex",
            width: "100%",
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
