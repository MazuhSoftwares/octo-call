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
import type { DocumentData } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firestore-connection";
import type { Call, CallP2PDescription, CallUser } from "../webrtc";

const firestoreSignaling = {
  create,
  createCall,
  askToJoinCall,
  listenCallUsers,
  acceptPendingUser,
  rejectPendingUser,
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

export interface CallUserIntent {
  userUid: string;
  userDisplayName: string;
  callUid: string;
}

export async function askToJoinCall({
  callUid,
  userDisplayName,
  userUid,
}: CallUserIntent) {
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

// ref: calls/<call_uid>/p2p-descriptions
export function listenCallP2PDescriptions(
  { userUid, callUid }: CallUserIntent,
  listener: (p2pDescription: CallP2PDescription) => void
): void {
  console.warn(
    "Not implemented `listenCall` service:",
    userUid,
    callUid,
    listener
  );
}

export function listenCallUsers(
  callUid: string,
  callback: (params: CallUser[]) => void
) {
  return onSnapshot(
    query(collection(db, `calls/${callUid}/users`)),
    (querySnapshot) => {
      const callUsers: CallUser[] = [];

      querySnapshot.forEach((doc: DocumentData) => {
        callUsers.push({ ...doc.data(), uid: doc.id } as CallUser);
      });

      callback(callUsers);
    }
  );
}

export async function acceptPendingUser(userUid: string, callUid: string) {
  await updateDoc(doc(db, `calls/${callUid}/users/${userUid}`), {
    joined: Date.now(),
  });
}

export async function rejectPendingUser(userUid: string, callUid: string) {
  await deleteDoc(doc(db, `calls/${callUid}/users/${userUid}`));
}
