import crypto from "node:crypto";

const FIVE_MINUTES_IN_SECONDS = 60 * 5;

export function verifySlackRequest(options: {
  body: string;
  timestamp: string | null;
  signature: string | null;
  signingSecret: string;
}) {
  const { body, timestamp, signature, signingSecret } = options;

  if (!timestamp || !signature) {
    return false;
  }

  const requestAge = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(requestAge) || requestAge > FIVE_MINUTES_IN_SECONDS) {
    return false;
  }

  const baseString = `v0:${timestamp}:${body}`;
  const digest = crypto.createHmac("sha256", signingSecret).update(baseString).digest("hex");
  const computedSignature = `v0=${digest}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}
