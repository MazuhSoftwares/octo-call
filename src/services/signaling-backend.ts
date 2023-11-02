import type {
  Call,
  CallP2PDescription,
  CallParticipant,
  CallPendingUser,
} from "../webrtc";
import firestoreSignaling from "./firestore-infra/firestore-signaling";

type listenerUnsubscribe = {
  (): void;
};

export interface CallUserJoinIntent {
  userUid: string;
  userDisplayName: string;
  callUid: string;
}

export interface ParticipantIntent {
  userUid: string;
  callUid: string;
  participantsUids: string[];
}

export interface CallUsersResult {
  participants: CallParticipant[];
  pendingUsers: CallPendingUser[];
}

export interface CallUserExitIntent {
  userUid: string;
  callUid: string;
}

export interface SignalingBackend {
  create: <T extends Record<string, unknown>>(
    collectionName: string,
    rawCreatingData: T
  ) => Promise<T & { uid: string }>;
  createCall: (callData: Omit<Call, "uid">) => Promise<Call>;
  askToJoinCall: (callUserJoinIntent: CallUserJoinIntent) => Promise<void>;
  listenCallUsers: (
    callUid: string,
    callback: (result: CallUsersResult) => void
  ) => listenerUnsubscribe;
  updateParticipation: (participation: {
    callUid: string;
    p2pDescription: Partial<CallP2PDescription>;
  }) => Promise<void>;
  listenP22Descriptions: (
    participantIntent: ParticipantIntent,
    listener: (p2pDescriptions: CallP2PDescription[]) => void
  ) => listenerUnsubscribe;
  joinAsNewerParticipation: (
    participantIntent: ParticipantIntent
  ) => Promise<void>;
  acceptPendingUser: (userUid: string, callUid: string) => Promise<void>;
  rejectPendingUser: (callUserExitIntent: CallUserExitIntent) => Promise<void>;
  leaveCall: (callUserExitIntent: CallUserExitIntent) => Promise<void>;
  getIceServersConfig: () => Promise<RTCIceServer>;
}

const SignalingBackend: SignalingBackend = firestoreSignaling;

export default SignalingBackend;
