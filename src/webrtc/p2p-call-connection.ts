/*

Javascript Session Establishment Protocol (JSEP), let's follow this algorithm:

+----------+                              +----------+ 
|          | Create/sets local Offer      |          | Newest must:
|          | ---+                         |          | `doNewestPeerOffer`
|          |    |                         |          |
|          | <--+                         |          |
|          |                              |          |
|          |                              |          |
|          | Sends Offer                  |          | (Signaling)
|          | ---------------------------> |          |
|          |                              |          |
|          |                              |          | 
|  Newest  |            Sets remote Offer |  Oldest  | Oldest must:
|   Peer   |                         +--- |   Peer   | `handleNewestPeerOffer`
|          |                         |    |          |
|          |                         +--> |          |
|          |                              |          |
|          |                              |          | 
|          |    Creates/sets local Answer |          | Oldest must:
|          |                         +--- |          | `doOldestPeerAnswer`
|          |                         |    |          |
|          |                         +--> |          |
|          |                              |          |
|          |                              |          |
|          | Sends Answer                 |          | (Signaling)
|          | <--------------------------- |          |
|          |                              |          |
|          |                              |          | 
|          | Sets remote Answer           |          | Newest must:
|          | ---+                         |          | `handleOldestPeerAnswer`
|          |    |                         |          |
|          | <--+                         |          |
+----------+                              +----------+

At the end, both sides will have its own SDP equivalent pair.

There's also an important ICE trickling process happening thru the signaling,
from/to both sides, omitted in the flow above, which is, accordingly to MDN,
the "process of continuing to send candidates after the initial offer or answer
has already been sent to the other peer."

*/

import { v4 as uuidv4 } from "uuid";
import { makeStandardAudioConstraints } from "./media-constraints";

export interface P2PCallConnection {
  readonly uuid: string;
  readonly options: P2PCallConnectionOptions;
  readonly start: () => Promise<void>;
  readonly stop: () => void;
  readonly connection: RTCPeerConnection;
  incomingSignaling: P2PCallIncomingSignaling;
  localStream?: MediaStream;
  onLocalStream?: StreamListener | null;
  remoteStream?: MediaStream;
  onRemoteStream?: StreamListener | null;
}

export interface P2PCallConnectionOptions {
  uuid?: string;
  audio: string | boolean;
  video: string | boolean;
  isLocalPeerTheOfferingNewest: boolean;
  outgoingSignaling: P2PCallOutgoingSignaling;
}

export function makeP2PCallConnection(
  options: P2PCallConnectionOptions
): P2PCallConnection {
  const connection = new RTCPeerConnection();

  let startingBegun = false;
  let startingFinished = false;
  let startingCanceled = false;

  const start = async () => {
    startingCanceled = false; // changed mind about any cancelation

    if (startingBegun) {
      return; // this is already in progress, calling again is no-op
    }

    startingBegun = true; // mark as begun, locking this function

    try {
      await buildLocalMedia(p2pCall);

      if (p2pCall.options.isLocalPeerTheOfferingNewest) {
        await doNewestPeerOffer(p2pCall); // hopefully, not a premature idea
      }
    } finally {
      startingFinished = true; // should release lock on stop function

      if (startingCanceled) {
        stop(); // lazily apply the stop command
      }
    }
  };

  const stop = () => {
    if (!startingFinished) {
      // too soon, this is locked!
      // but mark it for cancelation so it can be lazily exec.
      startingCanceled = true;
      return;
    }

    try {
      destroyLocalMedia(p2pCall);
      destroyRemoteMedia(p2pCall);
    } finally {
      connection.close();
    }
  };

  const p2pCall: P2PCallConnection = {
    uuid: options.uuid || uuidv4(),
    options,
    start,
    stop,
    connection,
    incomingSignaling: {
      handleRemoteJsepAction: () => Promise.resolve(),
      handleRemoteIceCandidate: () => Promise.resolve(),
    },
  };

  p2pCall.connection.addEventListener("track", (event) => {
    if (event.streams.length !== 1) {
      console.warn(
        "Unusual stream quantity found in track event:",
        event.streams.length
      );
    }

    buildRemoteMediaFromTrackEvent(p2pCall, event);
  });

  p2pCall.connection.addEventListener("icecandidate", async (event) =>
    handleLocalIceCandidate(p2pCall, event.candidate)
  );

  p2pCall.incomingSignaling = {
    handleRemoteJsepAction: (p2pCall.options.isLocalPeerTheOfferingNewest
      ? handleOldestPeerAnswer
      : handleNewestPeerOffer
    ).bind(null, p2pCall),
    handleRemoteIceCandidate: handleRemoteIceCandidate.bind(null, p2pCall),
  };

  return p2pCall;
}

export async function buildLocalMedia(p2pCall: P2PCallConnection) {
  p2pCall.localStream = await navigator.mediaDevices.getUserMedia({
    audio: makeStandardAudioConstraints(p2pCall.options.audio),
    video: makeStandardAudioConstraints(p2pCall.options.video),
  });

  Array.from(p2pCall.localStream.getTracks()).forEach((t) =>
    p2pCall.connection.addTrack(t, p2pCall.localStream as MediaStream)
  );

  if (p2pCall.onLocalStream) {
    p2pCall.onLocalStream(p2pCall.localStream);
  }
}

export function destroyLocalMedia(p2pCall: P2PCallConnection) {
  try {
    Array.from(p2pCall.localStream?.getTracks() || []).forEach((t) => t.stop());
  } catch (error) {
    console.error("Error while destroying local media.", error);
  }

  if (p2pCall.onLocalStream) {
    p2pCall.onLocalStream(null);
  }
}

export function destroyRemoteMedia(p2pCall: P2PCallConnection) {
  try {
    Array.from(p2pCall.remoteStream?.getTracks() || []).forEach((t) =>
      t.stop()
    );
  } catch (error) {
    console.error("Error while destroying remote media.", error);
  }

  if (p2pCall.onRemoteStream) {
    p2pCall.onRemoteStream(null);
  }
}

export function buildRemoteMediaFromTrackEvent(
  p2pCall: P2PCallConnection,
  event: RTCTrackEvent
) {
  p2pCall.remoteStream = event.streams[0];

  if (p2pCall.onRemoteStream) {
    p2pCall.onRemoteStream(p2pCall.remoteStream);
  }
}

export async function doNewestPeerOffer(p2pCall: P2PCallConnection) {
  const newestPeerLocalOffer = await p2pCall.connection.createOffer();
  await p2pCall.connection.setLocalDescription(newestPeerLocalOffer);

  await p2pCall.options.outgoingSignaling.onLocalJsepAction(
    newestPeerLocalOffer
  );
}

export async function handleNewestPeerOffer(
  p2pCall: P2PCallConnection,
  newestPeerRemoteOffer: RTCSessionDescriptionInit
) {
  await p2pCall.connection.setRemoteDescription(newestPeerRemoteOffer);

  await doOldestPeerAnswer(p2pCall);
}

export async function doOldestPeerAnswer(p2pCall: P2PCallConnection) {
  const oldestPeerLocalAnswer = await p2pCall.connection.createAnswer();
  await p2pCall.connection.setLocalDescription(oldestPeerLocalAnswer);

  await p2pCall.options.outgoingSignaling.onLocalJsepAction(
    oldestPeerLocalAnswer
  );
}

export async function handleOldestPeerAnswer(
  p2pCall: P2PCallConnection,
  oldestPeerRemoteAnswer: RTCSessionDescriptionInit
) {
  await p2pCall.connection.setRemoteDescription(oldestPeerRemoteAnswer);
}

export async function handleLocalIceCandidate(
  p2pCall: P2PCallConnection,
  localIceCandidate: RTCIceCandidate | null
) {
  if (!localIceCandidate) {
    return; // finished ice gathering
  }

  await p2pCall.options.outgoingSignaling.onLocalIceCandidate(
    localIceCandidate
  );
}

export async function handleRemoteIceCandidate(
  p2pCall: P2PCallConnection,
  remoteIceCandidate: RTCIceCandidate
) {
  await p2pCall.connection.addIceCandidate(remoteIceCandidate);
}

export interface P2PCallIncomingSignaling {
  handleRemoteJsepAction: JsepHandler;
  handleRemoteIceCandidate: IceCandidateHandler;
}

export interface P2PCallOutgoingSignaling {
  onLocalJsepAction: JsepHandler;
  onLocalIceCandidate: IceCandidateHandler;
}

export type StreamListener = (stream: MediaStream | null) => void;

export type JsepHandler = (
  jsepDescription: RTCSessionDescriptionInit
) => Promise<void>;

export type IceCandidateHandler = (
  iceCandidate: RTCIceCandidate
) => Promise<void>;
