import { ReactNode, useState } from "react";
import { Redirect } from "wouter";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import homeBgPattern from "../../assets/home-bg-patternpad.jpg";
import mainCharBlueOutlineImg from "../../assets/main-char-blue-outline.png";
import mainCharWhiteOutlineImg from "../../assets/main-char-white-outline.png";
import mainCharPinkOutlineImg from "../../assets/main-char-pink-outline.png";
import { useAppDispatch, useAppSelector } from "../../state";
import useAgentHelper from "../../hooks/useAgentHelper";
import {
  logout,
  selectIsSessionBlocked,
  selectIsUserAuthenticated,
} from "../../state/user";
import SettingsModal from "../settings/SettingsModal";
import ErrorAlert from "../basic/ErrorAlert";
import WarningAlert from "../basic/WarningAlert";
import useRedirectionRule from "../../hooks/useRedirectionRule";

export interface HomeTemplateProps {
  children: ReactNode;
  subtitle?: string | ReactNode;
}

export default function HomeTemplate({
  children,
  subtitle,
}: HomeTemplateProps) {
  const dispatch = useAppDispatch();

  const handleLogoutClick = () => dispatch(logout());

  const isAuthenticated = useAppSelector(selectIsUserAuthenticated);
  const isSessionBlocked = useAppSelector(selectIsSessionBlocked);

  const { canRunWebRTC, isChromeBased, isFirefoxBased } = useAgentHelper();

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const goTo = useRedirectionRule();

  if (goTo) {
    return <Redirect to={goTo} />;
  }

  return (
    <Box
      component="main"
      sx={{
        width: "calc(100vw - 3px)",
        height: "calc(100vh - 3px)",
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
      <Card
        variant="outlined"
        sx={{
          width: 700,
          position: "relative",
          overflow: "unset",
        }}
      >
        <OurCuteMainChar />
        <Box
          component="header"
          sx={{
            display: "flex",
            flexDirection: { xs: subtitle ? "column" : "row", sm: "row" },
            alignItems: { xs: subtitle ? "start" : "center", sm: "center" },
            justifyContent: "space-between",
            mb: 1,
            position: "inherit",
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
            {isAuthenticated && !isSessionBlocked && (
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
            {!isSessionBlocked && (
              <IconButton
                aria-label="Settings"
                title="Settings"
                onClick={openSettings}
              >
                <SettingsIcon />
              </IconButton>
            )}
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
        <Box sx={{ position: "inherit" }}>{children}</Box>
      </Card>
      <SettingsModal isOpen={isSettingsOpen} close={closeSettings} />
    </Box>
  );
}

const mainCharImgs: string[] = [
  mainCharBlueOutlineImg,
  mainCharPinkOutlineImg,
  mainCharWhiteOutlineImg,
];
const randomMainCharImg: string =
  mainCharImgs[Math.floor(Math.random() * mainCharImgs.length)];

function OurCuteMainChar() {
  return (
    <Box
      component="img"
      src={randomMainCharImg}
      width="100%"
      title="😉"
      alt="Pixel art.
      It's a young woman staring at the user and winking.
      She's with headphones and ready to make a call.
      She is black, curly hair, thin, wearing a white sleeveless shirt, shorts with a coat tied around her waist.
      Its drawing strokes changes color randomly on each page visit."
      sx={{
        userSelect: "none",
        WebkitTouchCallout: "none",
        position: "absolute",
        left: { xs: "0px", sm: "0px", md: "-200px", xl: "-275px" },
        top: { xs: "-125px", sm: "-150px", md: "auto", xl: "auto" },
        bottom: { xs: "auto", sm: "auto", md: "0", xl: "0" },
        width: { xs: "125px", sm: "150px", md: "300px", xl: "400px" },
      }}
      draggable="false"
      onClick={() => console.log("Hello there! 😉")}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
