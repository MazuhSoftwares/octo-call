import { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

export interface InfoAlertProps {
  message: string | ReactNode;
}

export default function InfoAlert({ message }: InfoAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert severity="info" icon={<InfoOutlined color="info" />}>
      {message}
    </Alert>
  );
}
