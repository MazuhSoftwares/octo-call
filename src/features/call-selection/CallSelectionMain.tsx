import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import HomeTemplate from "../../components/templates/HomeTemplate";
import ErrorAlert from "../../components/basic/ErrorAlert";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";
import {
  retrieveAudioInputs,
  retrieveVideoInputs,
  selectDevices,
  setAudioToDefault,
  setUserAudioId,
  setUserVideoId,
  setVideoToDefault,
} from "../../state/devices";
import ToggleMicButton from "../../components/devices/ToggleMicButton";
import ToggleCamButton from "../../components/devices/ToggleCamButton";
import InfoAlert from "../../components/basic/InfoAlert";

export default function CallSelectionMain() {
  const dispatch = useAppDispatch();

  const callDisplayNameInputId = useId();

  const call = useAppSelector(selectCall);

  const [callDisplayName, setCallDisplayName] = useState<string>("");
  const handleCallDisplayNameChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setCallDisplayName(event.target.value);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!callDisplayName.trim()) {
      return;
    }

    dispatch(
      createCall({
        displayName: callDisplayName,
      })
    );
  };

  const isPending = call.status === "pending";

  return (
    <HomeTemplate subtitle="Create or join a call">
      <QuickDevicesConfig />
      <Box
        component="form"
        onSubmit={onSubmit}
        display="flex"
        flexDirection="column"
      >
        <ErrorAlert message={call.errorMessage} />
        <Typography
          variant="label"
          component="label"
          htmlFor={callDisplayNameInputId}
        >
          Create a new call
        </Typography>
        <TextField
          id={callDisplayNameInputId}
          value={callDisplayName}
          onChange={handleCallDisplayNameChange}
          placeholder="What's the meeting about?"
          autoComplete="off"
          inputProps={{ maxLength: 50 }}
          required
          fullWidth
        />
        <Button
          type="submit"
          disabled={isPending}
          color="primary"
          variant="contained"
          startIcon={<VideoCallIcon />}
          sx={{ marginTop: 3 }}
          fullWidth
        >
          {isPending ? "Preparing it..." : "Create call"}
        </Button>
      </Box>
    </HomeTemplate>
  );
}

function QuickDevicesConfig() {
  const dispatch = useAppDispatch();

  const devices = useAppSelector(selectDevices);

  const handleToggleMicClick = useCallback(() => {
    if (devices.userAudioId) {
      dispatch(setUserAudioId(""));
      return;
    }

    if (devices.audioInputs.length) {
      dispatch(setAudioToDefault());
      return;
    }

    dispatch(retrieveAudioInputs()).then(() => {
      dispatch(setAudioToDefault());
    });
  }, [dispatch, devices]);

  const handleToggleCamClick = useCallback(() => {
    if (devices.userVideoId) {
      dispatch(setUserVideoId(""));
      return;
    }

    if (devices.videoInputs.length) {
      dispatch(setVideoToDefault());
      return;
    }

    dispatch(retrieveVideoInputs()).then(() => {
      dispatch(setVideoToDefault());
    });
  }, [dispatch, devices]);

  useEffect(() => {
    dispatch(retrieveAudioInputs()).then(() => {
      dispatch(setAudioToDefault());
    });
  }, [dispatch]);

  const isSomeDeviceLoading =
    devices.audioStatus === "pending" || devices.videoStatus === "pending";

  const isMicBtnDisabled =
    devices.audioStatus === "pending" || devices.audioStatus === "error";
  const isCamBtnDisabled =
    devices.videoStatus === "pending" || devices.videoStatus === "error";

  return (
    <Box component="section" sx={{ mb: 2 }}>
      {isSomeDeviceLoading && (
        <InfoAlert
          message="Checking device/browser permission... It might require your manual approval."
          sx={{ mb: 1 }}
        />
      )}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ToggleMicButton
          handleToggleMicClick={handleToggleMicClick}
          isAudioEnabled={Boolean(devices.userAudioId)}
          disabled={isMicBtnDisabled}
          sx={{ mr: 1 }}
        />
        <Typography component="span" aria-label="Selected microphone">
          {devices.userAudioLabel || "Disabled"}
        </Typography>
      </Box>
      <ErrorAlert prefix="Audio issue." message={devices.audioErrorMessage} />
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <ToggleCamButton
          handleToggleCamClick={handleToggleCamClick}
          isVideoEnabled={Boolean(devices.userVideoId)}
          disabled={isCamBtnDisabled}
          sx={{ mr: 1 }}
        />
        <Typography component="span" aria-label="Selected camera">
          {devices.userVideoLabel || "Disabled"}
        </Typography>
        <ErrorAlert prefix="Audio issue." message={devices.videoErrorMessage} />
      </Box>
    </Box>
  );
}
