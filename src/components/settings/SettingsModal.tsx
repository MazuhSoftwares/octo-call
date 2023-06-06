import { useId, useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsVoiceIcon from "@mui/icons-material/SettingsVoice";
import VideoSettingsIcon from "@mui/icons-material/VideoSettings";
import AudioInputSelector from "../devices/AudioInputSelector";
import VideoInputSelector from "../devices/VideoInputSelector";
import DialogModal from "../basic/DialogModal";

export interface SettingsModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function SettingsModal({ isOpen, close }: SettingsModalProps) {
  const audioTabId = useId();
  const audioTabPanelId = useId();
  const audioTabIndex = 0;

  const videoTabId = useId();
  const videoTabPanelId = useId();
  const videoTabIndex = 1;

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const handleChange = (_event: unknown, newValue: number) => {
    setSelectedTabIndex(newValue);
  };

  return (
    <DialogModal
      title="Settings"
      icon={<SettingsIcon fontSize="medium" />}
      isOpen={isOpen}
      close={close}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTabIndex}
          onChange={handleChange}
          aria-label="Settings"
        >
          <Tab
            icon={<SettingsVoiceIcon />}
            iconPosition="start"
            label="Microphone"
            id={audioTabId}
            aria-controls={audioTabPanelId}
          />
          <Tab
            icon={<VideoSettingsIcon />}
            iconPosition="start"
            label="Camera"
            id={videoTabId}
            aria-controls={videoTabPanelId}
          />
        </Tabs>
      </Box>
      <Box
        role="tabpanel"
        hidden={selectedTabIndex !== audioTabIndex}
        id={audioTabPanelId}
        aria-labelledby={audioTabId}
        sx={{ pt: 3 }}
      >
        {selectedTabIndex === audioTabIndex && <AudioInputSelector />}
      </Box>
      <Box
        role="tabpanel"
        hidden={selectedTabIndex !== videoTabIndex}
        id={videoTabPanelId}
        aria-labelledby={videoTabId}
        sx={{ pt: 3 }}
      >
        {selectedTabIndex === videoTabIndex && <VideoInputSelector />}
      </Box>
    </DialogModal>
  );
}
