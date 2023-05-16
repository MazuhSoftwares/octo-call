import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppDispatch, useAppSelector } from "../state";
import { logout, selectIsAuthenticated } from "../state/user";

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
      }}
    >
      <Card variant="outlined" sx={{ width: 700 }}>
        <Box
          component="header"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "start", sm: "center" },
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h1">Octo Call</Typography>
            {!!subtitle && <Typography variant="h2">{subtitle}</Typography>}
          </Box>
          <Box sx={{ marginLeft: { xs: "auto", sm: "initial" } }}>
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
              onClick={() => console.warn("Not implemented yet.")}
              color="secondary"
              variant="outlined"
            >
              <SettingsIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
        {children}
      </Card>
    </Box>
  );
}
