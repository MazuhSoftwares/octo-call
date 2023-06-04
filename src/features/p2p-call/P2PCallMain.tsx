import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import CallTemplate from "../../components/templates/CallTemplate";
import Video from "../../components/basic/Video";
import type { CallP2PDescription } from "../../webrtc";
import useP2PCall from "../../hooks/useP2PCall";

export default function P2PCallMain() {
  // TODO: manage it with redux and service layers,
  // in real life it doesnt make sense for it to be just a local state.
  const [description, setDescription] = useState<CallP2PDescription>({
    uid: "experimental-call-42",
  });

  useP2PCall({
    isLocalPeerTheOfferingNewest: false,
    description,
    setDescription,
    localVideo: () => oldestCallLocalVideoRef.current,
    remoteVideo: () => oldestCallRemoteVideoRef.current,
  });

  useP2PCall({
    isLocalPeerTheOfferingNewest: true,
    description,
    setDescription,
    localVideo: () => newestCallLocalVideoRef.current,
    remoteVideo: () => newestCallRemoteVideoRef.current,
  });

  const oldestCallLocalVideoRef = useRef<HTMLVideoElement>(null);
  const oldestCallRemoteVideoRef = useRef<HTMLVideoElement>(null);
  const newestCallLocalVideoRef = useRef<HTMLVideoElement>(null);
  const newestCallRemoteVideoRef = useRef<HTMLVideoElement>(null);

  return (
    <CallTemplate>
      <Box sx={{ display: "flex" }}>
        <Video
          title="Oldest local"
          ref={oldestCallLocalVideoRef}
          sx={{ maxWidth: "300px" }}
        />
        <Video
          title="Oldest remote"
          ref={oldestCallRemoteVideoRef}
          sx={{ maxWidth: "300px" }}
        />
        <Video
          title="Newest local"
          ref={newestCallLocalVideoRef}
          sx={{ maxWidth: "300px" }}
        />
        <Video
          title="Newest remote"
          ref={newestCallRemoteVideoRef}
          sx={{ maxWidth: "300px" }}
        />
      </Box>
    </CallTemplate>
  );
}
