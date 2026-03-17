const SCHEME = "latlas";
const PATH = "join";

/**
 * Builds the class join URL for QR code / deep link.
 * Used by the student app to register for a class.
 * - With password: latlas://join?access_code=XXX&password=YYY
 * - Without password: latlas://join?access_code=XXX (student app may prompt for password)
 */
export function buildClassJoinUrl(
  accessCode: string,
  password?: string | null
): string {
  const params = new URLSearchParams();
  params.set("access_code", accessCode);
  if (password != null && password !== "") {
    params.set("password", password);
  }
  const query = params.toString();
  return `${SCHEME}://${PATH}${query ? `?${query}` : ""}`;
}
