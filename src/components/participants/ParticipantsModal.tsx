import Typography from "@mui/material/Typography";
import GroupIcon from "@mui/icons-material/Group";
import DialogModal from "../basic/DialogModal";
import { useAppSelector } from "../../state";
import { selectCallUsers } from "../../state/callUsers";

export interface ParticipantsModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function ParticipantsModal({
  isOpen,
  close,
}: ParticipantsModalProps) {
  const callUsers = useAppSelector(selectCallUsers);

  const participantNames = callUsers.participants.map((participant) => (
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
