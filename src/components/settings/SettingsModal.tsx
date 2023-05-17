import { useId, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CloseIcon from "@mui/icons-material/Close";
import AudioInputSelector from "../devices/AudioInputSelector";
import VideoInputSelector from "../devices/VideoInputSelector";

export interface SettingsModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function SettingsModal({ isOpen, close }: SettingsModalProps) {
  const titleId = useId();

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
    <Dialog open={isOpen} onClose={close} aria-labelledby={titleId} fullWidth>
      <Box>
        <DialogTitle id={titleId}>Settings</DialogTitle>
        <IconButton
          aria-label="Close"
          onClick={close}
          sx={{ display: "flex", position: "absolute", top: 16, right: 24 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={selectedTabIndex}
              onChange={handleChange}
              aria-label="Settings"
            >
              <Tab
                label="Microphone"
                id={audioTabId}
                aria-controls={audioTabPanelId}
              />
              <Tab
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
            <AudioInputSelector />
          </Box>
          <Box
            role="tabpanel"
            hidden={selectedTabIndex !== videoTabIndex}
            id={videoTabPanelId}
            aria-labelledby={videoTabId}
            sx={{ pt: 3 }}
          >
            <VideoInputSelector />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
