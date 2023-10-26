import once from "lodash.once";
import type { User as FirebaseUser } from "firebase/auth";
import {
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  setPersistence,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { db, googleAuthProvider } from "./firestore-connection";
import type { User } from "../webrtc";
import { doc, setDoc } from "firebase/firestore";

const firestoreAuth = {
  loadUser,
  login,
  logout,
};

export default firestoreAuth;

/** Loads user from redirection result, persistence, whatever. */
async function loadUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    const handleResult = (user: FirebaseUser | null) => {
      if (!user) {
        const empty: User = {
          uid: "",
          displayName: "",
          email: "",
          deviceUuid: "",
        };
        resolve(empty);
        return;
      }

      if (!user.uid || !user.email) {
        reject(new Error("Login blocked: unidentified user."));
        return;
      }

      const deviceUuid = uuidv4();
      // Create or update the user session in collection "session"
      setDoc(doc(db, `session/${user.uid}`), {
        deviceUuid,
      });

      resolve({
        uid: user.uid,
        displayName: user.displayName ?? user.email,
        email: user.email,
        deviceUuid,
      });
    };

    // prepare auth for one of the following events:
    const auth = getAuth();
    const onceHandleResult = once(handleResult);
    // case of timeout (this was specially important for popup method but now not so much)
    setTimeout(() => onceHandleResult(null), 5 * 1000);
    // case of loaded by something else (like persistent successfully loaded)
    auth.onAuthStateChanged(onceHandleResult);
    // case of got result from redirect flow
    getRedirectResult(auth)
      .then((credentials) => credentials?.user || null)
      .then(onceHandleResult);
  });
}

/** Trigger the login function, it redirects to an authentication page. */
async function login(): Promise<void> {
  const auth = getAuth();

  await setPersistence(auth, browserLocalPersistence);
  await signInWithRedirect(auth, googleAuthProvider);
}

/** Clears the authentication data. */
async function logout() {
  signOut(getAuth());
}
