import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import HomeTemplate from "../../components/templates/HomeTemplate";
import QuickDevicesConfig from "./QuickDevicesConfig";
import { useAppDispatch, useAppSelector } from "../../state";
import { selectUserDisplayName } from "../../state/user";
import { leaveCall, selectCallUid } from "../../state/call";
import useCallUsersListener from "../../hooks/useCallUsersListener";

export default function PendingUserMain() {
  useCallUsersListener();

  const dispatch = useAppDispatch();

  const userDisplayName = useAppSelector(selectUserDisplayName);
  const callUid = useAppSelector(selectCallUid);

  const handlePendingCancelClick = () => dispatch(leaveCall());

  return (
    <HomeTemplate
      subtitle={
        <Typography component="small">
          Hello, <code>{userDisplayName}</code>.
        </Typography>
      }
    >
      <QuickDevicesConfig />

      <Typography
        sx={{
          display: { xs: "flex", sm: "block" },
          flexDirection: "column",
        }}
      >
        Waiting to join the call:
        <br />
        <code>{callUid}</code>
      </Typography>
      <Button
        onClick={handlePendingCancelClick}
        color="error"
        fullWidth
        sx={{ marginTop: 3 }}
      >
        Cancel pending call
      </Button>
    </HomeTemplate>
  );
}
