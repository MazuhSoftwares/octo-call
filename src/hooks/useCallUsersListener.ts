import { useCallback, useEffect } from "react";
import type { CallUser } from "../webrtc";
import firestoreSignaling from "../services/firestore-signaling";
import { useAppDispatch, useAppSelector } from "../state";
import { selectCallUid } from "../state/call";
import { setCallUsers } from "../state/callUsers";

export function useCallUsersListener() {
  const dispatch = useAppDispatch();
  const callUid = useAppSelector(selectCallUid);

  const listenerCallback = useCallback(
    (callUsers: CallUser[]) => dispatch(setCallUsers(callUsers)),
    [dispatch]
  );

  useEffect(() => {
    if (!callUid) {
      return () => null;
    }

    const unsubscribe = firestoreSignaling.listenCallUsers(
      callUid,
      listenerCallback
    );

    return () => unsubscribe();
  }, [callUid, listenerCallback]);
}
