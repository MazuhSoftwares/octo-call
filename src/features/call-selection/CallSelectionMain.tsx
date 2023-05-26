import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormEvent, useId } from "react";
import { Redirect } from "wouter";
import get from "lodash.get";
import InitialMainCard from "../../components/templates/InitialMainCard";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";
import { selectCurrentUser } from "../../state/user";

export default function CallSelectionMain() {
  const callNameInputId = useId();
  const user = useAppSelector(selectCurrentUser);
  const call = useAppSelector(selectCall);
  const dispatch = useAppDispatch();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const callName = get(event, "target.callName.value", "");
    dispatch(
      createCall({
        hostId: user.uid,
        hostDisplayName: user.displayName,
        displayName: callName,
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
        <Typography variant="label" component="label" htmlFor={callNameInputId}>
          Create a new call
        </Typography>
        <TextField
          required
          id={callNameInputId}
          name="callName"
          placeholder="What's the meeting about?"
          fullWidth
        />
        <Button
          type="submit"
          disabled={isPending}
          color="primary"
          variant="contained"
          sx={{ marginTop: "25px", width: "100%" }}
        >
          {isPending ? "Preparing it..." : "Create call"}
        </Button>
      </Box>
    </InitialMainCard>
  );
}
