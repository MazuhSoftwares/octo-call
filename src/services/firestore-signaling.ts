import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData, Unsubscribe } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firestore-connection";
import type {
  Call,
  CallP2PDescription,
  CallParticipant,
  CallPendingUser,
  CallUser,
} from "../webrtc";

const firestoreSignaling = {
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

export default firestoreSignaling;

export async function create<T extends Record<string, unknown>>(
  collectionName: string,
  rawCreatingData: T
) {
  const docRef = await addDoc(collection(db, collectionName), rawCreatingData);
  return {
    ...rawCreatingData,
    uid: docRef.id,
  };
}

export async function createCall(callData: Omit<Call, "uid">): Promise<Call> {
  const batch = writeBatch(db);

  const callUid = uuidv4();
  const docCallRef = doc(db, `calls/${callUid}`);
  batch.set(docCallRef, { ...callData, uid: callUid } as Call);

  const docCallUserRef = doc(db, `calls/${callUid}/users/${callData.hostId}`);
  batch.set(docCallUserRef, {
    uid: callData.hostId,
    userUid: callData.hostId,
    userDisplayName: callData.hostDisplayName,
    joined: Date.now(),
  } as CallUser);

  try {
    await batch.commit();
  } catch (error) {
    console.error("Failed to commit when creating call.", error);
    throw error;
  }

  return {
    ...callData,
    uid: callUid,
  };
}

export interface CallUserJoinIntent {
  userUid: string;
  userDisplayName: string;
  callUid: string;
}

export async function askToJoinCall({
  callUid,
  userDisplayName,
  userUid,
}: CallUserJoinIntent) {
  const calls: Call[] = [];

  const querySnapshot = await getDocs(
    // why getDocs in plural if only 1 is possible?
    query(collection(db, `calls`), where("uid", "==", callUid))
  );
  querySnapshot.forEach((doc) => calls.push(doc.data() as Call));
  if (!calls.length) {
    throw new Error("Call not found");
  }

  const ref = doc(db, `calls/${callUid}/users`, userUid);
  const data: CallUser = {
    uid: userUid,
    userDisplayName,
    userUid,
  };
  await setDoc(ref, data);
}

export interface ParticipantIntent {
  userUid: string;
  callUid: string;
  participantsUids: string[];
}

export async function joinAsNewerParticipation({
  userUid,
  callUid,
  participantsUids,
}: ParticipantIntent): Promise<void> {
  const batch = writeBatch(db);

  participantsUids.forEach((participantsUid) => {
    const uuid = uuidv4();
    const ref = doc(db, `calls/${callUid}/p2p-descriptions/${uuid}`);
    const data: Omit<CallP2PDescription, "uid"> = {
      newerPeerUid: userUid,
      olderPeerUid: participantsUid,
    };
    batch.set(ref, data);
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error(
      "Failed to commit when joining as newer participation.",
      error
    );
    throw error;
  }
}

export async function updateParticipation({
  callUid,
  p2pDescription,
}: {
  callUid: string;
  p2pDescription: Partial<CallP2PDescription>;
}) {
  if (!p2pDescription.olderPeerUid || !p2pDescription.newerPeerUid) {
    throw new Error("Malformed description, not enough uids.");
  }

  const p2pDescriptionDTO = {
    ...p2pDescription,
  };
  if (p2pDescriptionDTO.newerPeerOffer instanceof RTCSessionDescription) {
    p2pDescriptionDTO.newerPeerOffer =
      p2pDescriptionDTO.newerPeerOffer.toJSON();
  }
  if (p2pDescriptionDTO.olderPeerAnswer instanceof RTCSessionDescription) {
    p2pDescriptionDTO.olderPeerAnswer =
      p2pDescriptionDTO.olderPeerAnswer.toJSON();
  }

  await updateDoc(
    doc(db, `calls/${callUid}/p2p-descriptions/${p2pDescription.uid}`),
    p2pDescriptionDTO
  );
}

export function listenP22Descriptions(
  { userUid, callUid, participantsUids }: ParticipantIntent,
  listener: (p2pDescriptions: CallP2PDescription[]) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, `calls/${callUid}/p2p-descriptions`)),
    (querySnapshot) => {
      const allP2pDescriptions: CallP2PDescription[] = [];
      querySnapshot.forEach((doc: DocumentData) =>
        allP2pDescriptions.push({
          ...doc.data(),
          uid: doc.id,
        } as CallP2PDescription)
      );

      const subscribedP2pDescriptions = allP2pDescriptions.filter(
        (it) =>
          it.newerPeerUid &&
          participantsUids.includes(it.newerPeerUid) &&
          it.olderPeerUid &&
          participantsUids.includes(it.olderPeerUid) &&
          (it.newerPeerUid === userUid || it.olderPeerUid === userUid)
      );

      listener(subscribedP2pDescriptions);
    }
  );
}

export interface CallUsersResult {
  participants: CallParticipant[];
  pendingUsers: CallPendingUser[];
}

export function listenCallUsers(
  callUid: string,
  callback: (result: CallUsersResult) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, `calls/${callUid}/users`)),
    (querySnapshot) => {
      const callUsers: CallUser[] = [];

      querySnapshot.forEach((doc: DocumentData) => {
        callUsers.push({ ...doc.data(), uid: doc.id } as CallUser);
      });

      const participants = callUsers.filter(
        (callUser) => callUser.joined
      ) as CallParticipant[];

      const pendingUsers = callUsers.filter(
        (callUser) => !callUser.joined
      ) as CallPendingUser[];

      callback({ participants, pendingUsers });
    }
  );
}

export async function acceptPendingUser(userUid: string, callUid: string) {
  await updateDoc(doc(db, `calls/${callUid}/users/${userUid}`), {
    joined: Date.now(),
  });
}

export interface CallUserExitIntent {
  userUid: string;
  callUid: string;
}

export async function rejectPendingUser({
  callUid,
  userUid,
}: CallUserExitIntent) {
  await deleteDoc(doc(db, `calls/${callUid}/users/${userUid}`));
}

export async function leaveCall({ callUid, userUid }: CallUserExitIntent) {
  await deleteDoc(doc(db, `calls/${callUid}/users/${userUid}`));
}

export async function getIceServersConfig(): Promise<RTCIceServer> {
  const functions = getFunctions();
  const getIceServer = httpsCallable<never, { iceServersConfig: RTCIceServer }>(
    functions,
    "getIceServersConfig"
  );

  try {
    const iceServersResult = await getIceServer();
    const iceServersConfig = iceServersResult.data.iceServersConfig;
    if (!iceServersConfig) {
      throw new Error(
        "Bad response from cloud function while retrieving ICE servers."
      );
    }
    return iceServersConfig;
  } catch (error) {
    console.error(
      "Failed to get ICE servers, then putting some default.",
      error
    );
    return DEFAULT_ICE_SERVERS_CONFIG;
  }
}

const DEFAULT_ICE_SERVERS_CONFIG: RTCIceServer = {
  urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"],
};
