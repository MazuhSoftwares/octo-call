import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../state";
import {
  expireSession,
  selectUserDeviceUuid,
  selectUserUid,
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
        return;
      }

      dispatch(expireSession());
    });
  }, [dispatch, userDeviceUuid, userUid]);
}
