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
import { selectCall } from "../../state/call";
import { selectHasSomeDevice } from "../../state/devices";
import { askToJoinCall, selectCallUsers } from "../../state/callUsers";
import QuickDevicesConfig from "./QuickDevicesConfig";
import Link from "../../components/basic/Link";

export default function CallJoinMain() {
  const dispatch = useAppDispatch();

  const callUidInputId = useId();

  const hasSomeDevice = useAppSelector(selectHasSomeDevice);

  const call = useAppSelector(selectCall);
  const callUsers = useAppSelector(selectCallUsers);

  const searchParams = new URLSearchParams(window.location.search);
  const [callUid, setCallUid] = useState<string>(
    searchParams.get("callUid") || ""
  );
  const handleCallIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCallUid(event.target.value);
  };

  const onJoinCallSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!callUid.trim()) {
      return;
    }

    dispatch(
      askToJoinCall({
        callUid,
      })
    );
  };

  const isPending = call.status === "pending";
  const isAskingToJoin = callUsers.status === "asking-to-join";

  const isJoinSubmitDisabled = !hasSomeDevice || isAskingToJoin;

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
        onSubmit={onJoinCallSubmit}
        display="flex"
        flexDirection="column"
        marginTop={3}
      >
        <ErrorAlert message={callUsers.errorMessage} />
        <Typography variant="label" component="label" htmlFor={callUidInputId}>
          Join a call
        </Typography>
        <TextField
          id={callUidInputId}
          value={callUid}
          onChange={handleCallIdChange}
          placeholder="Insert the call ID"
          autoComplete="off"
          required
          fullWidth
        />
        <Button
          type="submit"
          disabled={isJoinSubmitDisabled}
          color="primary"
          variant="contained"
          startIcon={<AddIcCallIcon />}
          sx={{ marginTop: 3 }}
          fullWidth
        >
          {getSubmitLabel("Join call")}
        </Button>
        <Link to="/create" sx={{ mt: 1, textAlign: "center" }}>
          <VideoCallIcon sx={{ mr: 1 }} /> Or create a new one
        </Link>
      </Box>
    </HomeTemplate>
  );
}
