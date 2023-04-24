import "./App.css";
import { db } from "./services/firestore-connection";

console.log("Firestore...", db);

export default function App() {
  return (
    <>
      <h1>Hello World.</h1>
    </>
  );
}
