import { HTMLProps } from "react";
import { visuallyHidden } from "@mui/utils";
import Box, { BoxProps } from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

export interface ToggleMicButtonProps {
  handleToggleMicClick: HTMLProps<HTMLButtonElement>["onClick"];
  isAudioEnabled: boolean;
  disabled?: boolean;
  sx?: BoxProps["sx"];
}

export default function ToggleMicButton({
  handleToggleMicClick,
  isAudioEnabled,
  disabled,
  sx = {},
}: ToggleMicButtonProps) {
  return (
    <IconButton
      aria-label="Toggle microphone"
      title="Toggle microphone"
      onClick={handleToggleMicClick}
      size="large"
      color={isAudioEnabled ? "info" : "error"}
      disabled={disabled}
      sx={sx}
    >
      {isAudioEnabled ? (
        <>
          <Box sx={visuallyHidden}>Microphone is on.</Box>
          <MicIcon fontSize="medium" />
        </>
      ) : (
        <>
          <Box sx={visuallyHidden}>Microphone is off.</Box>
          <MicOffIcon fontSize="medium" />
        </>
      )}
    </IconButton>
  );
}
