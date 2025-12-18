import api from '../axios';

export const getAllRoles = (params) => {
    return api.get('/api/role', { params });
};

export const getRoleDetail = (rId) => {
    return api.get('/api/role/detail', { params: { rId } });
};

export const getRolesForSelection = () => {
    return api.get('/api/role/user');
};

export const createRole = (roleData) => {
    return api.post('/api/role', roleData);
};

export const updateRole = (roleData) => {
    return api.put('/api/role', roleData);
};

export const deleteRole = (rId) => {
    return api.delete('/api/role', { params: { rId } });
};