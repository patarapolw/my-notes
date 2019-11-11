import crypto from "crypto";

export async function generateSecret(size: number = 48): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString("base64"));
      }
    })
  })
}
