const fs = require("fs");
const path = require("path");

const s3fs = require("s3fs");
const mime = require("mime-types");

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const walkSync = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...walkSync(name)] : [...files, name];
  }, []);

const main = async (src, bucketName, tag) => {
  guard(AWS_REGION, "AWS_REGION");
  guard(AWS_ACCESS_KEY_ID, "AWS_ACCESS_KEY_ID");
  guard(AWS_SECRET_ACCESS_KEY, "AWS_SECRET_ACCESS_KEY");

  guard(bucketName, "BucketName");
  guard(tag, "Tag");

  const instance = new s3fs(bucketName, {
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  });

  const files = walkSync(src);

  for (const file of files) {
    const dest = `${tag}/${file}`;

    const mimeType = mime.lookup(file);

    await instance.writeFile(dest, fs.readFileSync(file), {
      ACL: "public-read",
      ContentType: mimeType
    });
    console.log("Uploaded: ", file, "->", `${bucketName}/${dest}`, mimeType);
  }
};

const guard = (val, name) => {
  if (!val) {
    throw new Error(`'${name}' is not defined.`);
  }
};

const args = process.argv.slice(2);

main(...args)
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

module.exports = main;
