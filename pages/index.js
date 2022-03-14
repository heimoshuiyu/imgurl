import formidable from "formidable";
import { exec } from "child_process";
import { useEffect, useState } from "react";
import fs from "fs";
import Link from "next/link";

import Head from "../components/Head";
import Header from "../components/Header";

import {
  Stack,
  Box,
  Input,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

const __upload_dir = `${process.cwd()}/upload`;

export default function Home(props) {
  const [currentURL, setCurrentURL] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setCurrentURL(`${window.location.href}`);
  }, []);

  // return for get method
  if (props.method === "get") {
    return (
      <Box>
        <Head />
        <Header />
        <Box sx={{ m: 2 }} spacing={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Upload
          </Typography>
          <form action="" method="post" encType="multipart/form-data">
            <Stack spacing={2}>
              <Input
                color="primary"
                type="file"
                name="image"
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                }}
              />
              <Button
                color="primary"
                variant="contained"
                type="submit"
                value="Upload"
                onClick={(event) => {
                  if (!selectedFile) {
                    event.preventDefault();
                    setOpenDialog(true);
                    return;
                  }
                }}
              >
                Upload
              </Button>
              <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Please select an image!</DialogTitle>
                <DialogActions>
                  <Button onClick={() => setOpenDialog(false)} color="primary">
                    Ok
                  </Button>
                </DialogActions>
              </Dialog>
            </Stack>
          </form>
        </Box>
      </Box>
    );
  } else if (props.method === "post") {
    // return for post method
    const absImagePath = `${currentURL}${props.image}`;
    return (
      <Box>
        <Head />
        <Header />
        <Stack sx={{ m: 2 }} spacing={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Upload Success
          </Typography>
          <Typography>
            Original image size: {calReadableFilesize(props.originalSize)}
            <br />
            New image size: {calReadableFilesize(props.newSize)}
            <br />
            Duration: {calReadableTime(props.time)}
          </Typography>
          <Typography
            sx={{
              wordWrap: "break-word",
            }}
          >
            Your image link is:{" "}
            <a
              href={`${absImagePath}`}
              target="_blank"
              rel="noreferrer"
            >{`${absImagePath}`}</a>
          </Typography>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              // copy to clipboard
              navigator.clipboard.writeText(`${absImagePath}`);
              setOpenSnackbar(true);
            }}
          >
            Copy to clipboard
          </Button>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={1000}
            onClose={() => setOpenSnackbar(false)}
          >
            <Alert sx={{ width: "100%" }} variant="filled" severity="success">
              Copied to clipboard
            </Alert>
          </Snackbar>
          <Link href="/" passHref>
            <Button color="secondary" variant="contained">
              Back to Home
            </Button>
          </Link>
          {currentURL && (
            <img
              sx={{
                width: "100%",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              src={absImagePath}
              alt="converted image"
            />
          )}
        </Stack>
      </Box>
    );
  }
}

export async function getServerSideProps(context) {
  // get method
  if (context.req.method === "GET") {
    return {
      props: {
        method: "get",
      },
    };
  } else if (context.req.method === "POST") {
    // start time
    const startTime = new Date();
    // post method
    const { files } = await formParse(context.req);
    const filepath = files.image.filepath;
    const outpath = `${__upload_dir}/${files.image.newFilename}.jpg`;
    const imageurl = `/api/upload/${files.image.newFilename}.jpg`;

    // call ffmpeg to convert image to jpg
    await asyncExec(`ffmpeg -i ${filepath} -y ${outpath}`);

    const originalSize = files.image.size;
    const newSize = fs.statSync(outpath).size;

    // remove original image
    await asyncExec(`rm ${filepath}`);

    // end time
    const endTime = new Date();
    const time = endTime - startTime;

    // return image path
    return {
      props: {
        method: "post",
        image: imageurl,
        originalSize,
        newSize,
        time,
      },
    };
  }
}

async function asyncExec(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({ stdout, stderr });
    });
  });
}

async function formParse(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      resolve({ fields, files });
    });
  });
}

function calReadableFilesize(size) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = 0;
  while (size >= 1024) {
    size /= 1024;
    ++i;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

function calReadableTime(time) {
  const units = ["ms", "s", "m", "h", "d"];
  let i = 0;
  while (time >= 1000) {
    time /= 1000;
    ++i;
  }
  return `${time.toFixed(1)} ${units[i]}`;
}
