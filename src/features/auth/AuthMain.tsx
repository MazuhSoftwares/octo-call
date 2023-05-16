import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import GoogleIcon from "@mui/icons-material/Google";
import InitialMainCard from "../../ui/InitialMainCard";
import { useAppDispatch, useAppSelector } from "../../state";
import { login, selectCurrentUser } from "../../state/user";

export default function AuthMain() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);

  const handleLoginClick = () => dispatch(login());
  const isPending = user.status === "pending";

  return (
    <InitialMainCard>
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
      <Button
        onClick={handleLoginClick}
        disabled={isPending}
        color="primary"
        variant="contained"
        startIcon={<GoogleIcon />}
        sx={{ marginTop: "25px", width: "100%" }}
      >
        {isPending ? "Checking..." : "Continue with Google"}
      </Button>
    </InitialMainCard>
  );
}
