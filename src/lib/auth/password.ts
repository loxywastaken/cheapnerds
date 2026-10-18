import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;
// Pre-computed hash used to keep timing consistent when an email doesn't exist.
const DUMMY_HASH = "$2b$12$z7j6WnksmnfvlQnLDAtW4.tP2lcBbio280pbidCkmH0x5/s4Mz4xC";

export const PASSWORD_MIN_LENGTH = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, COST);
}

export async function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, hash);
}

export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > 128) return "Password must be at most 128 characters.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9\W_]/.test(password)) return "Use a mix of letters and numbers or symbols.";
  return null;
}
