import GroupIcon from "@mui/icons-material/Group";
import DialogModal from "../basic/DialogModal";
import { useContext } from "react";
import CallGuestsContext from "../../contexts/CallGuestsContext";
import { Typography } from "@mui/material";

export interface ParticipantsModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function ParticipantsModal({
  isOpen,
  close,
}: ParticipantsModalProps) {
  const callGuestsContext = useContext(CallGuestsContext);

  const participantNames = callGuestsContext.participants.map((participant) => (
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
