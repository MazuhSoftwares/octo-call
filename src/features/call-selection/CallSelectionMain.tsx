import Typography from "@mui/material/Typography";
import InitialMainCard from "../../components/templates/InitialMainCard";
import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../state";
import { createCall } from "../../state/call";
import { selectCurrentUser } from "../../state/user";

export default function CallSelectionMain() {
  const displayNameInputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

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
      <Typography>Imagine a creation or join form here.</Typography>
      <label htmlFor="create-call-input">Call Name</label>
      <input
        id="create-call-input"
        name="displayName"
        ref={displayNameInputRef}
      />
      <button onClick={createNewCall}>Create</button>
    </InitialMainCard>
  );
}
