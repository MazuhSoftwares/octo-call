import { ReactNode, useState } from "react";
import { Redirect } from "wouter";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import homeBgPattern from "../../assets/home-bg-patternpad.jpg";
import { useAppDispatch, useAppSelector } from "../../state";
import useAgentHelper from "../../hooks/useAgentHelper";
import { logout, selectIsUserAuthenticated } from "../../state/user";
import SettingsModal from "../settings/SettingsModal";
import { selectIsPendingCallUser } from "../../state/callUsers";
import ErrorAlert from "../basic/ErrorAlert";
import WarningAlert from "../basic/WarningAlert";
import useRedirectionRule from "../../hooks/useRedirectionRule";

export interface HomeTemplateProps {
  children: ReactNode;
  subtitle?: string;
}

export default function HomeTemplate({
  children,
  subtitle,
}: HomeTemplateProps) {
  const dispatch = useAppDispatch();

  const handleLogoutClick = () => dispatch(logout());

  const isAuthenticated = useAppSelector(selectIsUserAuthenticated);

  const { canRunWebRTC, isChromeBased, isFirefoxBased } = useAgentHelper();

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const isUserPending = useAppSelector(selectIsPendingCallUser);

  const goTo = useRedirectionRule();

  if (goTo) {
    return <Redirect to={goTo} />;
  }

  if (isUserPending) {
    return <p>Esperando...</p>;
  }

  return (
    <Box
      component="main"
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${homeBgPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      }}
    >
      <Card variant="outlined" sx={{ width: 700 }}>
        <Box
          component="header"
          sx={{
            display: "flex",
            flexDirection: { xs: subtitle ? "column" : "row", sm: "row" },
            alignItems: { xs: subtitle ? "start" : "center", sm: "center" },
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ pb: 1 }}>
            <Typography variant="h1">Octo Call</Typography>
            {!!subtitle && <Typography variant="h2">{subtitle}</Typography>}
          </Box>
          <Box
            sx={{
              display: "flex",
              marginLeft: { xs: "initial", sm: "auto" },
              pb: 1,
            }}
          >
            {isAuthenticated && (
              <IconButton
                aria-label="Logout"
                title="Logout"
                onClick={handleLogoutClick}
                color="error"
                sx={{ mr: 1 }}
              >
                <LogoutIcon />
              </IconButton>
            )}
            <IconButton
              aria-label="Settings"
              title="Settings"
              onClick={openSettings}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
        {!canRunWebRTC() && (
          <ErrorAlert
            prefix="Hey! BIG ISSUE detected."
            message="This browser does not fully implement WebRTC technology. This app won't work."
            sx={{ mb: 1, mt: 1 }}
          />
        )}
        {!isChromeBased() && !isFirefoxBased() && (
          <WarningAlert
            message="Recommended browsers are any Chrome-based or Firefox."
            sx={{ mb: 1, mt: 1, display: { xs: "none", md: "flex" } }}
          />
        )}
        {children}
      </Card>
      <SettingsModal isOpen={isSettingsOpen} close={closeSettings} />
    </Box>
  );
}
