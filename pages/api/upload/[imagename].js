import fs from 'fs';

export default function handler(req, res) {
  const { imagename } = req.query;
  // set response header as image/jpeg
  fs.readFile(`upload/${imagename}`, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
      // set cache control header
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.status(200).send(data);
    }
  });
}
