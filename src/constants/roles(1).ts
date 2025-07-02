export const Role = {
  ADMIN: "admin",
  STAFF: "staff",
  MEMBER: "member",
  CUSTOMER: "customer",
}
export type RoleType = (typeof Role)[keyof typeof Role];