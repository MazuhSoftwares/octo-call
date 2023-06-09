import { ChangeEvent, FormEvent, useId, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import HomeTemplate from "../../components/templates/HomeTemplate";
import ErrorAlert from "../../components/basic/ErrorAlert";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";
import { selectHasSomeDevice } from "../../state/devices";
import { selectCallUsers } from "../../state/callUsers";
import QuickDevicesConfig from "./QuickDevicesConfig";
import Link from "../../components/basic/Link";

export default function CallCreationMain() {
  const dispatch = useAppDispatch();

  const callDisplayNameInputId = useId();

  const hasSomeDevice = useAppSelector(selectHasSomeDevice);

  const call = useAppSelector(selectCall);
  const callUsers = useAppSelector(selectCallUsers);

  const searchParams = new URLSearchParams(window.location.search);
  const [callDisplayName, setCallDisplayName] = useState<string>(
    searchParams.get("callDisplayName") || ""
  );
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
  const isAskingToJoin = callUsers.status === "asking-to-join";

  const isCreateSubmitDisabled = !hasSomeDevice || isPending;

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
        <Link to="/join" sx={{ mt: 1, textAlign: "center" }}>
          <AddIcCallIcon sx={{ mr: 1 }} /> Or join another
        </Link>
      </Box>
    </HomeTemplate>
  );
}
