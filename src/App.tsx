import "./App.css";
import { Switch, Route, Router, Redirect } from "wouter";
import { useAppDispatch, useAppSelector } from "./state";
import { loadUser, selectIsAuthenticated } from "./state/user";
import AuthMain from "./features/auth/AuthMain";
import CallSelectionMain from "./features/call-selection/CallSelectionMain";
import P2PCallMain from "./features/p2p-call/P2PCallMain";
import { useEffect } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { darkTheme } from "./ui/constants";

export default function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
}

function RedirectToRoot() {
  return <Redirect to="/" />;
}
