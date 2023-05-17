import { ChangeEvent, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InitialMainCard from "../../components/templates/InitialMainCard";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";
import { selectCurrentUser } from "../../state/user";

export default function CallSelectionMain() {
  const [callName, setCallName] = useState("");
  const user = useAppSelector(selectCurrentUser);
  const call = useAppSelector(selectCall);
  const dispatch = useAppDispatch();

  const isPending = call.status === "pending";

  const createNewCall = () => {
    if (!callName) {
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

  const handleCallNameChange = (event: ChangeEvent<{ value: string }>) =>
    setCallName(event.target.value);

  return (
    <InitialMainCard subtitle="Create or join a call">
      <TextField
        required
        data-testid="call-name-input"
        id="call-name-input"
        label="Call Name"
        name="displayName"
        variant="outlined"
        sx={{ width: "100%" }}
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
