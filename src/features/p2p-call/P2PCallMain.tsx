import {
  createRef,
  useEffect,
  useRef,
  useState,
  RefObject,
  useCallback,
} from "react";
import once from "lodash.once";
import Box, { BoxProps } from "@mui/material/Box";
import CallTemplate from "../../components/templates/CallTemplate";
import Video from "../../components/basic/Video";
import type { CallP2PDescription, CallParticipant } from "../../webrtc";
import useP2PCall from "../../hooks/useP2PCall";
import useWindowSize from "../../hooks/useWindowSize";
import {
  EXTRA_LARGE_HEIGHT,
  EXTRA_LARGE_WIDTH,
  LARGE_HEIGHT,
  MEDIUM_WIDTH,
} from "../../components/app/mui-styles";

export default function P2PCallMain() {
  const windowsSize = useWindowSize();

  // TODO: manage it with redux and service layers,
  // in real life it doesnt make sense for it to be just a local state.
  // const [description, setDescription] = useState<CallP2PDescription>({
  //   uid: EXPERIMENTAL_DESCRIPTION_UID,
  // });

  const participantsSlotsRef = useRef<ParticipantSlot[]>(
    Array(MAX_PARTICIPANTS)
      .fill(null)
      .map(() => ({
        participant: null,
        videoRef: createRef<HTMLVideoElement | null>(),
      }))
  );

  const [activeSlotsQtt, setActiveSlotsQtt] = useState<number>(0);

  const syncActiveSlotsCounting = useCallback(() => {
    setActiveSlotsQtt(
      participantsSlotsRef.current.filter((it) => it.participant).length
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

  const findVideoSlot = useCallback(
    (participantUid: string): HTMLVideoElement | null => {
      const slot = findSlot(participantUid);
      if (!slot) {
        return null;
      }

      return slot.videoRef.current || null;
    },
    [findSlot]
  );

  const lockSlot = useCallback(
    (slot: ParticipantSlot, participant: CallParticipant): void => {
      slot.participant = participant;
      syncActiveSlotsCounting();
    },
    [syncActiveSlotsCounting]
  );

  const unlockSlot = useCallback((slot: ParticipantSlot): void => {
    slot.participant = null;
    syncActiveSlotsCounting();
  }, []);

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
        {participantsSlotsRef.current.map((slot, index) => (
          <Box
            key={slot.participant ? slot.participant.uid : `empty-${index}`}
            data-layoutinfo="call-slot"
            sx={getSlotStyles()}
            hidden={!slot.participant}
          >
            <Video
              ref={slot.videoRef}
              displayName={
                slot.participant ? slot.participant.userDisplayName : "Empty"
              }
              wrapperBoxProps={{ sx: getVideoWrapperStyles() }}
              sx={getVideoStyles()}
            />
          </Box>
        ))}
      </Box>
    </CallTemplate>
  );
}

interface ParticipantSlot {
  participant: CallParticipant | null;
  videoRef: RefObject<HTMLVideoElement | null>;
}

const MAX_PARTICIPANTS = 5;

// function P2PCallSlot() {
//   useP2PCall({
//     isLocalPeerTheOfferingNewest: false,
//     description,
//     setDescription,
//     localVideo: () => null,
//     remoteVideo: () => null,
//   });

//   return <p>Quadradinho.</p>;
// }
