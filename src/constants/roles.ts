export const Role = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER", 
  EMPLOYEE: "EMPLOYEE",
  CUSTOMER: "CUSTOMER",
}
export type RoleType = (typeof Role)[keyof typeof Role];