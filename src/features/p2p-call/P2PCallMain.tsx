import {
  createRef,
  useEffect,
  useRef,
  useState,
  RefObject,
  useCallback,
} from "react";
import once from "lodash.once";
import Box from "@mui/material/Box";
import CallTemplate from "../../components/templates/CallTemplate";
import Video from "../../components/basic/Video";
import type { CallP2PDescription, CallParticipant } from "../../webrtc";
import useP2PCall from "../../hooks/useP2PCall";

export default function P2PCallMain() {
  // TODO: manage it with redux and service layers,
  // in real life it doesnt make sense for it to be just a local state.
  const [description, setDescription] = useState<CallP2PDescription>({
    uid: EXPERIMENTAL_DESCRIPTION_UID,
  });

  useP2PCall({
    isLocalPeerTheOfferingNewest: false,
    description,
    setDescription,
    localVideo: () => findVideoSlot(EXPERIMENTAL_OLDEST_PERSON_UID_LOCAL),
    remoteVideo: () => findVideoSlot(EXPERIMENTAL_OLDEST_PERSON_UID_REMOTE),
  });

  useP2PCall({
    isLocalPeerTheOfferingNewest: true,
    description,
    setDescription,
    localVideo: () => findVideoSlot(EXPERIMENTAL_NEWEST_PERSON_UID_LOCAL),
    remoteVideo: () => findVideoSlot(EXPERIMENTAL_NEWEST_PERSON_UID_REMOTE),
  });

  const participantsSlotsRef = useRef<ParticipantSlot[]>(
    Array(MAX_PARTICIPANTS)
      .fill(null)
      .map(() => ({
        participant: null,
        videoRef: createRef<HTMLVideoElement | null>(),
      }))
  );

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
    },
    []
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

  // const unlockSlot = useCallback((slot: ParticipantSlot): void => {
  //   slot.participant = null;
  // }, []);

  const setupExperiental1on1Ref = useRef(
    once(() => {
      console.warn("Setting up experimental 1:1 elements.");
      lockNextFreeSlot({
        uid: "uuid-1",
        userUid: EXPERIMENTAL_OLDEST_PERSON_UID_LOCAL,
        userDisplayName: "Oldest (Local)",
        joined: 1,
      });
      lockNextFreeSlot({
        uid: "uuid-2",
        userUid: EXPERIMENTAL_OLDEST_PERSON_UID_REMOTE,
        userDisplayName: "Oldest (Remote)",
        joined: 2,
      });
      lockNextFreeSlot({
        uid: "uuid-3",
        userUid: EXPERIMENTAL_NEWEST_PERSON_UID_LOCAL,
        userDisplayName: "Newest (Local)",
        joined: 3,
      });
      lockNextFreeSlot({
        uid: "uuid-4",
        userUid: EXPERIMENTAL_NEWEST_PERSON_UID_REMOTE,
        userDisplayName: "Newest (Remote)",
        joined: 4,
      });
    })
  );

  useEffect(() => {
    setupExperiental1on1Ref.current();
  }, []);

  return (
    <CallTemplate>
      <Box sx={{ display: "flex" }}>
        {participantsSlotsRef.current.map((slot, index) => (
          <Video
            key={slot.participant ? slot.participant.uid : `empty-${index}`}
            ref={slot.videoRef}
            displayName={
              slot.participant ? slot.participant.userDisplayName : "Empty"
            }
            sx={{
              maxWidth: "300px",
            }}
            hidden={!slot.participant}
          />
        ))}
      </Box>
    </CallTemplate>
  );
}

interface ParticipantSlot {
  participant: CallParticipant | null;
  videoRef: RefObject<HTMLVideoElement | null>;
}

const EXPERIMENTAL_DESCRIPTION_UID = "experimental-call-42";
const EXPERIMENTAL_OLDEST_PERSON_UID_LOCAL = "experimental-oldest-p1-local";
const EXPERIMENTAL_OLDEST_PERSON_UID_REMOTE = "experimental-oldest-p1-remote";
const EXPERIMENTAL_NEWEST_PERSON_UID_LOCAL = "experimental-newest-p2-local";
const EXPERIMENTAL_NEWEST_PERSON_UID_REMOTE = "experimental-newest-p2-remote";

const MAX_PARTICIPANTS: number = 5 as const;
