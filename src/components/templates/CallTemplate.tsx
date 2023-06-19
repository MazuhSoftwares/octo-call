import { ReactNode, useId, useState } from "react";
import { Redirect } from "wouter";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PersonIcon from "@mui/icons-material/Person";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from "@mui/icons-material/Help";
import PeopleIcon from "@mui/icons-material/People";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  leaveCall,
  selectCallDisplayName,
  selectParticipants,
} from "../../state/call";
import { getThemedColor } from "../app/mui-styles";
import { logout, selectUserDisplayName } from "../../state/user";
import ParticipantsModal from "../participants/ParticipantsModal";
import useCallUsersListener from "../../hooks/useCallUsersListener";
import ToggleMicButton from "../devices/ToggleMicButton";
import ToggleCamButton from "../devices/ToggleCamButton";
import useRedirectionRule from "../../hooks/useRedirectionRule";

export interface CallTemplateProps {
  children: ReactNode;
}

export default function CallTemplate({ children }: CallTemplateProps) {
  useCallUsersListener();

  const goTo = useRedirectionRule();

  if (goTo) {
    return <Redirect to={goTo} />;
  }

  return (
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
  );
}

function CallHeader() {
  const dispatch = useAppDispatch();

  const callDisplayName = useAppSelector(selectCallDisplayName);
  const userDisplayName = useAppSelector(selectUserDisplayName);

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
          <Box
            component="code"
            sx={{
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: "200px", sm: "300px", md: "500px", lg: "unset" },
            }}
          >
            {callDisplayName}
          </Box>
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
          <Box
            component="span"
            className="visually-hidden--xs visually-hidden--sm"
          >
            {userDisplayName}
          </Box>
          <PersonIcon sx={{ display: { xs: "inline-block", md: "none" } }} />
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

  const participants = useAppSelector(selectParticipants);

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
          {participants.length}
        </Button>
      </Box>

      <Box sx={{ display: "flex" }}>
        <ToggleMicButton
          handleToggleMicClick={handleToggleMicClick}
          isAudioEnabled={isAudioEnabled}
          sx={{ mr: 1 }}
        />
        <ToggleCamButton
          handleToggleCamClick={handleToggleCamClick}
          isVideoEnabled={isVideoEnabled}
        />
      </Box>

      <Box sx={{ display: "flex" }}>
        <Button
          onClick={handleLeaveClick}
          size="large"
          color="error"
          sx={{ display: { xs: "inline-block", sm: "inline-flex" } }}
          startIcon={
            <CallEndIcon
              fontSize="medium"
              sx={{ display: { xs: "none", sm: "inherit" } }}
            />
          }
        >
          <CallEndIcon
            fontSize="medium"
            sx={{ display: { xs: "inherit", sm: "none" } }}
          />
          <Box component="span" className="visually-hidden--xs">
            Leave this call
          </Box>
        </Button>
      </Box>

      <ParticipantsModal
        isOpen={isParticipantsOpen}
        close={closeParticipants}
      />
    </Box>
  );
}
