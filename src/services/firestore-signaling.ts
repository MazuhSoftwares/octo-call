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

export async function createCall(callData: Omit<Call, "uid">) {
  const batch = writeBatch(db);

  const docCallRef = doc(db, "calls", uuidv4());
  batch.set(docCallRef, { ...callData, uid: docCallRef.id });

  const docCallUserRef = doc(db, `calls/${docCallRef.id}/users/${uuidv4()}`);
  batch.set(docCallUserRef, {
    uid: docCallUserRef.id,
    userUid: callData.hostId,
    userDisplayName: callData.hostDisplayName,
  });

  await batch.commit();

  return {
    ...callData,
    uid: docCallRef.id,
  };
}
