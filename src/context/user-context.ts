import {AuthProfile} from '../@types/models';

/**
 * User Context Utility
 *
 * Provides a way to store and access the current authenticated user
 * throughout the request lifecycle without having to pass it through
 * every service constructor.
 *
 * Usage in controllers:
 * UserContext.setCurrentUser(request.user);
 *
 * Usage in services:
 * const currentUser = UserContext.getCurrentUser();
 */
class UserContextManager {
  private static instance: UserContextManager;
  private currentUser: AuthProfile | null = null;

  private constructor() {}

  public static getInstance(): UserContextManager {
    if (!UserContextManager.instance) {
      UserContextManager.instance = new UserContextManager();
    }
    return UserContextManager.instance;
  }

  public setCurrentUser(user: AuthProfile | null): void {
    this.currentUser = user;
  }

  public getCurrentUser(): AuthProfile | null {
    return this.currentUser;
  }

  public requireCurrentUser(): AuthProfile {
    if (!this.currentUser) {
      throw new Error(
        'No authenticated user found in context. This should not happen if authentication middleware is properly configured.'
      );
    }
    return this.currentUser;
  }

  public clearCurrentUser(): void {
    this.currentUser = null;
  }
}

// Export singleton instance
export const UserContext = UserContextManager.getInstance();
