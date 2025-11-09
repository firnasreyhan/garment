import React from 'react';
// import { jwtDecode } from 'jwt-decode';
// import NotFound from '../pages/NotFound';

const AdminRoute = ({ children }) => {
  // const token = localStorage.getItem('token');
  // if (!token) return <NotFound />;

  // try {
  //   const decoded = jwtDecode(token);
  //   if (decoded.role_category === 'ADMIN' || decoded.role_category === 'SUPER ADMIN') {
  //     return children;
  //   }
  //   return <NotFound />;
  // } catch {
  //   return <NotFound />;
  // }
  // SEMENTARA: proteksi dinonaktifkan agar bisa akses dashboard admin
  return children;
};

export default AdminRoute; 