import { useEffect, useRef, useState } from "react";
import webrtc, { CallP2PDescription, P2PCallConnection } from "../webrtc";
import { useAppDispatch, useAppSelector } from "../state";
import { selectUserAudioId, selectUserVideoId } from "../state/devices";
import {
  patchP2PDescription,
  selectIceServersConfig,
  selectP2PDescriptionByUidFn,
} from "../state/call";

export interface P2PCallHookOptions {
  isLocalPeerTheOfferingNewer: boolean;
  p2pDescriptionUid: CallP2PDescription["uid"];
  remoteVideo: () => HTMLVideoElement | null;
  localVideo?: () => HTMLVideoElement | null;
}

export default function useP2PCall(options: P2PCallHookOptions): void {
  const dispatch = useAppDispatch();

  const { p2pDescriptionUid } = options;
  const description = useAppSelector(
    selectP2PDescriptionByUidFn(options.p2pDescriptionUid)
  );

  const iceServersConfig = useAppSelector(selectIceServersConfig);

  if (!description) {
    throw new Error(
      "Description not found for useP2PCall hook: " + p2pDescriptionUid
    );
  }

  const { isLocalPeerTheOfferingNewer, localVideo, remoteVideo } =
    useRef(options).current; // only consider initial values

  const audio = useAppSelector(selectUserAudioId);
  const video = useAppSelector(selectUserVideoId);

  const callRef = useRef<P2PCallConnection | null>(null);

  useEffect(() => {
    if (!callRef.current) {
      callRef.current = webrtc.makeP2PCallConnection({
        audio,
        video,
        isLocalPeerTheOfferingNewer,
        iceServersConfig,
        outgoingSignaling: {
          onLocalJsepAction: async (localJsep) => {
            if (isLocalPeerTheOfferingNewer) {
              dispatch(
                patchP2PDescription({
                  uid: p2pDescriptionUid,
                  newerPeerOffer: localJsep,
                })
              );
            } else {
              dispatch(
                patchP2PDescription({
                  uid: p2pDescriptionUid,
                  olderPeerAnswer: localJsep,
                })
              );
            }
          },
          onCompletedLocalIceCandidates(localCandidates) {
            if (isLocalPeerTheOfferingNewer) {
              dispatch(
                patchP2PDescription({
                  uid: p2pDescriptionUid,
                  newerPeerIceCandidates: localCandidates,
                })
              );
            } else {
              dispatch(
                patchP2PDescription({
                  uid: p2pDescriptionUid,
                  olderPeerIceCandidates: localCandidates,
                })
              );
            }
          },
        },
        onLocalStream: (stream) => {
          if (!localVideo) {
            return;
          }

          const element = localVideo();
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
    dispatch,
    p2pDescriptionUid,
    audio,
    video,
    iceServersConfig,
    isLocalPeerTheOfferingNewer,
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

    if (isLocalPeerTheOfferingNewer) {
      if (diff.olderPeerIceCandidates) {
        console.log(
          "Newer peer received incoming ice candidates.",
          diff.olderPeerIceCandidates
        );
        diff.olderPeerIceCandidates.forEach((c) => {
          call.incomingSignaling.handleRemoteIceCandidate(c);
        });
      }

      if (diff.olderPeerAnswer) {
        console.log(
          "Newer peer received incoming answer.",
          diff.olderPeerAnswer
        );
        call.incomingSignaling.handleRemoteJsepAction(diff.olderPeerAnswer);
      }
    } else {
      if (diff.newerPeerIceCandidates) {
        console.log(
          "Older peer received incoming ice candidates.",
          diff.newerPeerIceCandidates
        );
        diff.newerPeerIceCandidates.forEach((c) => {
          call.incomingSignaling.handleRemoteIceCandidate(c);
        });
      }

      if (diff.newerPeerOffer) {
        console.log("Newer peer received incoming offer.", diff.newerPeerOffer);
        call.incomingSignaling.handleRemoteJsepAction(diff.newerPeerOffer);
      }
    }
  }, [isLocalPeerTheOfferingNewer, cachedDescription, description]);
}
