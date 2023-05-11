import "./App.css";
import { CurrentUserStateIndicator } from "./features/auth/CurrentUserStateIndicator";
import { db } from "./services/firestore-connection";

console.log("Firestore...", db);

export default function App() {
  return (
    <>
      <h1>Hello World.</h1>
      <CurrentUserStateIndicator />
    </>
  );
}
