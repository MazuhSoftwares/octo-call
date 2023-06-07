import { HTMLProps } from "react";
import { visuallyHidden } from "@mui/utils";
import Box, { BoxProps } from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

export interface ToggleCamButtonProps {
  handleToggleCamClick: HTMLProps<HTMLButtonElement>["onClick"];
  isVideoEnabled: boolean;
  disabled?: boolean;
  sx?: BoxProps["sx"];
}

export default function ToggleCamButton({
  handleToggleCamClick,
  isVideoEnabled,
  disabled,
  sx = {},
}: ToggleCamButtonProps) {
  return (
    <IconButton
      aria-label="Toggle camera"
      title="Toggle camera"
      onClick={handleToggleCamClick}
      size="large"
      color={isVideoEnabled ? "info" : "error"}
      disabled={disabled}
      sx={sx}
    >
      {isVideoEnabled ? (
        <>
          <Box sx={visuallyHidden}>Camera is on.</Box>
          <VideocamIcon fontSize="medium" />
        </>
      ) : (
        <>
          <Box sx={visuallyHidden}>Camera is off.</Box>
          <VideocamOffIcon fontSize="medium" />
        </>
      )}
    </IconButton>
  );
}
