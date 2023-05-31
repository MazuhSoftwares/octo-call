import { ReactNode, createContext, useEffect, useState } from "react";
import type { CallUser } from "../webrtc";
import { listenCallUsers } from "../services/firestore-signaling";
import { useAppSelector } from "../state";
import { selectCall } from "../state/call";

interface CallGuests {
  participants: CallUser[];
  pendingGuests: CallUser[];
}

const CallGuestsContext = createContext<CallGuests>({
  participants: [],
  pendingGuests: [],
});

export default CallGuestsContext;

interface CallGuestsProviderProps {
  children: ReactNode;
}

export function CallGuestsProvider({ children }: CallGuestsProviderProps) {
  const call = useAppSelector(selectCall);
  const [callGuests, setCallGuests] = useState<CallUser[]>([]);

  useEffect(() => {
    const unsubcribe = listenCallUsers(call.uid, setCallGuests);

    return () => unsubcribe();
  }, [call.uid]);

  const participants = callGuests.filter((guests) => guests.joined);
  const pendingGuests = callGuests.filter((guests) => !guests.joined);

  return (
    <CallGuestsContext.Provider value={{ participants, pendingGuests }}>
      {children}
    </CallGuestsContext.Provider>
  );
}
