import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import GroupIcon from "@mui/icons-material/Group";
import DialogModal from "../basic/DialogModal";
import { useAppSelector } from "../../state";
import { selectCallUsers } from "../../state/callUsers";
import { Button } from "@mui/material";

export interface PendingUsersModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function PendingUsersModal({
  isOpen,
  close,
}: PendingUsersModalProps) {
  const callUsers = useAppSelector(selectCallUsers);

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
        {callUsers.pendingUsers.map((user) => (
          <Box
            component="li"
            key={user.uid}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography component="span">{user.userDisplayName}</Typography>
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
