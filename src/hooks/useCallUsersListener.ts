import { useEffect } from "react";
import firestoreSignaling from "../services/firestore-signaling";
import { useAppDispatch, useAppSelector } from "../state";
import {
  selectCallUid,
  selectCallUserStatus,
  selectParticipants,
  setCallUsers,
  setP2PDescriptions,
} from "../state/call";
import { selectUserUid } from "../state/user";

export default function useCallUsersListener() {
  const dispatch = useAppDispatch();

  const userUid = useAppSelector(selectUserUid);

  const callUid = useAppSelector(selectCallUid);
  const callUserStatus = useAppSelector(selectCallUserStatus);
  const participants = useAppSelector(selectParticipants);
  const participantsUids = participants.map((p) => p.uid);

  useEffect(() => {
    if (!callUid) {
      return () => null;
    }

    return firestoreSignaling.listenCallUsers(callUid, (callUsersResult) =>
      dispatch(setCallUsers(callUsersResult))
    );
  }, [dispatch, callUid]);

  useEffect(() => {
    if (callUserStatus !== "participant") {
      return () => null;
    }

    return firestoreSignaling.listenP22Descriptions(
      { callUid, userUid, participantsUids },
      (p2pDescriptions) => dispatch(setP2PDescriptions(p2pDescriptions))
    );
  }, [dispatch, userUid, callUid, callUserStatus, participantsUids]);
}
