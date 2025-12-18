import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getCurrentUserRole, isAdmin, hasAnyPermission } from "../api/auth";
import { getToken } from "../utils/tokenManager";

export default function PermissionGuard({
  roles = [],
  permissions = [],
  requireAdmin = false,
  fallbackPath = "/NotFound"
}) {
  const navigate = useNavigate();
  const token = getToken();
  const userRole = getCurrentUserRole();

  const rolesCheck = JSON.stringify(roles);
  const permissionsCheck = JSON.stringify(permissions);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in");
      return;
    }

    if (requireAdmin && !isAdmin()) {
      navigate("/");
      return;
    }

    const passedRole = roles.length === 0 || roles.includes(userRole);
    const passedPermission = permissions.length === 0 || hasAnyPermission(permissions);

    if (!passedRole || !passedPermission) {
      console.warn("PermissionGuard: Access Denied", { expectedRoles: roles, expectedPerms: permissions, userRole });
      navigate(fallbackPath);
    }

  }, [navigate, token, userRole, rolesCheck, permissionsCheck, requireAdmin, fallbackPath]);

  if (!token) return null;
  if (requireAdmin && !isAdmin()) return null;

  const passedRole = roles.length === 0 || roles.includes(userRole);
  const passedPermission = permissions.length === 0 || hasAnyPermission(permissions);

  if (!passedRole || !passedPermission) {
    return null;
  }

  return <Outlet />;
}