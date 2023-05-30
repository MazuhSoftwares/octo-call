import { useEffect, forwardRef, RefObject } from "react";
import Box from "@mui/material/Box";
import { getThemedColor } from "../styles";

export interface VideoProps {
  "aria-label": string;
  id?: string;
}

export const Video = forwardRef<HTMLVideoElement | null, VideoProps>(
  (props, ref) => {
    const videoRef = ref as RefObject<HTMLVideoElement>;

    useEffect(() => {
      if (!videoRef) {
        console.error(
          "Programming error, there is a Video component without ref."
        );
        return;
      }

      if (!videoRef.current) {
        console.error(
          "Unavailable video element while handling Video component setup effect."
        );
        return;
      }

      videoRef.current.muted = true;
    }, [videoRef]);

    return (
      <Box aria-label={props["aria-label"]} sx={{ mt: 3 }}>
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
            id={props.id}
            component="video"
            ref={videoRef}
            sx={{
              display: "flex",
              width: "100%",
            }}
            disablePictureInPicture
            autoPlay
            playsInline
          />
        </Box>
      </Box>
    );
  }
);

export default Video;
