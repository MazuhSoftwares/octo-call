import { useEffect } from "react";
import type { CallUser } from "../webrtc";
import firestoreSignaling from "../services/firestore-signaling";
import { useAppDispatch, useAppSelector } from "../state";
import { selectCallUid, setCallUsers } from "../state/call";

export function useCallUsersListener() {
  const dispatch = useAppDispatch();
  const callUid = useAppSelector(selectCallUid);

  useEffect(() => {
    if (!callUid) {
      return () => null;
    }

    const unsubscribe = firestoreSignaling.listenCallUsers(
      callUid,
      (callUsers: CallUser[]) => dispatch(setCallUsers(callUsers))
    );

    return () => unsubscribe();
  }, [dispatch, callUid]);
}
