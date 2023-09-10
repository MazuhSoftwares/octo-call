import { useEffect, forwardRef, RefObject, HTMLProps } from "react";
import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getThemedColor } from "../app/mui-styles";
import webrtc from "../../webrtc";

export interface VideoProps extends HTMLProps<HTMLVideoElement> {
  displayName?: string;
  wrapperBoxProps?: BoxProps;
  sx?: BoxProps["sx"];
}

export const Video = forwardRef<HTMLVideoElement | null, VideoProps>(
  (props, ref) => {
    const {
      wrapperBoxProps = {},
      sx = {},
      displayName = "",
      hidden,
      ...videoProps
    } = props;
    const videoRef = ref as RefObject<HTMLVideoElement>;

    useEffect(() => {
      webrtc.domHelpers.initVideoElement(videoRef.current as HTMLVideoElement);
    }, [videoRef]);

    return (
      <Box {...wrapperBoxProps} hidden={hidden}>
        <Box
          sx={{
            position: "relative",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid",
            borderColor: getThemedColor("commonBorder"),
          }}
        >
          <Box
            {...videoProps}
            component="video"
            role="video"
            ref={videoRef}
            sx={{ display: "flex", width: "100%", ...sx }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "24px",
              left: "24px",
              padding: "16px",
              background: "rgba(22, 25, 41, 0.4)",
            }}
          >
            <Typography component="span">{displayName}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default Video;
