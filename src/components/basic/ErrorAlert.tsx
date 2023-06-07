import { ReactNode } from "react";
import Alert, { AlertProps } from "@mui/material/Alert";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export interface ErrorAlertProps {
  message: string | ReactNode;
  prefix?: string;
  sx?: AlertProps["sx"];
}

export default function ErrorAlert({
  message,
  prefix = "Error!",
  sx = {},
}: ErrorAlertProps) {
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
    <Alert
      severity="error"
      icon={<ErrorOutlineIcon color="secondary" sx={sx} />}
    >
      <strong>{prefix}</strong> {fixedMessage}
    </Alert>
  );
}
