import crypto from "node:crypto";

const FIVE_MINUTES_IN_SECONDS = 60 * 5;

type VerifySlackSignatureOptions = {
  body: string;
  timestamp: string | null;
  signature: string | null;
  signingSecret: string;
};

export function verifySlackSignature({
  body,
  timestamp,
  signature,
  signingSecret,
}: VerifySlackSignatureOptions) {
  if (!timestamp || !signature) {
    return false;
  }

  const requestAge = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(requestAge) || requestAge > FIVE_MINUTES_IN_SECONDS) {
    return false;
  }

  const computedSignature = `v0=${crypto
    .createHmac("sha256", signingSecret)
    .update(`v0:${timestamp}:${body}`)
    .digest("hex")}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}
