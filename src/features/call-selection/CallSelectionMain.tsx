import { FormEvent, useId } from "react";
import { Redirect } from "wouter";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import InitialMainCard from "../../components/templates/InitialMainCard";
import ErrorAlert from "../../components/basic/ErrorAlert";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";

export default function CallSelectionMain() {
  const callDisplayNameInputId = useId();
  const call = useAppSelector(selectCall);
  const dispatch = useAppDispatch();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const callDisplayName = (
      (
        (event.target as HTMLFormElement)
          .callDisplayName as HTMLInputElement | null
      )?.value || ""
    ).trim();

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
    <InitialMainCard subtitle="Create or join a call">
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
          name="callDisplayName"
          placeholder="What's the meeting about?"
          autoComplete="off"
          required
          fullWidth
        />
        <Button
          type="submit"
          disabled={isPending}
          color="primary"
          variant="contained"
          startIcon={<VideoCallIcon />}
          fullWidth
          sx={{ marginTop: 3 }}
        >
          {isPending ? "Preparing it..." : "Create call"}
        </Button>
      </Box>
    </InitialMainCard>
  );
}
