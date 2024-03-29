import { HTMLProps, ReactNode, useId, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";
import ShareIcon from "@mui/icons-material/Share";
import RingVolumeIcon from "@mui/icons-material/RingVolume";
import WifiCalling3Icon from "@mui/icons-material/WifiCalling3";
import type { CallUser } from "../../webrtc";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  acceptPendingUser,
  rejectPendingUser,
  selectParticipants,
  selectPendingUsers,
} from "../../state/call";
import DialogModal from "../basic/DialogModal";
import { selectCallHostId } from "../../state/call";
import { selectUserUid } from "../../state/user";

export interface ParticipantsModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function ParticipantsModal({
  isOpen,
  close,
}: ParticipantsModalProps) {
  const pendingUsersHeadingId = useId();
  const participantsHeadingId = useId();

  const currentUserUid = useAppSelector(selectUserUid);
  const hostId = useAppSelector(selectCallHostId);

  const participants = useAppSelector(selectParticipants);
  const pendingUsers = useAppSelector(selectPendingUsers);

  const isCurrentUserHosting = currentUserUid === hostId;

  return (
    <DialogModal
      title="Participants"
      icon={<GroupIcon fontSize="medium" />}
      isOpen={isOpen}
      close={close}
    >
      <Typography
        variant="h3"
        sx={{ mt: 0, mb: 1, display: "flex", alignItems: "center" }}
      >
        <ShareIcon sx={{ mr: 1 }} /> Share call
      </Typography>
      <CallLink />

      {Boolean(pendingUsers.length) && (
        <>
          <Typography
            variant="h3"
            id={pendingUsersHeadingId}
            sx={{
              mt: { xs: 2, sm: 1 },
              mb: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <RingVolumeIcon sx={{ mr: 1 }} color="warning" /> Pending users
          </Typography>
          <UsersList aria-labelledby={pendingUsersHeadingId}>
            {pendingUsers.map((pending) => (
              <UsersListItem
                key={pending.uid}
                user={pending}
                action={
                  isCurrentUserHosting && (
                    <PendingUserActions userUid={pending.userUid} />
                  )
                }
              />
            ))}
          </UsersList>
        </>
      )}

      <Typography
        variant="h3"
        id={participantsHeadingId}
        sx={{ mt: 2, mb: 2, display: "flex", alignItems: "center" }}
      >
        <WifiCalling3Icon sx={{ mr: 1 }} /> Participants in call
      </Typography>
      <UsersList aria-labelledby={participantsHeadingId}>
        {participants.map((participant) => (
          <UsersListItem key={participant.uid} user={participant} />
        ))}
      </UsersList>
    </DialogModal>
  );
}

function CallLink() {
  const link = `${window.location.origin}${window.location.pathname}`;

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(link);
    setSuccessOpen(true);
  };

  const [isSuccessOpen, setSuccessOpen] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: { xs: "stretch", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Typography
        sx={{
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          paddingRight: 1,
        }}
      >
        {link}
      </Typography>

      <Button
        onClick={handleCopyClick}
        variant="contained"
        color="primary"
        startIcon={<LinkIcon />}
      >
        Copy
      </Button>

      <Snackbar
        open={isSuccessOpen}
        autoHideDuration={3 * 1000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Call link copied to the clipboard.
        </Alert>
      </Snackbar>
    </Box>
  );
}

function UsersList(
  props: Pick<HTMLProps<HTMLDListElement>, "children" | "aria-labelledby">
) {
  return (
    <Box
      component="ul"
      sx={{ listStyle: "none", m: 0, p: 0 }}
      aria-labelledby={props["aria-labelledby"]}
    >
      {props.children}
    </Box>
  );
}

interface UsersListItemProps {
  user: CallUser;
  action?: ReactNode;
}

function UsersListItem({ user, action }: UsersListItemProps) {
  return (
    <Box
      component="li"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      key={user.uid}
    >
      <Typography component="span">{user.userDisplayName}</Typography>
      {action}
    </Box>
  );
}

interface PendingUserActionsProps {
  userUid: string;
}

function PendingUserActions({ userUid }: PendingUserActionsProps) {
  const dispatch = useAppDispatch();

  const handleRejectClick = () => dispatch(rejectPendingUser({ userUid }));
  const handleAcceptClick = () => dispatch(acceptPendingUser({ userUid }));

  return (
    <Box>
      <Button color="error" variant="contained" onClick={handleRejectClick}>
        Reject
      </Button>
      <Button
        color="primary"
        variant="contained"
        sx={{
          ml: 1,
        }}
        onClick={handleAcceptClick}
      >
        Accept
      </Button>
    </Box>
  );
}
