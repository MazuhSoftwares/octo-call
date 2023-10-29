import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../state";
import {
  selectUserDeviceUuid,
  selectUserUid,
  setSessionActive,
  setSessionBlocked,
} from "../state/user";
import firestoreAuth from "../services/firestore-auth";

export default function useValidateSession() {
  const dispatch = useAppDispatch();

  const userUid = useAppSelector(selectUserUid);
  const userDeviceUuid = useAppSelector(selectUserDeviceUuid);

  useEffect(() => {
    if (!userDeviceUuid) {
      return () => null;
    }

    return firestoreAuth.listenUserSession(userUid, (session) => {
      if (!session || !session?.deviceUuid) {
        return;
      }

      if (session.deviceUuid === userDeviceUuid) {
        dispatch(setSessionActive());
        return;
      }

      dispatch(setSessionBlocked());
    });
  }, [dispatch, userDeviceUuid, userUid]);
}
