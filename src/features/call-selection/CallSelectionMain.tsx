import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { ChangeEvent, useState } from "react";
import { Redirect } from "wouter";
import InitialMainCard from "../../components/templates/InitialMainCard";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";
import { selectCurrentUser } from "../../state/user";

export default function CallSelectionMain() {
  const [callName, setCallName] = useState("");
  const [isEmptyCallName, setEmptyCallName] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const call = useAppSelector(selectCall);
  const dispatch = useAppDispatch();

  const createNewCall = () => {
    if (!callName) {
      setEmptyCallName(true);
      return;
    }

    dispatch(
      createCall({
        hostId: user.uid,
        hostDisplayName: user.displayName,
        displayName: callName,
      })
    );
  };

  const handleCallNameChange = (event: ChangeEvent<{ value: string }>) => {
    setEmptyCallName(false);
    setCallName(event.target.value);
  };

  const isPending = call.status === "pending";

  if (call.status === "inProgress") {
    return <Redirect to={`/p2p/${call.uid}`} />;
  }

  return (
    <InitialMainCard subtitle="Create or join a call">
      <TextField
        required
        data-testid="call-name-input"
        id="call-name-input"
        label="Call Name"
        name="displayName"
        variant="outlined"
        fullWidth
        error={isEmptyCallName}
        helperText={isEmptyCallName ? "Call Name is required" : ""}
        value={callName}
        onChange={handleCallNameChange}
      />
      <Button
        onClick={createNewCall}
        disabled={isPending}
        color="primary"
        variant="contained"
        sx={{ marginTop: "25px", width: "100%" }}
      >
        {isPending ? "Creating..." : "Create"}
      </Button>
    </InitialMainCard>
  );
}
