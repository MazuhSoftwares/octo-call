import "../../App.css";
import { useAppDispatch, useAppSelector } from "../../state";
import { login, logoff, selectCurrentUser } from "../../state/user";

export default function CurrentUserStateIndicator() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const handleLoginClick = () => dispatch(login());
  const handleLogoffClick = () => dispatch(logoff());
  const isAuthenticated = user.status === "authenticated";
  const isPending = user.status === "pending";

  return (
    <section>
      <p>
        {user.displayName ? `Hi, ${user.displayName}.` : "Hi."}
        <br />
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
