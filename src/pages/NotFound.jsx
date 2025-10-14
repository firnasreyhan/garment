import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const [animatePage, setAnimatePage] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimatePage(true), 50);
  }, []);
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 transition-opacity duration-700 ${animatePage ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className={`text-8xl font-extrabold text-primaryColor mb-4 transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>404</h1>
      <h2 className={`text-2xl md:text-3xl font-bold text-secondaryColor mb-2 text-center transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Halaman Tidak Ditemukan</h2>
      <p className={`text-gray-600 text-center mb-8 max-w-md transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Maaf, halaman yang kamu cari tidak ditemukan atau kamu tidak memiliki akses ke halaman ini.</p>
      <button onClick={() => {
        navigate(-1)
      }} className={`bg-primaryColor hover:bg-secondaryColor text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-700 ${animatePage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        Kembali ke Halaman Sebelumnya
      </button>
    </div>
  );
};

export default NotFound; 