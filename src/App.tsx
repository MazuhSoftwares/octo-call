import "./App.css";
import { CurrentUserStateIndicator } from "./features/auth/CurrentUserStateIndicator";
import { db } from "./services/firestore-connection";
import { useAppSelector } from "./state";
import { selectCurrentUser } from "./state/user";

console.log("Firestore...", db);

export default function App() {
  const user = useAppSelector(selectCurrentUser);
  const userName = user.displayName || "World";

  return (
    <>
      <h1>{`Hello, ${userName}.`}</h1>
      <CurrentUserStateIndicator />
    </>
  );
}
