import { ChangeEvent, FormEvent, useId, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import Groups3Icon from "@mui/icons-material/Groups3";
import HomeTemplate from "../../components/templates/HomeTemplate";
import ErrorAlert from "../../components/basic/ErrorAlert";
import { useAppDispatch, useAppSelector } from "../../state";
import { selectHasSomeDevice } from "../../state/devices";
import QuickDevicesConfig from "./QuickDevicesConfig";
import Link from "../../components/basic/Link";
import { selectUserDisplayName } from "../../state/user";
import {
  askToJoinCall,
  selectCall,
  selectCallUserStatus,
} from "../../state/call";

export default function CallJoinMain() {
  const dispatch = useAppDispatch();

  const callUidInputId = useId();

  const call = useAppSelector(selectCall);

  const userDisplayName = useAppSelector(selectUserDisplayName);
  const hasSomeDevice = useAppSelector(selectHasSomeDevice);

  const callUserStatus = useAppSelector(selectCallUserStatus);

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

    dispatch(askToJoinCall({ callUid }));
  };

  const isAskingToJoin = callUserStatus === "asking-to-join";

  const isJoinSubmitDisabled = !hasSomeDevice || isAskingToJoin;

  const getSubmitLabel = (regular: string): string => {
    if (!hasSomeDevice) {
      return "Select at least one device";
    }

    if (isAskingToJoin) {
      return "Joining it...";
    }

    return regular;
  };

  return (
    <HomeTemplate
      subtitle={
        <Typography component="small">
          Hello, <code>{userDisplayName}</code>.
        </Typography>
      }
    >
      <QuickDevicesConfig />
      <Box
        component="form"
        onSubmit={onJoinCallSubmit}
        display="flex"
        flexDirection="column"
        marginTop={3}
      >
        <ErrorAlert message={call.errorMessage} />
        <Typography variant="label" component="label" htmlFor={callUidInputId}>
          Call UID:
        </Typography>
        <TextField
          id={callUidInputId}
          value={callUid}
          onChange={handleCallIdChange}
          placeholder="An unique code shared with you."
          autoComplete="off"
          required
          fullWidth
        />
        <Button
          type="submit"
          disabled={isJoinSubmitDisabled}
          color="primary"
          variant="contained"
          startIcon={<Groups3Icon />}
          sx={{ marginTop: 3 }}
          fullWidth
        >
          {getSubmitLabel("Join call")}
        </Button>
        <Link to="/create" sx={{ mt: 1, textAlign: "center" }}>
          <VideoCallIcon sx={{ mr: 1 }} /> Create a different new call
        </Link>
      </Box>
    </HomeTemplate>
  );
}
