import { ReactNode, useId, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from "@mui/icons-material/Help";
import PeopleIcon from "@mui/icons-material/People";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useAppDispatch, useAppSelector } from "../../state";
import { leaveCall, selectCallDisplayName } from "../../state/call";
import { getThemedColor } from "../styles";
import { logout, selectUserDisplayName } from "../../state/user";
import ParticipantsModal from "../participants/ParticipantsModal";
import { Redirect } from "wouter";
import { selectCallUsers } from "../../state/callUsers";
import { useCallUsersListener } from "../../hooks/useCallUsersListener";
import ToggleMicButton from "../devices/ToggleMicButton";
import ToggleCamButton from "../devices/ToggleCamButton";
import useRedirectionRule from "../../hooks/useRedirectionRule";
import PendingUsersModal from "../participants/PendingUsersModal";

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
  const [isPendingUsersOpen, setPendingUsersOpen] = useState(true);
  const openParticipants = () => setParticipantsOpen(true);
  const closeParticipants = () => setParticipantsOpen(false);
  const closePendingUsers = () => setPendingUsersOpen(false);

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
      <PendingUsersModal
        isOpen={isPendingUsersOpen}
        close={closePendingUsers}
      />
    </Box>
  );
}
