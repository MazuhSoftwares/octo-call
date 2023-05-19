import { addDoc, collection } from "firebase/firestore";
import { db } from "./firestore-connection";

const firestoreCrud = {
  create,
};

export default firestoreCrud;

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
