import { ReactNode, useCallback, useEffect } from "react";
import type { CallUser } from "../webrtc";
import { listenCallUsers } from "../services/firestore-signaling";
import { useAppDispatch, useAppSelector } from "../state";
import { selectCall } from "../state/call";
import { setCallUsers } from "../state/callUsers";

interface CallUsersProviderProps {
  children: ReactNode;
}

export function CallUsersProvider({ children }: CallUsersProviderProps) {
  const dispatch = useAppDispatch();
  const call = useAppSelector(selectCall);

  const listenerCallback = useCallback(
    (callUsers: CallUser[]) => dispatch(setCallUsers(callUsers)),
    [dispatch]
  );

  useEffect(() => {
    const unsubcribe = listenCallUsers(call.uid, listenerCallback);

    return () => unsubcribe();
  }, [call.uid, listenerCallback]);

  return <>{children}</>;
}
