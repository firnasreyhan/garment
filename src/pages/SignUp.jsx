import React, { useState } from 'react';
import secondaryLogoWhite from '../assets/Logo/secondary_logo_white.png';
import StickyNavbar from '../components/Navbar';
import LoginPerson from '../assets/Image/Login_person.png';
import { signUp } from '../api/auth';
import { getToken } from '../utils/tokenManager';

const SignUp = () => {
  const [form, setForm] = useState({
    uName: '',
    uAddress: '',
    uEmail: '',
    uPhone: '',
    uPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animatePage, setAnimatePage] = useState(false);

  React.useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);

  if (getToken()) {
    window.location.href = '/';
    return null;
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signUp({ ...form });
      if (res.data && res.data.status === 'success') {
        window.location.href = '/sign-in';
      }
    } catch {
      setError('Register gagal. Pastikan data sudah benar dan email belum terdaftar.');
    }
    setLoading(false);
  };

  return (
    <>
    <StickyNavbar />
    <div className="relative min-h-screen bg-primaryColor flex flex-col justify-center p-4 font-montserrat overflow-x-hidden">
      {/* SVG Polygon Kanan Bawah */}
      <div
        className="hidden md:block fixed right-0 bottom-0 z-0 pointer-events-none"
        style={{ width: 'min(18vw, 180px)', height: 'min(18vw, 180px)' }}
      >
        <svg viewBox="0 0 600 600" className="w-full h-full">
          {/* Segitiga orange */}
          <polygon points="600,0 600,600 0,600" fill="#E26C02" />
        </svg>
      </div>
      <div className={`relative z-10 flex flex-col lg:flex-row w-full max-w-6xl overflow-hidden mx-auto transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left Section (Marketing) */}
        <div className="lg:w-3/5 bg-primaryColor p-8 flex flex-col justify-between items-center text-white text-center">
          {/* Logo and Text Wrapper */}
          <div className="flex items-center w-full">
            <img src={secondaryLogoWhite} alt="Zumar Apparels Logo" className="h-40 mr-4" />
            <div className="flex flex-col text-left">
              <h2 className="text-4xl font-bold mb-1">Sign Up To</h2>
              <p className="text-2xl font-light mb-2">Lorem Ipsum is simply</p>
              <p className="text-sm max-w-xs">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</p>
            </div>
          </div>
          {/* Image */}
          <div className="mt-auto w-full flex items-center justify-center">
            <img 
              src={LoginPerson} 
              alt="Woman with shopping bags" 
              className="w-auto h-auto" 
            />
         </div>
        </div>

        {/* Right Section (Registration Form) */}
        <div className={`lg:w-2/5 px-6 py-4 bg-gray-100 rounded-xl shadow-lg flex flex-col justify-center transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-semibold text-primaryColor">Daftar</h2>
            <div className="text-sm">
              <span className="text-gray-600">Sudah Punya Akun? </span>
              <a href="/sign-in" className="text-secondaryColor font-medium">Masuk</a>
            </div>
          </div>

          <form className="space-y-4 w-full max-w-md mx-auto" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="uEmail" className="block text-gray-700 text-sm font-medium mb-1">Alamat email <span className="text-red-500 ml-1">*</span></label>
              <input type="email" id="uEmail" name="uEmail" placeholder="Alamat email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uEmail} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="uName" className="block text-gray-700 text-sm font-medium mb-1">User name <span className="text-red-500 ml-1">*</span></label>
                <input type="text" id="uName" name="uName" placeholder="User name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uName} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="uPhone" className="block text-gray-700 text-sm font-medium mb-1">Nomor telepon <span className="text-red-500 ml-1">*</span></label>
                <input type="text" id="uPhone" name="uPhone" placeholder="Nomor telepon" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uPhone} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label htmlFor="uAddress" className="block text-gray-700 text-sm font-medium mb-1">Alamat pengiriman <span className="text-red-500 ml-1">*</span></label>
              <input type="text" id="uAddress" name="uAddress" placeholder="Alamat" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uAddress} onChange={handleChange} required />
            </div>

            <div>
              <label htmlFor="uPassword" className="block text-gray-700 text-sm font-medium mb-1">Password <span className="text-red-500 ml-1">*</span></label>
              <input type="password" id="uPassword" name="uPassword" placeholder="Password" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryColor" value={form.uPassword} onChange={handleChange} required />
            </div>

            <button type="submit" className="w-full bg-primaryColor text-white py-3 rounded-md font-semibold hover:bg-[#2a5560] transition-colors" disabled={loading}>
              {loading ? 'Loading...' : 'Sign up'}
            </button>
            {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default SignUp;
