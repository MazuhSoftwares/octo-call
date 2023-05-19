import { SyntheticEvent, useEffect, useId } from "react";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  retrieveAudioInputs,
  selectAudioDevices,
  selectUserAudioId,
  setUserAudioId,
} from "../../state/devices";

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
      {audioErrorMessage && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", mt: 1 }}
        >
          {audioErrorMessage}
        </Typography>
      )}
      {isLoading && (
        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
          Checking permission...
        </Typography>
      )}
    </Container>
  );
}