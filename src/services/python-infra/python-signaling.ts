import type { Call, CallP2PDescription } from "../../webrtc";
import {
  CallUserExitIntent,
  CallUserJoinIntent,
  CallUsersResult,
  ParticipantIntent,
  SignalingBackend,
  listenerUnsubscribe,
} from "../signaling-backend";

const pythonSignaling: SignalingBackend = {
  create,
  createCall,
  askToJoinCall,
  listenCallUsers,
  updateParticipation,
  listenP22Descriptions,
  joinAsNewerParticipation,
  acceptPendingUser,
  rejectPendingUser,
  leaveCall,
  getIceServersConfig,
};

export default pythonSignaling;

export async function create<T extends Record<string, unknown>>(
  collectionName: string,
  rawCreatingData: T
) {
  console.log("create", collectionName, rawCreatingData);
  return {
    ...rawCreatingData,
    uid: "e223-4e25-aaca-b7c0ffecd647",
  };
}

export async function createCall(callData: Omit<Call, "uid">): Promise<Call> {
  return {
    ...callData,
    uid: "e223-4e25-aaca-b7c0ffecd647",
  };
}

export async function askToJoinCall({
  callUid,
  userDisplayName,
  userUid,
}: CallUserJoinIntent) {
  console.log("askToJoinCall", callUid, userDisplayName, userUid);
  return;
}

export async function joinAsNewerParticipation({
  userUid,
  callUid,
  participantsUids,
}: ParticipantIntent): Promise<void> {
  console.log("joinAsNewerParticipation", userUid, callUid, participantsUids);
  return;
}

export async function updateParticipation({
  callUid,
  p2pDescription,
}: {
  callUid: string;
  p2pDescription: Partial<CallP2PDescription>;
}) {
  console.log("updateParticipation", callUid, p2pDescription);
  return;
}

export function listenP22Descriptions(
  { userUid, callUid, participantsUids }: ParticipantIntent,
  listener: (p2pDescriptions: CallP2PDescription[]) => void
): listenerUnsubscribe {
  console.log(
    "listenP22Descriptions",
    userUid,
    callUid,
    participantsUids,
    listener
  );
  return () => null;
}

export function listenCallUsers(
  callUid: string,
  callback: (result: CallUsersResult) => void
): listenerUnsubscribe {
  console.log("listenCallUsers", callUid, callback);
  return () => null;
}

export async function acceptPendingUser(userUid: string, callUid: string) {
  console.log("acceptPendingUser", userUid, callUid);
  return;
}

export async function rejectPendingUser({
  callUid,
  userUid,
}: CallUserExitIntent) {
  console.log("rejectPendingUser", callUid, userUid);
  return;
}

export async function leaveCall({ callUid, userUid }: CallUserExitIntent) {
  console.log("leaveCall", callUid, userUid);
  return;
}

export async function getIceServersConfig(): Promise<RTCIceServer> {
  return DEFAULT_ICE_SERVERS_CONFIG;
}

const DEFAULT_ICE_SERVERS_CONFIG: RTCIceServer = {
  urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"],
};
