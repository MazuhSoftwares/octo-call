import { useRef } from "react";
import CallTemplate from "../../components/templates/CallTemplate";
import Video from "../../components/basic/Video";
import * as p2p from "../../webrtc/p2p-call"; // TODO: remove it after experiments

export default function P2PCallMain() {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const cRef = useRef<HTMLVideoElement>(null);
  const dRef = useRef<HTMLVideoElement>(null);

  return (
    <CallTemplate>
      <p>Imagine a P2P call happening here.</p>
      <Video aria-label="Newest" id="n-local" ref={aRef} />
      <Video aria-label="Newest" id="n-remote" ref={bRef} />
      <Video aria-label="Oldest" id="o-local" ref={cRef} />
      <Video aria-label="Oldest" id="o-remote" ref={dRef} />
    </CallTemplate>
  );
}

(window as any).experimentStart = async () => {
  const nLocal = document.getElementById("n-local") as HTMLVideoElement;
  const nRemote = document.getElementById("n-remote") as HTMLVideoElement;
  const oLocal = document.getElementById("o-local") as HTMLVideoElement;
  const oRemote = document.getElementById("o-remote") as HTMLVideoElement;

  let newestCall = await p2p.makeP2PCall({
    audio: false,
    video: true,
    // onLocalStream: () => console.warn("Newest local track, ignoring."),
    onLocalStream: (stream) => (nLocal.srcObject = stream),
    // onRemoteStream: () => console.warn("Newest remote track, ignoring."),
    onRemoteStream: (stream) => (nRemote.srcObject = stream),
  });
  (window as any).newestCall = newestCall;

  let oldestCall = await p2p.makeP2PCall({
    audio: false,
    video: true,
    // onLocalStream: () => console.warn("Oldest local track, ignoring."),
    onLocalStream: (stream) => (oLocal.srcObject = stream),
    // onRemoteStream: () => console.warn("Oldest remote track, ignoring."),
    onRemoteStream: (stream) => (oRemote.srcObject = stream),
  });
  (window as any).oldestCall = oldestCall;

  console.log("Create/sets local Offer");
  newestCall = await p2p.doNewestPeerAction(newestCall);

  console.log("Sends Offer", newestCall.newestPeerOfferSDP);

  console.log("Sets remote Offer");
  oldestCall = await p2p.handleNewestPeerAction(
    oldestCall,
    newestCall.newestPeerOfferSDP as string
  );

  console.log("Creates/sets local Answer");
  oldestCall = await p2p.doOldestPeerAction(oldestCall);

  console.log("Sends Answer", oldestCall.oldestPeerAnswerSDP);

  console.log("Sets remote Answer");
  newestCall = await p2p.handleOldestPeerAction(
    newestCall,
    oldestCall.oldestPeerAnswerSDP as string
  );

  console.log("Ok.");
  (window as any).experimentStop = () => {
    newestCall.stop();
    oldestCall.stop();
  };
};
