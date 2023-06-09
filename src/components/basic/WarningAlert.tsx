import { ReactNode } from "react";
import Alert, { AlertProps } from "@mui/material/Alert";

export interface WarningAlertProps {
  message: string | ReactNode;
  sx?: AlertProps["sx"];
}

export default function WarningAlert({ message, sx = {} }: WarningAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert severity="warning" sx={sx}>
      {message}
    </Alert>
  );
}
