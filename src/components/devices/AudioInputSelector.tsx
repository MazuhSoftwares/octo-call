import { SyntheticEvent, useEffect, useId, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";
import Typography from "@mui/material/Typography";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { visuallyHidden } from "@mui/utils";
import ErrorAlert from "../basic/ErrorAlert";
import InfoAlert from "../basic/InfoAlert";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  retrieveAudioInputs,
  selectAudioDevices,
  selectUserAudioId,
  setUserAudioId,
} from "../../state/devices";
import { useDevicePreview } from "../../hooks/useDevicePreview";

export default function AudioInputSelector() {
  const selectFieldId = useId();

  const dispatch = useAppDispatch();

  const userAudioId = useAppSelector(selectUserAudioId);
  const { audioInputs, audioStatus, audioErrorMessage } =
    useAppSelector(selectAudioDevices);

  useEffect(() => {
    dispatch(retrieveAudioInputs());
  }, [dispatch]);

  const handleDeviceChange = (event: SyntheticEvent) =>
    dispatch(setUserAudioId((event.target as HTMLSelectElement).value));

  const isDisabled = audioStatus !== "done" || audioInputs.length === 0;
  const isLoading = audioStatus === "pending";

  return (
    <Container>
      <ErrorAlert message={audioErrorMessage} />
      {isLoading && (
        <InfoAlert message="Checking device/browser permission... This possibly requires your manual approval." />
      )}
      <FormControl fullWidth>
        <Typography variant="label" component="label" htmlFor={selectFieldId}>
          Audio input
        </Typography>
        <NativeSelect
          value={userAudioId}
          onChange={handleDeviceChange}
          disabled={isDisabled}
          inputProps={{ id: selectFieldId }}
        >
          <option value="">Disabled microphone</option>
          {audioInputs.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
      <AudioMeter deviceId={userAudioId} />
    </Container>
  );
}

interface AudioMeterProps {
  deviceId: string;
}

function AudioMeter({ deviceId }: AudioMeterProps) {
  const audioPreview = useDevicePreview("audio");
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    audioPreview.setResultListener((pct: number) => setPercentage(pct));

    audioPreview.start(deviceId);
    return () => audioPreview.stop();
  }, [audioPreview, deviceId]);

  return (
    <Box
      aria-label="Audio meter"
      sx={{ display: "flex", alignItems: "center", mt: 3 }}
    >
      {percentage ? (
        <MicIcon aria-label="Mic on" sx={{ flexShrink: 0 }} />
      ) : (
        <MicOffIcon aria-label="Mic off" sx={{ flexShrink: 0 }} />
      )}
      <Box sx={{ marginLeft: 2, position: "relative", flexGrow: 1 }}>
        <Box sx={visuallyHidden}>{`${percentage}%`}</Box>
        <Box
          sx={{
            background: (theme) => theme.palette.background.paper,
            height: 10,
            width: "100%",
            borderRadius: 8,
          }}
        />
        <Box
          sx={{
            background: (theme) => theme.palette.primary.main,
            height: 10,
            position: "absolute",
            top: 0,
            borderRadius: 8,
          }}
          style={{
            width: `${percentage}%`,
          }}
        />
      </Box>
    </Box>
  );
}
