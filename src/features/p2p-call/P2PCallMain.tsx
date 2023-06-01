import { useRef } from "react";
import Box from "@mui/material/Box";
import CallTemplate from "../../components/templates/CallTemplate";
import Video from "../../components/basic/Video";
import webrtc from "../../webrtc";

export default function P2PCallMain() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const cRef = useRef<HTMLVideoElement>(null);
  const dRef = useRef<HTMLVideoElement>(null);

  return (
    <CallTemplate>
      <p>Imagine a P2P call happening here.</p>
      <p>
        Using Console Inspector, type <code>experimentStart()</code>. Open{" "}
        <code>chrome://webrtc-internals/</code> to see 2 calls in place. Then
        finish it with <code>experimentStop()</code> to observe these calls
        vanishing.
      </p>
      <Box sx={{ display: "flex" }}>
        <Video
          title="Oldest local"
          id="o-local"
          ref={cRef}
          sx={{ maxWidth: "300px" }}
        />
        <Video
          title="Oldest remote"
          id="o-remote"
          ref={dRef}
          sx={{ maxWidth: "300px" }}
        />
        <Video
          title="Newest local"
          id="n-local"
          ref={aRef}
          sx={{ maxWidth: "300px" }}
        />
        <Video
          title="Newest remote"
          id="n-remote"
          ref={bRef}
          sx={{ maxWidth: "300px" }}
        />
      </Box>
    </CallTemplate>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).experimentStart = async () => {
  // elements

  const oLocal = document.getElementById("o-local") as HTMLVideoElement;
  const oRemote = document.getElementById("o-remote") as HTMLVideoElement;

  const nLocal = document.getElementById("n-local") as HTMLVideoElement;
  const nRemote = document.getElementById("n-remote") as HTMLVideoElement;

  // oldest participant

  const oldestCall = webrtc.makeP2PCallConnection({
    audio: true,
    video: true,
    isLocalPeerTheOfferingNewest: false,
    outgoingSignaling: {
      onLocalJsepAction: async (localJsep) => {
        console.log("Sending jsep from oldest to newest.", localJsep);
        // let's pretend it was sent elsewhere

        // and let's pretend it came magically here from the network on the other side:
        newestCall.incomingSignaling.handleRemoteJsepAction(localJsep);
      },
      onLocalIceCandidate: async (localIceCandidate) => {
        console.log(
          "Sending candidate from oldest to newest.",
          localIceCandidate
        );
        // let's pretend it was sent elsewhere

        // and let's pretend it came magically here from the network on the other side:
        newestCall.incomingSignaling.handleRemoteIceCandidate(
          localIceCandidate
        );
      },
    },
  });
  oldestCall.onLocalStream = (stream) =>
    webrtc.domHelpers.attachLocalStream(oLocal, stream);
  oldestCall.onRemoteStream = (stream) =>
    webrtc.domHelpers.attachRemoteStream(oRemote, stream);

  // newest participant

  const newestCall = webrtc.makeP2PCallConnection({
    audio: true,
    video: true,
    isLocalPeerTheOfferingNewest: true,
    outgoingSignaling: {
      onLocalJsepAction: async (localJsep) => {
        console.log("Sending jsep from newest to oldest.", localJsep);
        // let's pretend it was sent elsewhere

        // and let's pretend it came magically here from the network on the other side:
        oldestCall.incomingSignaling.handleRemoteJsepAction(localJsep);
      },
      onLocalIceCandidate: async (localIceCandidate) => {
        console.log(
          "Sending candidate from newest to oldest.",
          localIceCandidate
        );
        // let's pretend it was sent elsewhere

        // and let's pretend it came magically here from the network on the other side:
        oldestCall.incomingSignaling.handleRemoteIceCandidate(
          localIceCandidate
        );
      },
    },
  });
  newestCall.onLocalStream = (stream) =>
    webrtc.domHelpers.attachLocalStream(nLocal, stream);
  newestCall.onRemoteStream = (stream) =>
    webrtc.domHelpers.attachRemoteStream(nRemote, stream);

  // let's do it.

  console.log(
    "Starting oldest (well, it seems to make sense to start it first)..."
  );
  await oldestCall.start();
  console.log("Starting newest connection...");
  await newestCall.start();
  console.log("Connections started.");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).experimentStop = () => {
    console.log("Stopping newest...");
    newestCall.stop();
    console.log("Stopping oldest...");
    oldestCall.stop();
  };
};
