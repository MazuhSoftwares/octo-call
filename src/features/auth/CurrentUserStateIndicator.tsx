import "../../App.css";
import { useAppDispatch, useAppSelector } from "../../state";
import { logoff, selectCurrentUser } from "../../state/user";

export default function CurrentUserStateIndicator() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const handleLogoffClick = () => dispatch(logoff());
  const isPending = user.status === "pending";

  return (
    <section>
      <p>
        {user.displayName ? `Hi, ${user.displayName}.` : "Hi."}
        <br />
        User status is <code>{user.status}</code>.
      </p>
      <button type="button" onClick={handleLogoffClick} disabled={isPending}>
        Logoff
      </button>
    </section>
  );
}
