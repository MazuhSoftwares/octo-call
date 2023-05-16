import { addDoc, collection } from "firebase/firestore";
import { db } from "./firestore-connection";

const firestoreCrud = {
  createDocument,
};

export default firestoreCrud;

export async function createDocument(
  collectionName: string,
  rawCreatingData: any
) {
  const docRef = await addDoc(collection(db, collectionName), rawCreatingData);
  return {
    ...rawCreatingData,
    uid: docRef.id,
  };
}
