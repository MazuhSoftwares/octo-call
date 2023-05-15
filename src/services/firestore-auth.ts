import once from "lodash.once";
import type { User as FirebaseUser } from "firebase/auth";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { googleAuthProvider } from "./firestore-connection";
import type { User } from "../webrtc";

const firestoreAuth = {
  loadUser,
  login,
  logoff,
};

export default firestoreAuth;

async function loadUser(): Promise<User> {
  const empty: User = { uid: "", displayName: "", email: "" };

  return new Promise((resolve) => {
    const done = (user: FirebaseUser | null) => {
      try {
        if (user) {
          const { uid, displayName, email } = user;
          resolve({
            uid,
            displayName: displayName ?? email ?? "",
            email: email ?? "?@?",
          });
        } else {
          resolve(empty);
        }
      } catch (error) {
        resolve(empty);
      }
    };

    setTimeout(() => done(null), 3000);
    getAuth().onAuthStateChanged(once(done));
  });
}

async function login(): Promise<User> {
  const auth = getAuth();

  await setPersistence(auth, browserLocalPersistence);

  const result = await signInWithPopup(auth, googleAuthProvider);
  const {
    user: { uid, displayName, email },
  } = result;

  if (!email) {
    signOut(auth);
    throw new Error("Login blocked: unidentified user.");
  }

  return {
    uid,
    displayName: displayName ?? email,
    email,
  };
}

async function logoff() {
  signOut(getAuth());
}
