import { ReactNode, createContext, useEffect, useState } from "react";
import type { CallUser } from "../webrtc";
import { listenCallUsers } from "../services/firestore-signaling";
import { useAppSelector } from "../state";
import { selectCall } from "../state/call";

interface CallUsers {
  participants: CallUser[];
}

const CallUsersContext = createContext<CallUsers>({
  participants: [],
});

export default CallUsersContext;

interface CallUsersProviderProps {
  children: ReactNode;
}

export function CallUsersProvider({ children }: CallUsersProviderProps) {
  const call = useAppSelector(selectCall);
  const [callUsers, setCallUsers] = useState<CallUser[]>([]);

  useEffect(() => {
    const unsubcribe = listenCallUsers(call.uid, setCallUsers);

    return () => unsubcribe();
  }, [call.uid]);

  const participants = callUsers.filter((callUser) => callUser.joined);

  return (
    <CallUsersContext.Provider value={{ participants }}>
      {children}
    </CallUsersContext.Provider>
  );
}
