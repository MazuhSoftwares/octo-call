import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
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

  const callUserUid = uuidv4();
  const docCallUserRef = doc(db, `calls/${callUid}/users/${callUserUid}`);
  batch.set(docCallUserRef, {
    uid: callUserUid,
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

  const q = query(collection(db, `calls`), where("uid", "==", callUid));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    calls.push(doc.data() as Call);
  });

  if (!calls.length) {
    throw new Error("Call not found");
  }

  await addDoc(collection(db, `calls/${callUid}/users`), {
    userDisplayName,
    userUid,
  });
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

// TODO: some onSnapshot magic, only call listener if the user is participating.

export function listenCallUsers(
  callUid: string,
  callback: (params: CallUser[]) => void
) {
  const q = query(collection(db, `calls/${callUid}/users`));
  return onSnapshot(q, (querySnapshot) => {
    const callUsers: CallUser[] = [];
    querySnapshot.forEach((doc: DocumentData) => {
      callUsers.push(doc.data() as CallUser);
    });
    callback(callUsers);
  });
}
