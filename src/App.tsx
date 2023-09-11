import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Switch, Route, Router, Redirect } from "wouter";
import { darkTheme } from "./components/app/mui-styles";
import { useAppDispatch } from "./state";
import { loadUser } from "./state/user";
import AuthMain from "./features/auth/AuthMain";
import P2PCallMain from "./features/p2p-call/P2PCallMain";
import CallCreationMain from "./features/call-selection/CallCreationMain";
import CallJoinMain from "./features/call-selection/CallJoinMain";
import PendingUserMain from "./features/call-selection/PendingUserMain";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router base="/">
        <Switch>
          <Route path="/" component={AuthMain} />
          <Route path="/create" component={CallCreationMain} />
          <Route path="/pending" component={PendingUserMain} />
          <Route path="/join" component={CallJoinMain} />
          <Route path="/left" component={() => <p>Left.</p>} />
          <Route path="/p2p-call/:callUid" component={P2PCallMain} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}
