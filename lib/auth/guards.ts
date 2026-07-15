import { getCurrentUser, getUserRole } from "./session";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Guard that requires the user to be logged in.
 * Throws an AuthError (401) if unauthenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError(401, "Unauthorized: Authentication required");
  }
  return user;
}

/**
 * Guard that requires the user to have the 'admin' role.
 * Throws an AuthError (403) if unauthorized.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole();
  if (role !== "admin") {
    throw new AuthError(403, "Forbidden: Admin privileges required");
  }
  return user;
}

/**
 * Guard that requires ownership of a resource or admin override.
 * Throws an AuthError (403) if unauthorized.
 */
export async function requireOwnership(resourceOwnerId: string) {
  const user = await requireAuth();
  const role = await getUserRole();

  if (user.id !== resourceOwnerId && role !== "admin") {
    throw new AuthError(403, "Forbidden: Resource ownership or admin privileges required");
  }
  return user;
}
