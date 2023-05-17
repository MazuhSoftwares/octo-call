import { SyntheticEvent, useEffect, useId } from "react";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  retrieveVideoInputs,
  selectVideoDevices,
  selectUserVideoId,
  setUserVideoId,
} from "../../state/devices";

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
          sx={{ display: "block", mt: 1 }}
        >
          {videoErrorMessage}
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
