import { useMemo } from 'react';
import { hasPermission, getUserPermissions } from '../api/auth';
export const usePermission = (permission) => {
    return useMemo(() => hasPermission(permission), [permission]);
};
export const usePermissions = () => {
    const permissions = useMemo(() => getUserPermissions(), []);

    return useMemo(() => ({
        all: permissions,
        can: (perm) => hasPermission(perm),
        canAny: (perms) => perms.some(p => hasPermission(p)),
        canAll: (perms) => perms.every(p => hasPermission(p))
    }), [permissions]);
};