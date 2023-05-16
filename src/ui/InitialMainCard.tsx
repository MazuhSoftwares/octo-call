import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { SIZES } from "./constants";

export interface InitialMainCardProps {
  children: ReactNode;
  subtitle?: string;
}

export default function InitialMainCard({
  children,
  subtitle,
}: InitialMainCardProps) {
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
      <Card variant="outlined" sx={{ width: SIZES.mainPopupWidth }}>
        <Typography variant="h1" gutterBottom={!subtitle}>
          Octo Call
        </Typography>
        {!!subtitle && (
          <Typography variant="h2" gutterBottom>
            {subtitle}
          </Typography>
        )}
        {children}
      </Card>
    </Box>
  );
}
