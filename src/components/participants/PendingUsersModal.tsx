import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import GroupIcon from "@mui/icons-material/Group";
import DialogModal from "../basic/DialogModal";
import { useAppDispatch, useAppSelector } from "../../state";
import { acceptPendingUser, selectCallUsers } from "../../state/callUsers";
import { Button } from "@mui/material";

export interface PendingUsersModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function PendingUsersModal({
  isOpen,
  close,
}: PendingUsersModalProps) {
  const dispatch = useAppDispatch();
  const callUsers = useAppSelector(selectCallUsers);

  const acceptUser = (userUid: string) => () =>
    dispatch(acceptPendingUser({ userUid }));

  return (
    <DialogModal
      title="New Participants"
      icon={<GroupIcon fontSize="medium" />}
      isOpen={isOpen}
      close={close}
    >
      <Typography
        variant="h3"
        sx={{
          mt: { xs: 2, sm: 1 },
          mb: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        Users below are trying to join the room via shared link
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {callUsers.pendingUsers.map((callUser) => (
          <Box
            component="li"
            key={callUser.uid}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography component="span">{callUser.userDisplayName}</Typography>
            <div>
              <Button color="error" variant="contained">
                Not Allow
              </Button>
              <Button
                color="primary"
                variant="contained"
                sx={{
                  ml: 1,
                }}
                onClick={acceptUser(callUser.uid)}
              >
                Allow
              </Button>
            </div>
          </Box>
        ))}
      </Box>
    </DialogModal>
  );
}
