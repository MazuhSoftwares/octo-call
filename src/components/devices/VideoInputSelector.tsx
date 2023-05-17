import { useAppDispatch, useAppSelector } from "../../state";
import { retrieveVideoInputs, selectVideoDevices } from "../../state/devices";
import { useEffect } from "react";

export default function VideoInputSelector() {
  const dispatch = useAppDispatch();

  const { videoInputs, videoStatus, videoErrorMessage } =
    useAppSelector(selectVideoDevices);

  useEffect(() => {
    dispatch(retrieveVideoInputs());
  }, [dispatch]);

  const isDisabled = videoStatus !== "done" || videoInputs.length === 0;
  const isLoading = videoStatus === "pending";

  return (
    <label>
      Video input
      {videoErrorMessage && <small> ({videoErrorMessage}) </small>}
      {isLoading && <small> (Checking permission...) </small>}
      <select disabled={isDisabled}>
        <option value="">Disabled camera</option>
        {videoInputs.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </label>
  );
}
