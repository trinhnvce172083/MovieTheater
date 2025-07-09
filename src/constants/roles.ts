export const Role = {
  ADMIN: "admin",
  MEMBER: "member",
  CUSTOMER: "customer",
}
export type RoleType = (typeof Role)[keyof typeof Role];