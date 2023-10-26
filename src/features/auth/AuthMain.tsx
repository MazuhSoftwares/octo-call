import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import GoogleIcon from "@mui/icons-material/Google";
import HomeTemplate from "../../components/templates/HomeTemplate";
import { useAppDispatch, useAppSelector } from "../../state";
import {
  login,
  selectExpiredSessionMessage,
  selectIsUserPendingAuthentication,
} from "../../state/user";
import ErrorAlert from "../../components/basic/ErrorAlert";

export default function AuthMain() {
  const dispatch = useAppDispatch();

  const handleLoginClick = () => dispatch(login());

  const isPending = useAppSelector(selectIsUserPendingAuthentication);
  const expiredSessionMessage = useAppSelector(selectExpiredSessionMessage);

  return (
    <HomeTemplate>
      <Typography
        sx={{
          display: { xs: "flex", sm: "block" },
          flexDirection: "column",
        }}
      >
        <Box component="span" pr={1}>
          Video conference app.
        </Box>
        <Box component="span">A proof of concept.</Box>
      </Typography>
      <ErrorAlert message={expiredSessionMessage} />
      <Button
        onClick={handleLoginClick}
        disabled={isPending}
        color="primary"
        variant="contained"
        startIcon={<GoogleIcon />}
        fullWidth
        sx={{ marginTop: 3 }}
      >
        {isPending ? "Checking..." : "Continue with Google"}
      </Button>
    </HomeTemplate>
  );
}
