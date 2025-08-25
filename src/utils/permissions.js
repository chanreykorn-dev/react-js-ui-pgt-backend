export const hasPermission = (user, permissionName) => {
  return user?.permissions?.includes(permissionName);
};
