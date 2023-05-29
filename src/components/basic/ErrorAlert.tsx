import { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export interface ErrorAlertProps {
  message: string | ReactNode;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) {
    return null;
  }

  const fixedMessage =
    typeof message === "string" &&
    !message.trim().endsWith("!") &&
    !message.trim().endsWith(".") &&
    !message.trim().endsWith("?")
      ? message + "."
      : message;

  return (
    <Alert severity="error" icon={<ErrorOutlineIcon color="secondary" />}>
      <strong>Error!</strong> {fixedMessage}
    </Alert>
  );
}
