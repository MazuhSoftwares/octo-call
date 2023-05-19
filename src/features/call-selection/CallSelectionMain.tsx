import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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
      <Box component="form" onSubmit={onSubmit}>
        <TextField
          required
          id={callNameInputId}
          label="Call Name"
          name="callName"
          variant="outlined"
          fullWidth
        />
        <Button
          type="submit"
          disabled={isPending}
          color="primary"
          variant="contained"
          sx={{ marginTop: "25px", width: "100%" }}
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </Box>
    </InitialMainCard>
  );
}
