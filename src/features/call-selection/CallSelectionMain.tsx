import { ChangeEvent, FormEvent, useId, useState } from "react";
import { Redirect } from "wouter";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import HomeTemplate from "../../components/templates/HomeTemplate";
import ErrorAlert from "../../components/basic/ErrorAlert";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";

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

  if (call.status === "inProgress") {
    return <Redirect to={`/p2p/${call.uid}`} />;
  }

  return (
    <HomeTemplate subtitle="Create or join a call">
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
