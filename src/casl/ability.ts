import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { Role } from './roles';
import { Action, Subject } from './actions';

// Define the type for our user
type User = {
  id?: string;
  role?: Role;
  isVerified?: boolean;
  memberId?: string;
};

// Define the type of our ability
export type AppAbility = MongoAbility<[Action, Subject | 'all']>;

/**
 * Defines abilities for users based on their roles
 * This function creates a CASL ability instance with permissions based on user role
 */
export function defineAbilityFor(user: User | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  // Default permissions for everyone (even without login)
  can(Action.READ, Subject.MOVIE);
  can(Action.READ, Subject.SHOWTIME);
  can(Action.VIEW, Subject.ALL); // Everyone can view basic content

  if (!user || !user.role) {
    // Customer/Guest permissions (not logged in)
    return build();
  }
  // Role-based permissions
  switch (user.role) {
    case Role.ADMIN:
      // Admin can do everything
      can(Action.MANAGE, Subject.ALL);
      break;

    case Role.STAFF:
      // Staff permissions
      can([Action.READ, Action.CREATE, Action.UPDATE], Subject.MOVIE);
      can([Action.READ, Action.CREATE, Action.UPDATE], Subject.SHOWTIME);
      can([Action.READ, Action.UPDATE], Subject.BOOKING);
      can(Action.READ, Subject.USER);
      can([Action.READ, Action.UPDATE], Subject.ROOM);
      can([Action.READ, Action.CREATE, Action.UPDATE], Subject.PROMOTION);
      can([Action.READ, Action.APPROVE], Subject.REFUND);
      can(Action.BOOK, Subject.BOOKING);
      break;

    case Role.MEMBER:
      // Member (Authorized User) permissions
      can(Action.BOOK, Subject.BOOKING);
      can(Action.READ, Subject.BOOKING);
      can(Action.READ, Subject.TICKET);
      can(Action.UPDATE, Subject.USER);
      can(Action.CREATE, Subject.REVIEW);
      can([Action.UPDATE, Action.DELETE], Subject.REVIEW);
      can(Action.READ, Subject.PROMOTION);
      break;
      
    case Role.CUSTOMER:
      // Customer (Guest) permissions - can browse but NOT book tickets
      // Removing BOOK permission - they can only view content
      break;
  }

  return build();
}

// Helper function to check if user can perform an action
export function canUserDo(user: User | null, action: Action, subject: Subject, field?: string): boolean {
  const ability = defineAbilityFor(user);
  return ability.can(action, subject, field);
}
