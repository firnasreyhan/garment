import React, { useState, useEffect } from 'react';
import secondaryLogo from '../assets/Logo/secondary_logo.png';
import StickyNavbar from '../components/Navbar';
import LoginPerson from '../assets/Image/Login_person.png';
import { signIn, getCurrentUserRole } from '../api/auth';
import { saveToken, getToken } from '../utils/tokenManager';

const SignIn = () => {
  const [form, setForm] = useState({
    uEmail: '',
    uPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animatePage, setAnimatePage] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);

    // 🔹 Cek apakah user sudah login dari token
    const token = getToken();
    if (token) {
      try {
        const role = getCurrentUserRole();

        if (role === 'ADMIN' || role === 'OWNER' || role === 'TAYLOR' || role === 'STAFF') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Token decode error:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Attempting login with:', form.uEmail);
      const res = await signIn(form.uEmail, form.uPassword);
      console.log('Full login response:', res);

      if (res.data && res.data.data && res.data.data.token) {
        const token = res.data.data.token;
        console.log('Token found:', token);

        // 🔹 Simpan token
        saveToken(token);
        console.log('Token saved successfully');

        // 🔹 Redirect sesuai role (langsung dari JWT token)
        const role = getCurrentUserRole();
        console.log('User role from JWT:', role);

        if (role === 'ADMIN' || role === 'OWNER' || role === 'TAYLOR' || role === 'STAFF') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        console.error('Token not found in response:', res.data);
        setError('Login gagal. Token tidak ditemukan.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login gagal. Email atau password salah.');
    }
    setLoading(false);
  };

  return (
    <>
      <StickyNavbar />
      <div className="relative min-h-screen bg-gray-100 flex flex-col justify-center p-4 font-montserrat overflow-x-hidden">
        {/* SVG Polygon Kanan Bawah */}
        <div
          className="hidden md:block fixed right-0 bottom-0 z-0 pointer-events-none"
          style={{ width: 'min(25vw, 340px)', height: 'min(25vw, 340px)' }}
        >
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <polygon points="600,0 600,600 0,600" fill="#245156" />
            <polygon points="600,0 600,400 400,600 600,600" fill="#E26C02" />
          </svg>
        </div>

        <main
          className={`relative z-10 w-full flex flex-col lg:flex-row max-w-6xl overflow-hidden items-start mx-auto transition-opacity duration-700 ${
            animatePage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Left Section */}
          <div className="lg:w-3/5 bg-gray-100 p-8 flex flex-col justify-between items-center text-primaryColor text-center">
            <div className="flex items-center w-full">
              <img src={secondaryLogo} alt="Logo" className="h-40 mr-4" />
              <div className="flex flex-col text-left">
                <h2 className="text-4xl font-bold mb-1">Sign In To</h2>
                <p className="text-2xl font-light mb-2">Lorem Ipsum is simply</p>
                <p className="text-sm max-w-xs">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </p>
              </div>
            </div>
            <div className="mt-auto w-full flex items-center justify-center">
              <img src={LoginPerson} alt="Login" className="w-auto h-auto" />
            </div>
          </div>

          {/* Right Section */}
          <div
            className={`lg:w-2/5 px-6 py-4 bg-gray-300 rounded-xl shadow-lg flex flex-col justify-start transition-all duration-700 ${
              animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-semibold text-primaryColor">Masuk</h2>
              <div className="text-sm">
                <span className="text-gray-600">Belum Punya Akun? </span>
                <a href="/sign-up" className="text-secondaryColor font-medium">
                  Daftar
                </a>
              </div>
            </div>

            <form className="space-y-4 w-full max-w-md mx-auto" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="uEmail" className="block text-gray-700 text-sm font-medium mb-1">
                  Alamat email
                </label>
                <input
                  type="email"
                  id="uEmail"
                  placeholder="Alamat email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                  value={form.uEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="uPassword" className="block text-gray-700 text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="uPassword"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                  value={form.uPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primaryColor text-white py-3 rounded-md font-semibold hover:bg-[#2a5560] transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
              {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default SignIn;

// import React, { useState } from 'react';
// import secondaryLogo from '../assets/Logo/secondary_logo.png';
// import StickyNavbar from '../components/Navbar';
// import LoginPerson from '../assets/Image/Login_person.png';
// import { signIn } from '../api/auth';
// import { jwtDecode } from 'jwt-decode';
// import { saveToken, getToken } from '../utils/tokenManager';

// const SignIn = () => {
//   const [form, setForm] = useState({
//     uEmail: '',
//     uPassword: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [animatePage, setAnimatePage] = useState(false);

//   React.useEffect(() => {
//     setTimeout(() => setAnimatePage(true), 50);
//   }, []);

//   // Check if user is already logged in using token manager
//   if (getToken()) {
//     window.location.href = '/';
//     return null;
//   }

//   const handleChange = e => {
//     setForm({ ...form, [e.target.id]: e.target.value });
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       console.log('Attempting login with:', form.uEmail);
//       const res = await signIn(form.uEmail, form.uPassword);
//       console.log('Full login response:', res);
//       console.log('Response data:', res.data);
      
//       // Ambil token dari res.data.data.token
//       if (res.data && res.data.data && res.data.data.token) {
//         console.log('Token found:', res.data.data.token);
        
//         // Simpan token menggunakan token manager (multiple storage + URL params)
//         const tokenSaved = saveToken(res.data.data.token);
        
//         // Log token storage
//         console.log('Token saved successfully:', tokenSaved);

        
//         // Decode token untuk mendapatkan informasi user
//         const decoded = jwtDecode(res.data.data.token);
//         console.log('Decoded token:', decoded);

//         // Simpan data user ke localStorage
//         const userData = {
//           name: decoded.u_name || decoded.name || 'Admin',
//           email: decoded.u_email || decoded.email || form.uEmail,
//           role: decoded.u_role || decoded.role_category || 'USER',
//           id: decoded.u_id || decoded.id
//         };
//         console.log('User data to save:', userData);
//         localStorage.setItem('user', JSON.stringify(userData));
        
//         console.log('User data saved:', userData);
//         console.log('Stored user data from localStorage:', localStorage.getItem('user'));
        
//         if (userData.role === 'ADMIN' || userData.role === 'OWNER') {
//           console.log('Redirecting to admin dashboard');
//           window.location.href = '/admin/dashboard';
//         } else {
//           console.log('Redirecting to home page');
//           window.location.href = '/';
//         }
//       } else {
//         console.error('Token not found in response structure:', res.data);
//         setError('Login gagal. Token tidak ditemukan.');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       console.error('Error response:', err.response);
//       setError('Login gagal. Email atau password salah.');
//     }
//     setLoading(false);
//   };

//   return (
//     <>
//     <StickyNavbar />
//     <div className="relative min-h-screen bg-gray-100 flex flex-col justify-center p-4 font-montserrat overflow-x-hidden">
//       {/* SVG Polygon Kanan Bawah */}
//       <div
//         className="hidden md:block fixed right-0 bottom-0 z-0 pointer-events-none"
//         style={{ width: 'min(25vw, 340px)', height: 'min(25vw, 340px)' }}
//       >
//         <svg viewBox="0 0 600 600" className="w-full h-full">
//           {/* Segitiga hijau */}
//           <polygon points="600,0 600,600 0,600" fill="#245156" />
//           {/* Trapesium orange di atas segitiga hijau */}
//           <polygon points="600,0 600,400 400,600 600,600" fill="#E26C02" />
//         </svg>
//       </div>
//       <main className={`relative z-10 w-full flex flex-col lg:flex-row max-w-6xl overflow-hidden items-start mx-auto transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
//         {/* Left Section (Marketing) */}
//         <div className="lg:w-3/5 bg-gray-100 p-8 flex flex-col justify-between items-center text-primaryColor text-center">
//           {/* Logo and Text Wrapper */}
//           <div className="flex items-center w-full">
//             <img src={secondaryLogo} alt="Zumar Apparels Logo" className="h-40 mr-4" />
//             <div className="flex flex-col text-left">
//               <h2 className="text-4xl font-bold mb-1">Sign In To</h2>
//               <p className="text-2xl font-light mb-2">Lorem Ipsum is simply</p>
//               <p className="text-sm max-w-xs">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</p>
//             </div>
//           </div>
//           {/* Image */}
//           <div className="mt-auto w-full flex items-center justify-center">
//             <img 
//               src={LoginPerson} 
//               alt="Woman with shopping bags" 
//               className="w-auto h-auto" 
//             />
//          </div>
//         </div>

//         {/* Right Section (Login Form) */}
//         <div className={`lg:w-2/5 px-6 py-4 bg-gray-300 rounded-xl shadow-lg flex flex-col justify-start transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-4xl font-semibold text-primaryColor">Masuk</h2>
//             <div className="text-sm">
//               <span className="text-gray-600">Belum Punya Akun? </span>
//               <a href="/sign-up" className="text-secondaryColor font-medium">Daftar</a>
//             </div>
//           </div>

//           <form className="space-y-4 w-full max-w-md mx-auto" onSubmit={handleSubmit}>
//             <div>
//               <label htmlFor="uEmail" className="block text-gray-700 text-sm font-medium mb-1">Alamat email</label>
//               <input type="email" id="uEmail" placeholder="Alamat email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uEmail} onChange={handleChange} required />
//             </div>

//             <div>
//               <label htmlFor="uPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
//               <input type="password" id="uPassword" placeholder="Password" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uPassword} onChange={handleChange} required />
//             </div>

//             <button type="submit" className="w-full bg-primaryColor text-white py-3 rounded-md font-semibold hover:bg-[#2a5560] transition-colors" disabled={loading}>
//               {loading ? 'Loading...' : 'Sign In'}
//             </button>
//             {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
//           </form>
//         </div>
//       </main>
//     </div>
//     </>
//   );
// };

// export default SignIn;
