/**
 * Define possible actions that can be performed in the cinema application
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Allows all operations
  BOOK = 'book',     // Specific to booking tickets - MEMBERS and above only
  REFUND = 'refund', // Specific to refunding tickets
  APPROVE = 'approve', // Specific to approving operations
  VIEW = 'view',     // Basic viewing permission
}

/**
 * Define the subjects (resources) that actions can be performed on
 */
export enum Subject {
  MOVIE = 'Movie',
  BOOKING = 'Booking',
  USER = 'User',
  PROMOTION = 'Promotion',
  ROOM = 'Room',
  SHOWTIME = 'Showtime',
  TICKET = 'Ticket',
  PAYMENT = 'Payment',
  REVIEW = 'Review',
  REFUND = 'Refund',  // Added Refund subject
  ALL = 'all',
}
