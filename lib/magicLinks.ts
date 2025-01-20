import JWT from 'expo-jwt';
const { EXPO_PUBLIC_MAGIC_LINK_SECRET } = process.env

if (typeof EXPO_PUBLIC_MAGIC_LINK_SECRET !== "string") {
  throw new Error("Missing env: MAGIC_LINK_SECRET")
}

type MagicLinkPayload = {
  email: string;
  nonce: string;
  createdAt: string;
};

export function generateMagicLink(email: string, nonce: string, redirect: string) {
  const payload: MagicLinkPayload = {
    email,
    nonce,
    createdAt: new Date().toISOString(),
  };
  const token = JWT.encode(payload, EXPO_PUBLIC_MAGIC_LINK_SECRET!)
  if (typeof redirect !== "string") {
    throw new Error("Missing redirect url");
  }
  const url = new URL(redirect);
  url.pathname = "/--/validate-magic-link";
  url.searchParams.set("magic", token);
  return url.toString();
};

function isMagicLinkPayload(value: any): value is MagicLinkPayload {
  return (
    typeof value === "object" &&
    typeof value.email === "string" &&
    typeof value.nonce === "string" &&
    typeof value.createdAt === "string"
  )
};

export function invalidMagicLink(message: string) {
  return Response.json({ message }, { status: 400 })
};

export function getMagicLinkPayload(link: string) {
  if (typeof link !== "string") {
    throw invalidMagicLink("'magic' search parameter does not exist");
  }

  const magicLinkPayload = JWT.decode(link, EXPO_PUBLIC_MAGIC_LINK_SECRET!);
  if (!isMagicLinkPayload(magicLinkPayload)) {
    throw invalidMagicLink("invalid magic link payload");
  }
  return magicLinkPayload;
};