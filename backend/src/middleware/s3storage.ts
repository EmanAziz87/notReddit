import s3Client from "../util/s3client";
import multer from "multer";
import multerS3 from "multer-s3";
import envConfig from "../util/envConfig";

const uploads = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: envConfig.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.filename,
        uploadedBy: req.session.userId || "anonymous",
        mimeType: file.mimetype,
        uploadDate: new Date().toISOString(),
        originalFileName: file.originalname,
      });
    },
    key: (_req, file, cb) => {
      let extension: string | undefined = file.originalname.split(".").pop();
      const timeStamp = Date.now();
      const randomString = Math.round(Math.random() * 1e9);
      if (!extension || extension === file.originalname) {
        extension = file.mimetype.split("/")[1];
      }

      cb(null, `${timeStamp}-${randomString}.${extension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      return cb(null, false);
    }
    cb(null, true);
  },
});

export default uploads;
