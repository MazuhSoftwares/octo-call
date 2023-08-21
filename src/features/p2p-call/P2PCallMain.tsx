import { useRef, useState, useCallback, useId, useEffect } from "react";
import Box, { BoxProps } from "@mui/material/Box";
import CallTemplate from "../../components/templates/CallTemplate";
import Video from "../../components/basic/Video";
import type { CallP2PDescription, CallParticipant } from "../../webrtc";
import webrtc from "../../webrtc";
import useP2PCall from "../../hooks/useP2PCall";
import useWindowSize from "../../hooks/useWindowSize";
import {
  EXTRA_LARGE_HEIGHT,
  EXTRA_LARGE_WIDTH,
  LARGE_HEIGHT,
  MEDIUM_WIDTH,
} from "../../components/app/mui-styles";
import { useAppSelector } from "../../state";
import {
  selectP2PDescriptionUidByRemoteUidFn,
  selectParticipants,
  selectUserParticipationOrder,
} from "../../state/call";
import { selectUserDisplayName, selectUserUid } from "../../state/user";
import { useDevicePreview } from "../../hooks/useDevicePreview";
import { selectUserVideoId } from "../../state/devices";

export default function P2PCallMain() {
  const windowsSize = useWindowSize();

  const participantsSlotsRef = useRef<ParticipantSlot[]>(
    Array(MAX_PARTICIPANTS)
      .fill(null)
      .map(() => ({ participant: null }))
  );

  const [activeSlotsQtt, setActiveSlotsQtt] = useState<number>(0); // to be used only for layout
  const syncActiveSlotsCounting = useCallback(() => {
    setActiveSlotsQtt(
      participantsSlotsRef.current.filter((it) => it.participant).length + 1 // plus user themself
    );
  }, []);

  const findSlot = useCallback(
    (participantUid: string): ParticipantSlot | null =>
      participantsSlotsRef.current.find(
        (it) => it.participant?.userUid === participantUid
      ) || null,
    []
  );

  const findFreeSlot = useCallback(
    (): ParticipantSlot | null =>
      participantsSlotsRef.current.find((it) => !it.participant) || null,
    []
  );

  const lockSlot = useCallback(
    (slot: ParticipantSlot, participant: CallParticipant): void => {
      slot.participant = participant;
      syncActiveSlotsCounting();
    },
    [syncActiveSlotsCounting]
  );

  const lockNextFreeSlot = useCallback(
    (participant: CallParticipant): ParticipantSlot => {
      const slot = findFreeSlot();
      if (!slot) {
        throw new Error("Exceeded slot limit.");
      }

      lockSlot(slot, participant);
      return slot;
    },
    [findFreeSlot, lockSlot]
  );

  const getMainStyles = useCallback((): BoxProps["sx"] => {
    if (windowsSize.width < MEDIUM_WIDTH) {
      return {
        flexDirection: "column",
      };
    }

    if (windowsSize.height < LARGE_HEIGHT) {
      return {
        flexDirection: "row",
      };
    }

    return {
      flexDirection: "row",
      flexWrap: "wrap",
    };
  }, [windowsSize]);

  const getSlotStyles = useCallback((): BoxProps["sx"] => {
    return {
      flexBasis: "45%",
      margin: 1,
    };
  }, []);

  const getVideoWrapperStyles = useCallback((): BoxProps["sx"] => {
    return { margin: "auto" };
  }, []);

  const getVideoStyles = useCallback((): BoxProps["sx"] => {
    if (windowsSize.width < MEDIUM_WIDTH) {
      if (activeSlotsQtt === 1) {
        return { maxHeight: "40vh" };
      } else if (activeSlotsQtt === 2) {
        return { maxHeight: "30vh" };
      } else if (activeSlotsQtt === 3) {
        return { maxHeight: "25vh" };
      } else if (activeSlotsQtt === 4) {
        return { maxHeight: "18vh" };
      } else {
        return { maxHeight: "15vh" };
      }
    }

    if (
      windowsSize.width < EXTRA_LARGE_WIDTH ||
      windowsSize.height < EXTRA_LARGE_HEIGHT
    ) {
      return { maxHeight: "35vh" };
    }

    return { maxHeight: "37vh" };
  }, [windowsSize, activeSlotsQtt]);

  const userUid = useAppSelector(selectUserUid);
  const participants = useAppSelector(selectParticipants);

  useEffect(() => {
    participants
      .filter((p) => p.uid !== userUid)
      .forEach((participant) => {
        const participantSlot = findSlot(participant.uid);
        if (participantSlot) {
          return;
        }

        lockNextFreeSlot(participant);
      });
  }, [userUid, participants, findSlot, lockNextFreeSlot]);

  return (
    <CallTemplate>
      <Box
        data-layoutinfo="call"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 1,
          ...getMainStyles(),
        }}
      >
        <P2PMirrorCallSlot
          slotStyles={getSlotStyles()}
          videoWrapperStyles={getVideoWrapperStyles()}
          videoStyles={getVideoStyles()}
        />
        {participantsSlotsRef.current.map((slot, index) => (
          <P2PCallSlot
            key={`slot-guard-${index}`}
            slot={slot}
            slotStyles={getSlotStyles()}
            videoWrapperStyles={getVideoWrapperStyles()}
            videoStyles={getVideoStyles()}
          />
        ))}
      </Box>
    </CallTemplate>
  );
}

interface ParticipantSlot {
  participant: CallParticipant | null;
}

interface P2PCallSlotProps {
  slot: ParticipantSlot;
  slotStyles?: BoxProps["sx"];
  videoWrapperStyles?: BoxProps["sx"];
  videoStyles?: BoxProps["sx"];
}

function P2PCallSlot(props: P2PCallSlotProps) {
  const p2pDescriptionUid = useAppSelector(
    selectP2PDescriptionUidByRemoteUidFn(props.slot.participant?.uid || "")
  );

  if (!props.slot.participant || !p2pDescriptionUid) {
    return <Box data-layoutinfo="call-slot" hidden></Box>;
  }

  return (
    <P2PCallSlotConnection
      participant={props.slot.participant}
      p2pDescriptionUid={p2pDescriptionUid}
      slotStyles={props.slotStyles}
      videoWrapperStyles={props.videoWrapperStyles}
      videoStyles={props.videoStyles}
    />
  );
}

interface P2PCallSlotConnectionProps {
  participant: CallParticipant;
  p2pDescriptionUid: CallP2PDescription["uid"];
  slotStyles?: BoxProps["sx"];
  videoWrapperStyles?: BoxProps["sx"];
  videoStyles?: BoxProps["sx"];
}

function P2PCallSlotConnection({
  participant,
  p2pDescriptionUid,
  slotStyles = {},
  videoWrapperStyles = {},
  videoStyles = {},
}: P2PCallSlotConnectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const descriptionInitialId = useId();
  const userParticipation = useAppSelector(selectUserParticipationOrder);

  useP2PCall({
    p2pDescriptionUid,
    isLocalPeerTheOfferingNewest:
      userParticipation > (participant.joined || -1),
    remoteVideo: () => videoRef.current,
  });

  return (
    <Box
      data-layoutinfo="call-slot"
      id={descriptionInitialId}
      sx={slotStyles}
      hidden={!participant}
    >
      <Video
        ref={videoRef}
        displayName={participant.userDisplayName}
        wrapperBoxProps={{ sx: videoWrapperStyles }}
        sx={videoStyles}
      />
    </Box>
  );
}

type P2PMirrorCallSlotProps = Omit<P2PCallSlotProps, "slot">;

function P2PMirrorCallSlot({
  slotStyles = {},
  videoWrapperStyles = {},
  videoStyles = {},
}: P2PMirrorCallSlotProps) {
  const displayName = useAppSelector(selectUserDisplayName);

  const videoId = useAppSelector(selectUserVideoId);
  const videoPreview = useDevicePreview("video");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    videoPreview.setResultListener((stream: MediaStream | null) => {
      webrtc.domHelpers.attachLocalStream(
        videoRef.current as HTMLVideoElement,
        stream
      );
    });

    videoPreview.start(videoId);
    return () => videoPreview.stop();
  }, [videoPreview, videoId]);

  return (
    <Box data-layoutinfo="call-slot" sx={slotStyles}>
      <Video
        ref={videoRef}
        displayName={`${displayName} (Me)`}
        wrapperBoxProps={{ sx: videoWrapperStyles }}
        sx={videoStyles}
      />
    </Box>
  );
}

const MAX_PARTICIPANTS = 2;
