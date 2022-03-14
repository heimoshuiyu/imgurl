import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar sx={{ flex: 1, justifyContent: "space-between" }}>
        <Link href="/" passHref>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "text",
              textDecoration: "none",
            }}
          >
            imgurl
          </Typography>
        </Link>
        <Typography>An image uploader</Typography>
      </Toolbar>
    </AppBar>
  );
}
