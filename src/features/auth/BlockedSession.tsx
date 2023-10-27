import Box from "@mui/material/Box";
import HomeTemplate from "../../components/templates/HomeTemplate";
import useRedirectionRule from "../../hooks/useRedirectionRule";
import { Redirect } from "wouter";
import ErrorAlert from "../../components/basic/ErrorAlert";

export default function BlockedSession() {
  const goTo = useRedirectionRule();

  if (goTo) {
    return <Redirect to={goTo} />;
  }

  return (
    <HomeTemplate>
      <Box component="span" pr={1}>
        <ErrorAlert message="Account in use in another device." />
      </Box>
    </HomeTemplate>
  );
}
