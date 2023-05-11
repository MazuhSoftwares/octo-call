import { getAuth, signInWithPopup, signOut } from "firebase/auth";
import { googleAuthProvider } from "./firestore-connection";

const firestoreAuth = {
  login,
  logoff,
};

export default firestoreAuth;

async function login() {
  try {
    const result = await signInWithPopup(getAuth(), googleAuthProvider);
    const {
      user: { uid, displayName, email },
    } = result;
    return {
      uid,
      displayName: displayName ?? email ?? "unidentified user",
      email: email ?? "",
    };
  } catch (error) {
    throw new Error("Login error.");
  }
}

async function logoff() {
  signOut(getAuth());
}
