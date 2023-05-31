import { useEffect, forwardRef, RefObject, HTMLProps } from "react";
import Box, { BoxProps } from "@mui/material/Box";
import { getThemedColor } from "../styles";
import webrtc from "../../webrtc";

export interface VideoProps extends HTMLProps<HTMLVideoElement> {
  wrapperBoxProps?: BoxProps;
}

export const Video = forwardRef<HTMLVideoElement | null, VideoProps>(
  (props, ref) => {
    const { wrapperBoxProps = {}, ...videoProps } = props;
    const videoRef = ref as RefObject<HTMLVideoElement>;

    useEffect(() => {
      webrtc.domHelpers.initVideoElement(videoRef.current as HTMLVideoElement);
    }, [videoRef]);

    return (
      <Box {...wrapperBoxProps}>
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
            ref={videoRef}
            sx={{ display: "flex", width: "100%" }}
          />
        </Box>
      </Box>
    );
  }
);

export default Video;
