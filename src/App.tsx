import "./App.css";
import { Switch, Route, Router, Redirect } from "wouter";
import { useAppSelector } from "./state";
import { selectIsAuthenticated } from "./state/user";
import AuthMain from "./features/auth/AuthMain";
import CallSelectionMain from "./features/call-selection/CallSelectionMain";
import P2PCallMain from "./features/p2p-call/P2PCallMain";

export default function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <Router base="/octo-call">
      <Switch>
        <Route
          path="/"
          component={isAuthenticated ? CallSelectionMain : AuthMain}
        />
        <Route
          path="/p2p/:callUid"
          component={isAuthenticated ? P2PCallMain : RedirectToRoot}
        />
        <Route>
          <RedirectToRoot />
        </Route>
      </Switch>
    </Router>
  );
}

function RedirectToRoot() {
  return <Redirect to="/" />;
}
