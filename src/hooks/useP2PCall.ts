import { useEffect, useRef, useState } from "react";
import webrtc, { CallP2PDescription, P2PCallConnection } from "../webrtc";
import { useAppSelector } from "../state";
import { selectUserAudioId, selectUserVideoId } from "../state/devices";

export interface P2PCallHookOptions {
  isLocalPeerTheOfferingNewest: boolean;
  description: CallP2PDescription;
  setDescription: (description: Partial<CallP2PDescription>) => void;
  remoteVideo: () => HTMLVideoElement | null;
  localVideo?: () => HTMLVideoElement | null;
}

export default function useP2PCall(options: P2PCallHookOptions): void {
  const { description } = options;
  const {
    isLocalPeerTheOfferingNewest,
    setDescription,
    localVideo,
    remoteVideo,
  } = useRef(options).current; // only consider initial values

  const audio = useAppSelector(selectUserAudioId);
  const video = useAppSelector(selectUserVideoId);

  const callRef = useRef<P2PCallConnection | null>(null);

  useEffect(() => {
    if (!callRef.current) {
      console.log("Creating call.");
      callRef.current = webrtc.makeP2PCallConnection({
        audio,
        video,
        isLocalPeerTheOfferingNewest,
        outgoingSignaling: {
          onLocalJsepAction: async (localJsep) => {
            // call signaling here instead of calling in component itself?
            if (isLocalPeerTheOfferingNewest) {
              setDescription({
                newestPeerOffer: localJsep,
              });
            } else {
              setDescription({
                oldestPeerAnswer: localJsep,
              });
            }
          },
          onCompletedLocalIceCandidates(localCandidates) {
            // call signaling here instead of calling in component itself?
            if (isLocalPeerTheOfferingNewest) {
              setDescription({
                newestPeerIceCandidates: localCandidates,
              });
            } else {
              setDescription({
                oldestPeerIceCandidates: localCandidates,
              });
            }
          },
        },
        onLocalStream: (stream) => {
          const element = localVideo ? localVideo() : null;
          if (element && stream) {
            webrtc.domHelpers.attachLocalStream(element, stream);
          } else if (stream) {
            console.error(
              "Truthy local stream provided, but no element available."
            );
          }
        },
        onRemoteStream: (stream) => {
          const element = remoteVideo ? remoteVideo() : null;
          if (element && stream) {
            webrtc.domHelpers.attachRemoteStream(element, stream);
          } else if (stream) {
            console.error(
              "Truthy remote stream provided, but no element available."
            );
          }
        },
      });
    }

    console.log("Starting call.");
    callRef.current.start();

    return () => {
      console.log("Stopping call due to effect cleanup.");
      callRef.current?.stop();
    };
  }, [
    audio,
    video,
    isLocalPeerTheOfferingNewest,
    setDescription,
    localVideo,
    remoteVideo,
  ]);

  const [cachedDescription, setCachedDescription] =
    useState<CallP2PDescription>({
      uid: description.uid,
    });

  useEffect(() => {
    if (!callRef.current) {
      console.error(
        "Got description update while call instance was not ready."
      );
      return;
    }

    const call = callRef.current;

    const cachedKeys = Object.keys(
      cachedDescription
    ) as (keyof CallP2PDescription)[];

    const newKeys = (
      Object.keys(description) as (keyof CallP2PDescription)[]
    ).filter((k) => !cachedKeys.includes(k));

    const diff = newKeys.reduce(
      (acc, k) => ({ ...acc, [k]: description[k] }),
      {}
    ) as CallP2PDescription;

    if (Object.keys(diff).length === 0) {
      return;
    }

    setCachedDescription(description);

    if (isLocalPeerTheOfferingNewest) {
      if (diff.oldestPeerIceCandidates) {
        console.log(
          "Newest peer received incoming ice candidates.",
          diff.oldestPeerIceCandidates
        );
        diff.oldestPeerIceCandidates.forEach((c) => {
          call.incomingSignaling.handleRemoteIceCandidate(c);
        });
      }

      if (diff.oldestPeerAnswer) {
        console.log(
          "Newest peer received incoming answer.",
          diff.oldestPeerAnswer
        );
        call.incomingSignaling.handleRemoteJsepAction(diff.oldestPeerAnswer);
      }
    } else {
      if (diff.newestPeerIceCandidates) {
        console.log(
          "Oldest peer received incoming ice candidates.",
          diff.newestPeerIceCandidates
        );
        diff.newestPeerIceCandidates.forEach((c) => {
          call.incomingSignaling.handleRemoteIceCandidate(c);
        });
      }

      if (diff.newestPeerOffer) {
        console.log(
          "Newest peer received incoming offer.",
          diff.newestPeerOffer
        );
        call.incomingSignaling.handleRemoteJsepAction(diff.newestPeerOffer);
      }
    }
  }, [isLocalPeerTheOfferingNewest, cachedDescription, description]);
}
