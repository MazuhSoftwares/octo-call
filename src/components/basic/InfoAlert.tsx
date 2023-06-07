import { ReactNode } from "react";
import Alert, { AlertProps } from "@mui/material/Alert";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

export interface InfoAlertProps {
  message: string | ReactNode;
  sx?: AlertProps["sx"];
}

export default function InfoAlert({ message, sx = {} }: InfoAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert severity="info" icon={<InfoOutlined color="info" />} sx={sx}>
      {message}
    </Alert>
  );
}
