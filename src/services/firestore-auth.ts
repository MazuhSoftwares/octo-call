import { getAuth, signInWithPopup, signOut } from "firebase/auth";
import { googleAuthProvider } from "./firestore-connection";

const firestoreAuth = {
  login,
  logoff,
};

export default firestoreAuth;

async function login() {
  try {
    const auth = getAuth();
    const result = await signInWithPopup(auth, googleAuthProvider);
    const {
      user: { uid, displayName, email },
    } = result;

    if (!email) {
      signOut(auth);
      throw new Error("Login blocked: unidentified user");
    }

    return {
      uid,
      displayName: displayName ?? email,
      email,
    };
  } catch (error) {
    throw new Error("Login error.");
  }
}

async function logoff() {
  signOut(getAuth());
}
