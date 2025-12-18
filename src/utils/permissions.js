export const PERMISSION_GROUPS = {
    admins: {
        label: 'Admin Access',
        description: 'Manage Admin Access',
        permissions: [
            { id: 'admin.access', label: 'Access Admin', description: 'Can access admin' },
        ]
    },
    orders: {
        label: 'Orders Management',
        description: 'Manage customer orders and order workflow',
        permissions: [
            { id: 'orders.view', label: 'View Orders', description: 'Can view order list and details' },
            { id: 'orders.create', label: 'Create Orders', description: 'Can create new orders' },
            { id: 'orders.approve', label: 'Approve Orders', description: 'Can approve orders' },
            { id: 'orders.reject', label: 'Reject Orders', description: 'Can reject orders' },
            { id: 'orders.payment', label: 'Manage Payments', description: 'Can update payment status' },
            { id: 'orders.rab', label: 'Manage RAB', description: 'Can manage order RAB (budget planning)' }
        ]
    },
    progress: {
        label: 'Production Progress',
        description: 'Track and manage production progress',
        permissions: [
            { id: 'progress.view', label: 'View Progress', description: 'Can view production progress' },
            { id: 'progress.create', label: 'Create Progress', description: 'Can create progress stages' },
            { id: 'progress.delete', label: 'Delete Progress', description: 'Can create progress stages' },
            { id: 'progress.detail.create', label: 'Create Progress Detail', description: 'Can create progress detail' },
            { id: 'progress.detail.edit', label: 'Edit Progress Detail', description: 'Can update progress information' },
            { id: 'progress.detail.delete', label: 'Delete Progress Detail', description: 'Can delete progress stages' },
            { id: 'progress.lock', label: 'Lock Progress', description: 'Can lock progress stages' },
            { id: 'progress.unlock', label: 'Unlock Progress', description: 'Can unlock progress stages' }
        ]
    },
    catalogue: {
        label: 'Catalogue Management',
        description: 'Manage product catalogue (categories, subcategories, products)',
        permissions: [
            // Category
            { id: 'catalogue.category.view', label: 'View Categories', description: 'Can view product categories' },
            { id: 'catalogue.category.create', label: 'Create Categories', description: 'Can create new categories' },
            { id: 'catalogue.category.edit', label: 'Edit Categories', description: 'Can edit categories' },
            { id: 'catalogue.category.delete', label: 'Delete Categories', description: 'Can delete categories' },

            // Subcategory
            { id: 'catalogue.subcategory.view', label: 'View Subcategories', description: 'Can view subcategories' },
            { id: 'catalogue.subcategory.create', label: 'Create Subcategories', description: 'Can create subcategories' },
            { id: 'catalogue.subcategory.edit', label: 'Edit Subcategories', description: 'Can edit subcategories' },
            { id: 'catalogue.subcategory.delete', label: 'Delete Subcategories', description: 'Can delete subcategories' },

            // Product
            { id: 'catalogue.product.view', label: 'View Products', description: 'Can view product catalog' },
            { id: 'catalogue.product.create', label: 'Create Products', description: 'Can create new products' },
            { id: 'catalogue.product.edit', label: 'Edit Products', description: 'Can edit products' },
            { id: 'catalogue.product.delete', label: 'Delete Products', description: 'Can delete products' },
        ]
    },
    inventory: {
        label: 'Inventory Management',
        description: 'Manage inventory items, warehouses, and stock',
        permissions: [
            // Items
            { id: 'inventory.items.view', label: 'View Inventory', description: 'Can view inventory items' },
            { id: 'inventory.items.create', label: 'Add Inventory', description: 'Can add new inventory items' },
            { id: 'inventory.items.edit', label: 'Edit Inventory', description: 'Can edit inventory items' },
            { id: 'inventory.items.delete', label: 'Delete Inventory', description: 'Can delete inventory items' },

            // Category
            { id: 'inventory.category.view', label: 'View Categories', description: 'Can view inventory categories' },
            { id: 'inventory.category.create', label: 'Create Categories', description: 'Can create inventory categories' },
            { id: 'inventory.category.edit', label: 'Edit Categories', description: 'Can edit inventory categories' },
            { id: 'inventory.category.delete', label: 'Delete Categories', description: 'Can delete inventory categories' },

            // Subcategory
            { id: 'inventory.subcategory.view', label: 'View Subcategories', description: 'Can view inventory subcategories' },
            { id: 'inventory.subcategory.create', label: 'Create Subcategories', description: 'Can create inventory subcategories' },
            { id: 'inventory.subcategory.edit', label: 'Edit Subcategories', description: 'Can edit inventory subcategories' },
            { id: 'inventory.subcategory.delete', label: 'Delete Subcategories', description: 'Can delete inventory subcategories' },

            // Warehouse
            { id: 'inventory.warehouse.view', label: 'View Warehouses', description: 'Can view warehouses' },
            { id: 'inventory.warehouse.create', label: 'Create Warehouses', description: 'Can create new warehouses' },
            { id: 'inventory.warehouse.edit', label: 'Edit Warehouses', description: 'Can edit warehouses' },
            { id: 'inventory.warehouse.delete', label: 'Delete Warehouses', description: 'Can delete warehouses' },

            // Relocation
            { id: 'inventory.relocation.view', label: 'View Relocations', description: 'Can view inventory relocations' },
            { id: 'inventory.relocation.create', label: 'Create Relocation', description: 'Can create relocation requests' },
            { id: 'inventory.relocation.approve', label: 'Approve Relocation', description: 'Can approve relocation requests' },
            { id: 'inventory.relocation.reject', label: 'Reject Relocation', description: 'Can reject relocation requests' },
        ]
    },
    rab: {
        label: 'RAB/RABP Management',
        description: 'Manage budget planning (Rencana Anggaran Biaya)',
        permissions: [
            { id: 'rab.view', label: 'View RAB', description: 'Can view budget plans' },
            { id: 'rab.edit', label: 'Edit RAB', description: 'Can edit budget plans' },
            { id: 'rab.lock', label: 'Lock RAB', description: 'Can lock budget plans' },
            { id: 'rab.unlock', label: 'Unlock RAB', description: 'Can unlock budget plans' },
            { id: 'rab.template.view', label: 'View Templates', description: 'Can view RAB templates' },
            { id: 'rab.template.create', label: 'Create Templates', description: 'Can create RAB templates' },
            { id: 'rab.template.edit', label: 'Edit Templates', description: 'Can edit RAB templates' },
            { id: 'rab.template.delete', label: 'Delete Templates', description: 'Can delete RAB templates' },
            { id: 'rab.simulation.view', label: 'View Simulations', description: 'Can view budget simulations' },
            { id: 'rab.simulation.create', label: 'Create Simulations', description: 'Can create budget simulations' },
            { id: 'rab.simulation.edit', label: 'Edit Simulations', description: 'Can edit budget simulations' },
            { id: 'rab.simulation.delete', label: 'Delete Simulations', description: 'Can delete budget simulations' }
        ]
    },
    users: {
        label: 'User Management',
        description: 'Manage system users and their accounts',
        permissions: [
            { id: 'users.view', label: 'View Users', description: 'Can view user list and profiles' },
            { id: 'users.create', label: 'Create Users', description: 'Can create new user accounts' },
            { id: 'users.edit', label: 'Edit Users', description: 'Can edit user information' },
            { id: 'users.delete', label: 'Delete Users', description: 'Can delete user accounts' }
        ]
    },
    roles: {
        label: 'Role Management',
        description: 'Manage roles and permissions (OWNER only)',
        permissions: [
            { id: 'roles.view', label: 'View Roles', description: 'Can view role list' },
            { id: 'roles.create', label: 'Create Roles', description: 'Can create new roles' },
            { id: 'roles.edit', label: 'Edit Roles', description: 'Can edit role permissions' },
            { id: 'roles.delete', label: 'Delete Roles', description: 'Can delete roles' }
        ]
    },
    reports: {
        label: 'Reports & Analytics',
        description: 'Access various reports and analytics',
        permissions: [
            { id: 'reports.dashboard', label: 'Dashboard Report', description: 'Can view and print dashboard reports' },
            { id: 'reports.inventory', label: 'Inventory Report', description: 'Can view and print inventory reports' },
            { id: 'reports.catalogue', label: 'Catalogue Report', description: 'Can view and print catalogue reports' },
            { id: 'reports.orders', label: 'Orders Report', description: 'Can view and print order reports' },
            { id: 'reports.rabp', label: 'RABP Report', description: 'Can view and print RABP reports' },
            { id: 'reports.progress', label: 'Progress Report', description: 'Can view and print progress reports' },
            { id: 'reports.transfer', label: 'Transfer Report', description: 'Can view and print inventory transfer reports' },
        ]
    }
};

export const getAllPermissionIds = () => {
    const allPermissions = [];

    Object.values(PERMISSION_GROUPS).forEach(group => {
        group.permissions.forEach(perm => {
            allPermissions.push(perm.id);
        });
    });

    return allPermissions;
};

export const getPermissionGroup = (groupKey) => {
    return PERMISSION_GROUPS[groupKey] || null;
};

export const findPermissionById = (permissionId) => {
    for (const group of Object.values(PERMISSION_GROUPS)) {
        const found = group.permissions.find(p => p.id === permissionId);
        if (found) return found;
    }
    return null;
};

export const getPermissionsCount = () => {
    return getAllPermissionIds().length;
};

export default PERMISSION_GROUPS;