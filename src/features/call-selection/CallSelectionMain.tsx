import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
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
  selectHasSomeDevice,
  setAudioToDefault,
  setUserAudioId,
  setUserVideoId,
  setVideoToDefault,
} from "../../state/devices";
import ToggleMicButton from "../../components/devices/ToggleMicButton";
import ToggleCamButton from "../../components/devices/ToggleCamButton";
import InfoAlert from "../../components/basic/InfoAlert";
import { askToJoinCall, selectCallUsers } from "../../state/callUsers";

export default function CallSelectionMain() {
  const dispatch = useAppDispatch();

  const callDisplayNameInputId = useId();
  const callUidInputId = useId();

  const hasSomeDevice = useAppSelector(selectHasSomeDevice);

  const call = useAppSelector(selectCall);
  const callUsers = useAppSelector(selectCallUsers);

  const [callDisplayName, setCallDisplayName] = useState<string>("");
  const [callUid, setCallUid] = useState<string>("");
  const handleCallDisplayNameChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setCallDisplayName(event.target.value);
  };
  const handleCallIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCallUid(event.target.value);
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

  const onJoinCallSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!callUid.trim()) {
      return;
    }

    dispatch(
      askToJoinCall({
        callUid,
      })
    );
  };

  const isPending = call.status === "pending";
  const isAskingToJoin = callUsers.status === "asking-to-join";

  const isCreateSubmitDisabled = !hasSomeDevice || isPending;
  const isJoinSubmitDisabled = !hasSomeDevice || isAskingToJoin;

  const getSubmitLabel = (regular: string): string => {
    if (!hasSomeDevice) {
      return "Select at least one device.";
    }

    if (isPending || isAskingToJoin) {
      return "Preparing it...";
    }

    return regular;
  };

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
        {isCreateSubmitDisabled ? (
          <ErrorAlert
            prefix=""
            message="At least one device is required."
            sx={{ marginTop: 3 }}
          />
        ) : (
          <Button
            type="submit"
            disabled={isCreateSubmitDisabled}
            color="primary"
            variant="contained"
            startIcon={<VideoCallIcon />}
            sx={{ marginTop: 3 }}
            fullWidth
          >
            {getSubmitLabel("Create call")}
          </Button>
        )}
      </Box>
      <Box
        component="form"
        onSubmit={onJoinCallSubmit}
        display="flex"
        flexDirection="column"
        marginTop={3}
      >
        <ErrorAlert message={callUsers.errorMessage} />
        <Typography variant="label" component="label" htmlFor={callUidInputId}>
          Join a call
        </Typography>
        <TextField
          id={callUidInputId}
          value={callUid}
          onChange={handleCallIdChange}
          placeholder="Insert the call ID"
          autoComplete="off"
          required
          fullWidth
        />
        <Button
          type="submit"
          disabled={isJoinSubmitDisabled}
          color="primary"
          variant="contained"
          startIcon={<VideoCallIcon />}
          sx={{ marginTop: 3 }}
          fullWidth
        >
          {getSubmitLabel("Join call")}
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

  const firstVideoIdRef = useRef<string>(devices.userVideoId);

  useEffect(() => {
    dispatch(retrieveAudioInputs()).then(() => {
      dispatch(setAudioToDefault());
    });

    if (firstVideoIdRef.current) {
      dispatch(retrieveVideoInputs()).then(() => {
        dispatch(setVideoToDefault());
      });
    }
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
      <ErrorAlert
        prefix="Audio issue."
        message={devices.audioErrorMessage}
        sx={{ mb: 1 }}
      />
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
      </Box>
      <ErrorAlert
        prefix="Video issue."
        message={devices.videoErrorMessage}
        sx={{ mb: 1, mt: 1 }}
      />
    </Box>
  );
}
