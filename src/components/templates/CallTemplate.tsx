import { ReactNode, useContext, useId, useState } from "react";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from "@mui/icons-material/Help";
import PeopleIcon from "@mui/icons-material/People";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  leaveCall,
  selectCallDisplayName,
  selectHasLeftCall,
} from "../../state/call";
import { getThemedColor } from "../styles";
import { logout, selectCurrentUser } from "../../state/user";
import ParticipantsModal from "../participants/ParticipantsModal";
import { CallUsersProvider } from "../../contexts/CallUsersProvider";
import { Redirect } from "wouter";
import { selectCallUsers } from "../../state/callUsers";

export interface CallTemplateProps {
  children: ReactNode;
}

export default function CallTemplate({ children }: CallTemplateProps) {
  const hasLeftCall = useAppSelector(selectHasLeftCall);

  if (hasLeftCall) {
    return <Redirect to="/" />;
  }

  return (
    <CallUsersProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <CallHeader />
        <CallMain>{children}</CallMain>
        <CallFooter />
      </Box>
    </CallUsersProvider>
  );
}

function CallHeader() {
  const dispatch = useAppDispatch();

  const callDisplayName = useAppSelector(selectCallDisplayName);
  const userDisplayName = useAppSelector(selectCurrentUser).displayName;

  const profileBtnId = useId();
  const profileMenuId = useId();

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const closeProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const handleAboutOctoCallClick = () => {
    window.alert("Video conference app. A proof of concept.");
    closeProfileMenu();
  };

  const handleLogoutClick = () => dispatch(logout());

  return (
    <Box
      component="header"
      sx={{
        flexShrink: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 4,
        borderBottom: "1px solid",
        borderColor: getThemedColor("commonBorder"),
      }}
    >
      <Box>
        <Typography variant="h1">Octo Call</Typography>
        <Typography variant="h2">
          <code>{callDisplayName}</code>
        </Typography>
      </Box>
      <Box>
        <Button
          title="More user options"
          id={profileBtnId}
          aria-controls={isProfileMenuOpen ? profileMenuId : undefined}
          aria-haspopup="true"
          aria-expanded={isProfileMenuOpen ? "true" : undefined}
          variant="outlined"
          size="large"
          endIcon={<MoreVertIcon fontSize="large" />}
          onClick={handleClick}
        >
          {userDisplayName}
        </Button>
        <Menu
          id={profileMenuId}
          anchorEl={profileAnchorEl}
          open={isProfileMenuOpen}
          onClose={closeProfileMenu}
          MenuListProps={{
            "aria-labelledby": profileBtnId,
          }}
        >
          <MenuItem onClick={handleAboutOctoCallClick}>
            <HelpIcon sx={{ mr: 1 }} /> About Octo Call
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <LogoutIcon color="error" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

function CallMain({ children }: { children: ReactNode }) {
  return (
    <Box component="main" sx={{ flexGrow: 1 }}>
      {children}
    </Box>
  );
}

function CallFooter() {
  const dispatch = useAppDispatch();

  const callUsers = useAppSelector(selectCallUsers);

  const [isParticipantsOpen, setParticipantsOpen] = useState(false);
  const openParticipants = () => setParticipantsOpen(true);
  const closeParticipants = () => setParticipantsOpen(false);

  const [isAudioEnabled, setAudioEnabled] = useState(true);
  const handleToggleMicClick = () => setAudioEnabled((current) => !current);

  const [isVideoEnabled, setVideoEnabled] = useState(false);
  const handleToggleCamClick = () => setVideoEnabled((current) => !current);

  const handleLeaveClick = () => dispatch(leaveCall());

  return (
    <Box
      component="footer"
      sx={{
        flexShrink: 0,
        background: getThemedColor("middleground"),
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 4,
        borderTop: "1px solid",
        borderColor: getThemedColor("commonBorder"),
      }}
    >
      <Box sx={{ display: "flex" }}>
        <Button
          aria-label="Participants"
          title="Participants"
          onClick={openParticipants}
          startIcon={<PeopleIcon fontSize="medium" />}
          size="large"
        >
          {callUsers.participants.length}
        </Button>
      </Box>

      <Box sx={{ display: "flex" }}>
        <IconButton
          aria-label="Toggle microphone"
          title="Toggle microphone"
          onClick={handleToggleMicClick}
          size="large"
          color={isAudioEnabled ? "info" : "error"}
          sx={{ mr: 1 }}
        >
          {isAudioEnabled ? (
            <>
              <Box sx={visuallyHidden}>Microphone is on.</Box>
              <MicIcon fontSize="medium" />
            </>
          ) : (
            <>
              <Box sx={visuallyHidden}>Microphone is off.</Box>
              <MicOffIcon fontSize="medium" />
            </>
          )}
        </IconButton>
        <IconButton
          aria-label="Toggle camera"
          title="Toggle camera"
          onClick={handleToggleCamClick}
          size="large"
          color={isVideoEnabled ? "info" : "error"}
        >
          {isVideoEnabled ? (
            <>
              <Box sx={visuallyHidden}>Camera is on.</Box>
              <VideocamIcon fontSize="medium" />
            </>
          ) : (
            <>
              <Box sx={visuallyHidden}>Camera is off.</Box>
              <VideocamOffIcon fontSize="medium" />
            </>
          )}
        </IconButton>
      </Box>

      <Box sx={{ display: "flex" }}>
        <Button
          onClick={handleLeaveClick}
          startIcon={<CallEndIcon fontSize="medium" />}
          size="large"
          color="error"
        >
          Leave this call
        </Button>
      </Box>

      <ParticipantsModal
        isOpen={isParticipantsOpen}
        close={closeParticipants}
      />
    </Box>
  );
}
