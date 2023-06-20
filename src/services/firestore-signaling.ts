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
  listenParticipations,
  joinAsNewestParticipation,
  acceptPendingUser,
  rejectPendingUser,
  leaveCall,
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

  await batch.commit();

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

export async function joinAsNewestParticipation({
  userUid,
  callUid,
  participantsUids,
}: ParticipantIntent): Promise<void> {
  const batch = writeBatch(db);

  participantsUids.forEach((participantsUid) => {
    const ref = doc(db, `calls/${callUid}/p2p-descriptions`);
    const data: Omit<CallP2PDescription, "uid"> = {
      newestPeerUid: userUid,
      oldestPeerUid: participantsUid,
    };
    batch.set(ref, data);
  });

  await batch.commit();
}

export function listenParticipations(
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
          it.newestPeerUid &&
          participantsUids.includes(it.newestPeerUid) &&
          it.oldestPeerUid &&
          participantsUids.includes(it.oldestPeerUid) &&
          (it.newestPeerUid === userUid || it.oldestPeerUid === userUid)
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
