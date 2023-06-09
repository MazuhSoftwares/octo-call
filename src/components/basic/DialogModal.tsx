import { ReactNode, useId } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";

export interface DialogModalProps {
  children: ReactNode;
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  close?: () => void;
}

export default function DialogModal({
  children,
  title,
  icon,
  isOpen,
  close,
}: DialogModalProps) {
  const titleId = useId();

  return (
    <Dialog open={isOpen} onClose={close} aria-labelledby={titleId} fullWidth>
      <Box component="section">
        <Box component="header">
          <DialogTitle
            id={titleId}
            sx={{ display: "flex", alignItems: "center" }}
          >
            {Boolean(icon) && (
              <Box component="span" sx={{ display: "inline-flex", mr: 1 }}>
                {icon}
              </Box>
            )}
            <Box component="span">{title}</Box>
          </DialogTitle>
          {!!close && (
            <IconButton
              aria-label="Close"
              onClick={close}
              sx={{ display: "flex", position: "absolute", top: 16, right: 24 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <DialogContent sx={{ pt: 0 }}>{children}</DialogContent>
      </Box>
    </Dialog>
  );
}
