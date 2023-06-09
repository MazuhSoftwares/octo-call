import { ReactNode } from "react";
import { Link as LinkWouter } from "wouter";
import Box from "@mui/material/Box";
import LinkMUI, { LinkProps as LinkMUIProps } from "@mui/material/Link";

interface LinkProps {
  children: ReactNode;
  to: string;
  sx?: LinkMUIProps["sx"];
}

export default function Link({ children, to, sx }: LinkProps) {
  return (
    <LinkWouter href={to}>
      <LinkMUI sx={sx}>
        <Box
          component="span"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          {children}
        </Box>
      </LinkMUI>
    </LinkWouter>
  );
}
