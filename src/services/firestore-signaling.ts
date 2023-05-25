import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firestore-connection";
import type { Call } from "../webrtc";

const firestoreSignaling = {
  create,
  createCall,
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
  batch.set(docCallRef, { ...callData, uid: callUid });

  const callUserUid = uuidv4();
  const docCallUserRef = doc(db, `calls/${callUid}/users/${callUserUid}`);
  batch.set(docCallUserRef, {
    uid: callUserUid,
    userUid: callData.hostId,
    userDisplayName: callData.hostDisplayName,
  });

  await batch.commit();

  return {
    ...callData,
    uid: callUid,
  };
}
