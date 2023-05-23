import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import omit from "lodash.omit";
import { db } from "./firestore-connection";
import type { Call, CallUser } from "../webrtc";

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

export async function createCall(callData: Call, callUserData: CallUser) {
  const toDbData = (data: Call | CallUser) => omit(data, "uid");

  const batch = writeBatch(db);

  const docCallRef = doc(db, "calls", callData.uid);
  batch.set(docCallRef, toDbData(callData));

  const docCallUserRef = doc(
    db,
    `calls/${docCallRef.id}/users/${callUserData.uid}`
  );
  batch.set(docCallUserRef, toDbData(callUserData));

  await batch.commit();

  return {
    call: {
      ...callData,
      uid: docCallRef.id,
    },
    callUser: {
      ...callUserData,
      uid: docCallUserRef.id,
    },
  };
}
