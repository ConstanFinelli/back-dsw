export const Roles = {
  ADMIN: "admin",
  OWNER: "business_owner",
  USER: "user",
} as const;

export type Role = typeof Roles[keyof typeof Roles];