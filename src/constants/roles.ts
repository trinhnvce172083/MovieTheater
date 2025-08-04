export const Role = {
  ADMIN: "admin",
  MEMBER: "member",
  EMPLOYEE: "employee",
  CUSTOMER: "customer",
}
export type RoleType = (typeof Role)[keyof typeof Role];