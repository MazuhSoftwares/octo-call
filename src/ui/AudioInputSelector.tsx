import { useAppDispatch, useAppSelector } from "../state";
import { retrieveAudioInputs, selectAudioDevices } from "../state/devices";
import { useEffect } from "react";

export default function AudioInputSelector() {
  const dispatch = useAppDispatch();

  const { audioInputs, audioStatus, audioErrorMessage } =
    useAppSelector(selectAudioDevices);

  useEffect(() => {
    dispatch(retrieveAudioInputs());
  }, [dispatch]);

  const isDisabled = audioStatus !== "done" || audioInputs.length === 0;
  const isLoading = audioStatus === "pending";

  return (
    <label>
      Audio input
      {audioErrorMessage && <small> ({audioErrorMessage}) </small>}
      {isLoading && <small> (Checking permission...) </small>}
      <select disabled={isDisabled}>
        <option value="">Disabled microphone</option>
        {audioInputs.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </label>
  );
}
