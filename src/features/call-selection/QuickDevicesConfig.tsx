import { useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ErrorAlert from "../../components/basic/ErrorAlert";
import { useAppDispatch, useAppSelector } from "../../state";
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

export default function QuickDevicesConfig() {
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
