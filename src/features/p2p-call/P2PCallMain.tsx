import { useRef } from "react";
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
      <Video aria-label="Oldest" id="o-local" ref={cRef} />
      <Video aria-label="Oldest" id="o-remote" ref={dRef} />
      <Video aria-label="Newest" id="n-local" ref={aRef} />
      <Video aria-label="Newest" id="n-remote" ref={bRef} />
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
    audio: false,
    video: true,
    isLocalPeerTheOfferingNewest: false,
    outgoingSignaling: {
      onLocalJsepAction: async (localJsep) => {
        console.log("Sending jsep from oldest to newest.", localJsep);
        // and let's pretend it came magically here from the network on the other side:
        newestCall.incomingSignaling.handleRemoteJsepAction(localJsep);
      },
      onLocalIceCandidate: async (localIceCandidate) => {
        console.log(
          "Sending candidate from oldest to newest.",
          localIceCandidate
        );
        // and let's pretend it came magically here from the network on the other side:
        newestCall.incomingSignaling.handleRemoteIceCandidate(
          localIceCandidate
        );
      },
    },
  });
  oldestCall.onLocalStream = (stream) => (oLocal.srcObject = stream);
  oldestCall.onRemoteStream = (stream) => (oRemote.srcObject = stream);

  // newest participant

  const newestCall = webrtc.makeP2PCallConnection({
    audio: false,
    video: true,
    isLocalPeerTheOfferingNewest: true,
    outgoingSignaling: {
      onLocalJsepAction: async (localJsep) => {
        console.log("Sending jsep from newest to oldest.", localJsep);
        // and let's pretend it came magically here from the network on the other side:
        oldestCall.incomingSignaling.handleRemoteJsepAction(localJsep);
      },
      onLocalIceCandidate: async (localIceCandidate) => {
        console.log(
          "Sending candidate from newest to oldest.",
          localIceCandidate
        );
        // and let's pretend it came magically here from the network on the other side:
        oldestCall.incomingSignaling.handleRemoteIceCandidate(
          localIceCandidate
        );
      },
    },
  });
  newestCall.onLocalStream = (stream) => (nLocal.srcObject = stream);
  newestCall.onRemoteStream = (stream) => (nRemote.srcObject = stream);

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
