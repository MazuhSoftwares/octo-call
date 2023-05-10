import "./App.css";
import { db } from "./services/firestore-connection";
import { useAppDispatch, useAppSelector } from "./state";
import { login, logoff, selectCurrentUser } from "./state/user";

console.log("Firestore...", db);

export default function App() {
  return (
    <>
      <h1>Hello World.</h1>
      <CurrentUserStateIndicator />
    </>
  );
}

function CurrentUserStateIndicator() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const handleLoginClick = () => dispatch(login());
  const handleLogoffClick = () => dispatch(logoff());
  const isAuthenticated = user.status === "authenticated";
  const isPending = user.status === "pending";

  return (
    <section>
      <p>
        User status is <code>{user.status}</code>.
      </p>
      {isAuthenticated ? (
        <button type="button" onClick={handleLogoffClick} disabled={isPending}>
          Logoff
        </button>
      ) : (
        <button type="button" onClick={handleLoginClick} disabled={isPending}>
          Login
        </button>
      )}
    </section>
  );
}
