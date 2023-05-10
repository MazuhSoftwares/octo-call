import { getAuth, signInWithPopup } from "firebase/auth";
import { googleAuthProvider } from "../../services/firestore-connection";
import { useState } from "react";

export default function LoginView() {
  const [resultMessage, setResultMessage] = useState<string>("");

  const auth = getAuth();
  const signInWithGoogle = () =>
    signInWithPopup(auth, googleAuthProvider)
      .then((result) => {
        setResultMessage(`${result.user.displayName} is logged.`);
      })
      .catch((error) => {
        console.log(error);
        setResultMessage("Error when trying to log in.");
      });

  return (
    <div>
      <span>Use...</span>
      <button onClick={signInWithGoogle}>Google Account</button>
      {!!resultMessage && <span>{resultMessage}</span>}
    </div>
  );
}
