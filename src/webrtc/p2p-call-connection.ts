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
  incomingSignaling: P2PCallIncomingSignaling;
  onLocalStream?: StreamListener;
  onRemoteStream?: StreamListener;
}

export interface P2PCallConnectionOptions {
  uuid?: string;
  audio: string | boolean;
  video: string | boolean;
  isLocalPeerTheOfferingNewest: boolean;
  outgoingSignaling: P2PCallOutgoingSignaling;
  onLocalStream?: StreamListener;
  onRemoteStream?: StreamListener;
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
      p2pCall._iceCandidates = [];

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

  const p2pCall: P2PCallConnectionDetailed = {
    uuid: options.uuid || uuidv4(),
    options,
    start,
    stop,
    incomingSignaling: {
      handleRemoteJsepAction: () => Promise.resolve(),
      handleRemoteIceCandidate: () => Promise.resolve(),
    },
    onLocalStream: options.onLocalStream,
    onRemoteStream: options.onRemoteStream,
    _connection: connection,
    _localStream: null,
    _remoteStream: null,
    _iceCandidates: [],
  };

  p2pCall._connection.addEventListener("track", (event) => {
    if (event.streams.length !== 1) {
      console.warn(
        "Unusual stream quantity found in track event:",
        event.streams.length
      );
    }

    buildRemoteMediaFromTrackEvent(p2pCall, event);
  });

  p2pCall._connection.addEventListener("icecandidate", async (event) =>
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

export async function buildLocalMedia(p2pCall: P2PCallConnectionDetailed) {
  p2pCall._localStream = await navigator.mediaDevices.getUserMedia({
    audio: makeStandardAudioConstraints(p2pCall.options.audio),
    video: makeStandardAudioConstraints(p2pCall.options.video),
  });

  Array.from(p2pCall._localStream.getTracks()).forEach((t) =>
    p2pCall._connection.addTrack(t, p2pCall._localStream as MediaStream)
  );

  if (p2pCall.onLocalStream) {
    p2pCall.onLocalStream(p2pCall._localStream);
  }
}

export function destroyLocalMedia(p2pCall: P2PCallConnectionDetailed) {
  try {
    Array.from(p2pCall._localStream?.getTracks() || []).forEach((t) =>
      t.stop()
    );
  } catch (error) {
    console.error("Error while destroying local media.", error);
  }

  if (p2pCall.onLocalStream) {
    p2pCall.onLocalStream(null);
  }
}

export function destroyRemoteMedia(p2pCall: P2PCallConnectionDetailed) {
  try {
    Array.from(p2pCall._remoteStream?.getTracks() || []).forEach((t) =>
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
  p2pCall: P2PCallConnectionDetailed,
  event: RTCTrackEvent
) {
  p2pCall._remoteStream = event.streams[0];

  if (p2pCall.onRemoteStream) {
    p2pCall.onRemoteStream(p2pCall._remoteStream);
  }
}

export async function doNewestPeerOffer(p2pCall: P2PCallConnectionDetailed) {
  const newestPeerLocalOffer = await p2pCall._connection.createOffer();
  await p2pCall._connection.setLocalDescription(newestPeerLocalOffer);

  await p2pCall.options.outgoingSignaling.onLocalJsepAction(
    newestPeerLocalOffer
  );
}

export async function handleNewestPeerOffer(
  p2pCall: P2PCallConnectionDetailed,
  newestPeerRemoteOffer: RTCSessionDescriptionInit
) {
  if (newestPeerRemoteOffer.type !== "offer") {
    throw new Error(
      "Tried to handle Jsep action coming from newest peer, but did not receive an offer."
    );
  }

  await p2pCall._connection.setRemoteDescription(newestPeerRemoteOffer);

  await doOldestPeerAnswer(p2pCall);
}

export async function doOldestPeerAnswer(p2pCall: P2PCallConnectionDetailed) {
  const oldestPeerLocalAnswer = await p2pCall._connection.createAnswer();
  await p2pCall._connection.setLocalDescription(oldestPeerLocalAnswer);

  await p2pCall.options.outgoingSignaling.onLocalJsepAction(
    oldestPeerLocalAnswer
  );
}

export async function handleOldestPeerAnswer(
  p2pCall: P2PCallConnectionDetailed,
  oldestPeerRemoteAnswer: RTCSessionDescriptionInit
) {
  if (oldestPeerRemoteAnswer.type !== "answer") {
    throw new Error(
      "Tried to handle Jsep action coming from oldest peer, but did not receive an answer."
    );
  }

  await p2pCall._connection.setRemoteDescription(oldestPeerRemoteAnswer);
}

export async function handleLocalIceCandidate(
  p2pCall: P2PCallConnectionDetailed,
  localIceCandidate: RTCIceCandidate | null
) {
  if (
    !p2pCall.options.outgoingSignaling.onCompletedLocalIceCandidates &&
    !p2pCall.options.outgoingSignaling.onLocalIceCandidate
  ) {
    console.warn(
      "Local ice candidate being ignored, no ICE handlers provided on `outgoingSignaling` option."
    );
  }

  if (!localIceCandidate) {
    if (p2pCall.options.outgoingSignaling.onCompletedLocalIceCandidates) {
      await p2pCall.options.outgoingSignaling.onCompletedLocalIceCandidates(
        p2pCall._iceCandidates.map((it) => it.toJSON())
      );
    }

    return;
  }

  p2pCall._iceCandidates.push(localIceCandidate);
  if (p2pCall.options.outgoingSignaling.onLocalIceCandidate) {
    await p2pCall.options.outgoingSignaling.onLocalIceCandidate(
      localIceCandidate.toJSON()
    );
  }
}

export async function handleRemoteIceCandidate(
  p2pCall: P2PCallConnectionDetailed,
  remoteIceCandidate: RTCIceCandidateInit
) {
  await p2pCall._connection.addIceCandidate(remoteIceCandidate);
}

// These details could be just regular variables in the `make...` function,
// but... it might be funny to leave this still easily available for people
// experimenting WebRTC implementation stuff.
export interface P2PCallConnectionDetailed extends P2PCallConnection {
  _connection: RTCPeerConnection;
  _localStream: MediaStream | null;
  _remoteStream: MediaStream | null;
  _iceCandidates: RTCIceCandidate[];
}

export interface P2PCallIncomingSignaling {
  handleRemoteJsepAction: JsepHandler;
  handleRemoteIceCandidate: IceCandidateHandler;
}

export interface P2PCallOutgoingSignaling {
  onLocalJsepAction: JsepHandler;
  onLocalIceCandidate?: IceCandidateHandler;
  onCompletedLocalIceCandidates?: (
    iceCandidates: RTCIceCandidateInit[]
  ) => Promise<void> | void;
}

export type StreamListener = (stream: MediaStream | null) => void;

export type JsepHandler = (
  jsepDescription: RTCSessionDescriptionInit
) => Promise<void> | void;

export type IceCandidateHandler = (
  iceCandidate: RTCIceCandidateInit
) => Promise<void> | void;
