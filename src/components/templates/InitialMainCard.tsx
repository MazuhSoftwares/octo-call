import { ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import homeBgPattern from "../../assets/home-bg-patternpad.jpg";
import { useAppDispatch, useAppSelector } from "../../state";
import { logout, selectIsAuthenticated } from "../../state/user";
import SettingsModal from "../settings/SettingsModal";

export interface InitialMainCardProps {
  children: ReactNode;
  subtitle?: string;
}

export default function InitialMainCard({
  children,
  subtitle,
}: InitialMainCardProps) {
  const dispatch = useAppDispatch();
  const handleLogoutClick = () => dispatch(logout());

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

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
          <Box sx={{ marginLeft: { xs: "auto", sm: "initial" }, pb: 1 }}>
            {isAuthenticated && (
              <Button
                aria-label="Logout"
                onClick={handleLogoutClick}
                color="error"
                variant="outlined"
                sx={{ mr: 1 }}
              >
                <LogoutIcon fontSize="small" />
              </Button>
            )}
            <Button
              aria-label="Settings"
              onClick={openSettings}
              color="secondary"
              variant="outlined"
            >
              <SettingsIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
        {children}
      </Card>
      <SettingsModal isOpen={isSettingsOpen} close={closeSettings} />
    </Box>
  );
}