import GroupIcon from "@mui/icons-material/Group";
import DialogModal from "../basic/DialogModal";

export interface ParticipantsModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function ParticipantsModal({
  isOpen,
  close,
}: ParticipantsModalProps) {
  return (
    <DialogModal
      title="Participants"
      icon={<GroupIcon />}
      isOpen={isOpen}
      close={close}
    >
      TODO.
    </DialogModal>
  );
}
