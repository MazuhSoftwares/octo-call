import GroupIcon from "@mui/icons-material/Group";
import DialogModal from "../basic/DialogModal";
import { useContext } from "react";
import { Typography } from "@mui/material";
import CallUsersContext from "../../contexts/CallUsersContext";

export interface ParticipantsModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function ParticipantsModal({
  isOpen,
  close,
}: ParticipantsModalProps) {
  const callUsersContext = useContext(CallUsersContext);

  const participantNames = callUsersContext.participants.map((participant) => (
    <li key={participant.uid}>
      <Typography>{participant.userDisplayName}</Typography>
    </li>
  ));

  return (
    <DialogModal
      title="Participants"
      icon={<GroupIcon />}
      isOpen={isOpen}
      close={close}
    >
      <ul>{participantNames}</ul>
    </DialogModal>
  );
}
