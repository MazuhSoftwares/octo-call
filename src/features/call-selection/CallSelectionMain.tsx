import { useRef } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InitialMainCard from "../../components/templates/InitialMainCard";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall, selectCall } from "../../state/call";
import { selectCurrentUser } from "../../state/user";

export default function CallSelectionMain() {
  const displayNameInputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector(selectCurrentUser);
  const call = useAppSelector(selectCall);
  const dispatch = useAppDispatch();

  const isPending = call.status === "pending";

  const createNewCall = () => {
    const displayName = displayNameInputRef.current?.value;
    if (!displayName) {
      return;
    }

    dispatch(
      createCall({
        hostId: user.uid,
        hostDisplayName: user.displayName,
        displayName: displayName,
      })
    );
  };

  return (
    <InitialMainCard subtitle="Create or join a call">
      <TextField
        inputRef={displayNameInputRef}
        required
        id="outlined-required"
        label="Call Name"
        name="displayName"
        variant="outlined"
        sx={{ width: "100%" }}
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
