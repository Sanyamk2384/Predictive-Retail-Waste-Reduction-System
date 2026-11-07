import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { fileURLToPath } from "node:url";

const uploadDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads",
);
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, cb) => cb(null, `${randomUUID()}.csv`),
});

const fileFilter = (req, file, cb) => {
  if (
    path.extname(file.originalname).toLowerCase() === ".csv" ||
    ["text/csv", "application/vnd.ms-excel", "application/csv"].includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error("Only CSV files are allowed"), { status: 400 }));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export const uploadCsv = [
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "File", maxCount: 1 },
  ]),
  (req, res, next) => {
    const files = req.files || {};
    const lowerCaseFile = files.file?.[0];
    const upperCaseFile = files.File?.[0];
    if (lowerCaseFile && upperCaseFile) {
      return next(
        Object.assign(new Error("Upload only one CSV file"), { status: 400 }),
      );
    }
    req.file = lowerCaseFile || upperCaseFile;
    return next();
  },
];
