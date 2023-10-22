import once from "lodash.once";
import type { User as FirebaseUser, UserCredential } from "firebase/auth";
import {
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  setPersistence,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { googleAuthProvider } from "./firestore-connection";
import type { User } from "../webrtc";

const firestoreAuth = {
  loadUser,
  login,
  redirectLogin,
  logout,
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

async function redirectLogin(): Promise<never> {
  const auth = getAuth();

  await setPersistence(auth, browserLocalPersistence);
  return signInWithRedirect(auth, googleAuthProvider);
}

async function login(): Promise<User> {
  const empty: User = { uid: "", displayName: "", email: "" };
  const auth = getAuth();
  const result = await getRedirectResult(auth);

  if (result === null) {
    Promise.resolve(empty);
  }
  const {
    user: { uid, displayName, email },
  } = result as UserCredential;
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

async function logout() {
  signOut(getAuth());
}
