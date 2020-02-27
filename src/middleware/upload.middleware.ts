import express from 'express';
import * as path from 'path';
import multer from 'multer';

export class UploadMiddleware {
  static uploadFile = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const tempFilePath = path.join(__dirname, '..', 'tmp', 'cnv-tool-result');
    const MIME_TYPE_MAP = {
      'text/plain': 'txt'
    };
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        const error = isValid ? null : new Error('Invalid mime type');
        cb(error, tempFilePath);
      },
      filename: (req, file, cb) => {
        const name = file.originalname
          .toLowerCase()
          .split(' ')
          .join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, `${name}-${Date.now()}.${ext}`);
      }
    });
    const upload = multer({ storage: storage }).single('file');

    upload(req, res, err => {
      if (err) {
        console.error(err);
        res.status(500).end();
      } else {
        console.log(req.file);
        next();
      }
    });
  };
}
