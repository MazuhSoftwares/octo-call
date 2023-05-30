/*

Javascript Session Establishment Protocol (JSEP) flow:

+----------+                              +----------+ 
|          | Create/sets local Offer      |          | Newest must:
|          | ---+                         |          | `doNewestPeerAction`
|          |    |                         |          |
|          | <--+                         |          |
|          |                              |          |
|          |                              |          |
|          | Sends Offer                  |          | (Signaling)
|          | ---------------------------> |          |
|          |                              |          |
|          |                              |          | 
|  Newest  |            Sets remote Offer |  Oldest  | Oldest must:
|   Peer   |                         +--- |   Peer   | `handleNewestPeerAction`
|          |                         |    |          |
|          |                         +--> |          |
|          |                              |          |
|          |                              |          | 
|          |    Creates/sets local Answer |          | Oldest must:
|          |                         +--- |          | `doOldestPeerAction`
|          |                         |    |          |
|          |                         +--> |          |
|          |                              |          |
|          |                              |          |
|          | Sends Answer                 |          | (Signaling)
|          | <--------------------------- |          |
|          |                              |          |
|          |                              |          | 
|          | Sets remote Answer           |          | Newest must:
|          | ---+                         |          | `handleOldestPeerAction`
|          |    |                         |          |
|          | <--+                         |          |
+----------+                              +----------+

At the end, both sides will have its own SDP equivalent pair.

There's also an important ICE trickling process happening thru the signaling,
omitted in the flow above, which is, accordingly to MDN, the "process of
continuing to send candidates after the initial offer or answer has already
been sent to the other peer."

*/

import { makeStandardAudioConstraints } from "./media-constraints";

export interface P2PCallOptions {
  audio?: string | boolean;
  video?: string | boolean;
  onLocalStream?: (localStream: MediaStream) => void;
  onRemoteStream?: (remoteStream: MediaStream) => void;
  onIceCandidate?: (iceCandidate: RTCIceCandidate) => void;
}

export interface P2PCall {
  readonly connection: RTCPeerConnection;
  readonly options: P2PCallOptions;
  newestPeerOfferSDP?: string;
  oldestPeerAnswerSDP?: string;
  stop: () => void;
}

export async function makeP2PCall(options: P2PCallOptions): Promise<P2PCall> {
  // can we reuse the same stream over and over instead of creating new ones?
  const localStream = await navigator.mediaDevices.getUserMedia({
    audio: makeStandardAudioConstraints(options.audio),
    video: makeStandardAudioConstraints(options.video),
  });

  const connection = new RTCPeerConnection();

  const stop = () => {
    Array.from(localStream.getTracks()).forEach((t) => t.stop());
    connection.close();
  };

  try {
    localStream.getTracks().forEach((t) => connection.addTrack(t, localStream));
    if (options.onLocalStream) {
      options.onLocalStream(localStream);
    }

    connection.addEventListener("track", (event) => {
      if (event.streams.length !== 1) {
        console.warn(
          "Unusual stream quantity found in track event:",
          event.streams.length
        );
      }

      console.warn("remote track", event.streams[0].id, event);
      const remoteStream = event.streams[0];
      if (options.onRemoteStream) {
        options.onRemoteStream(remoteStream);
      }
    });

    connection.addEventListener("iceconnectionstatechange", (event) => {
      console.warn("Not implemented, on iceconnectionstatechange", event);
    });

    connection.addEventListener("icecandidate", async (event) => {
      if (!event.candidate) {
        console.log("Finished ICE gathering.");
        return;
      }

      console.log("ICE candidate:", event.candidate);

      if (options.onIceCandidate) {
        options.onIceCandidate(event.candidate);
      }
    });
  } catch (error) {
    stop();
    throw error;
  }

  return {
    connection,
    options,
    stop,
  };
}

export async function doNewestPeerAction(call: P2PCall): Promise<P2PCall> {
  const newestPeerOffer = await call.connection.createOffer();
  await call.connection.setLocalDescription(newestPeerOffer);
  return {
    ...call,
    newestPeerOfferSDP: newestPeerOffer.sdp,
  };
}

export async function handleNewestPeerAction(
  call: P2PCall,
  newestPeerOfferSDP: string
): Promise<P2PCall> {
  const newestPeerOffer: RTCSessionDescriptionInit = {
    sdp: newestPeerOfferSDP,
    type: "offer",
  };
  await call.connection.setRemoteDescription(newestPeerOffer);
  return { ...call, newestPeerOfferSDP: newestPeerOffer.sdp };
}

export async function doOldestPeerAction(call: P2PCall): Promise<P2PCall> {
  const oldestPeerAnswer = await call.connection.createAnswer();
  await call.connection.setLocalDescription(oldestPeerAnswer);
  return { ...call, oldestPeerAnswerSDP: oldestPeerAnswer.sdp };
}

export async function handleOldestPeerAction(
  call: P2PCall,
  oldestPeerAnswerSDP: string
): Promise<P2PCall> {
  const oldestPeerAnswer: RTCSessionDescriptionInit = {
    sdp: oldestPeerAnswerSDP,
    type: "answer",
  };
  await call.connection.setRemoteDescription(oldestPeerAnswer);
  return { ...call, oldestPeerAnswerSDP: oldestPeerAnswer.sdp };
}

export async function handleIceCandidate(
  call: P2PCall,
  candidate: RTCIceCandidate
): Promise<P2PCall> {
  call.connection.addIceCandidate(candidate);
  return call;
}
