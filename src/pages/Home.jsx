import { useState, useEffect, useRef } from "react";
import primaryLogo from "../assets/Logo/primary_logo.png";
import primaryLogoOrange from "../assets/Logo/primary_logo_orange.png";
import secondaryLogo from "../assets/Logo/secondary_logo.png";
import secondaryLogoWhite from "../assets/Logo/secondary_logo_white.png";
import { CheckBadgeIcon, Cog6ToothIcon, UserIcon } from "@heroicons/react/24/outline";

import StickyNavbar from '../components/Navbar'
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import BackToTopButton from "../components/BackToTopButton";
import sliderImage1 from "../assets/Slider/img_slider1.png";

const homeSlides = [
  {
    id: 1,
    title: "We\nMake Idea\nYou Can Wear",
    description: "Lorem ipsum dolor sit amet consectetur. Non sed commodo sed fermentum aliquam vulputate volutpat tortor hac.",
    cta: "Shop Now",
    image: sliderImage1,
  },
  {
    id: 2,
    title: "Slide Kedua",
    description: "Deskripsi slide kedua",
    cta: "Get Started",
    image: sliderImage1,
  },
  {
    id: 3,
    title: "Slide Ketiga",
    description: "Deskripsi slide ketiga",
    cta: "Get Started",
    image: sliderImage1,
  },
];

// Komponen marquee logo perusahaan
function CompanyLogoMarquee({ logos, speed = 20 }) {
  // Duplikat logo untuk efek looping
  const marqueeLogos = [...logos, ...logos];
  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex items-center gap-16 animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {marqueeLogos.map((logo, idx) => (
          <img
            key={idx}
            src={logo.src}
            alt={logo.alt}
            className="h-10 md:h-12 object-contain select-none"
            draggable="false"
            role="listitem"
          />
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
}

// Hook untuk animasi fade-in/slide-in saat section muncul
function useInViewAnimation(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// Komponen animated counter
function AnimatedCounter({ to, duration = 3000, className = "", start = false }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (start && !hasAnimated.current) {
      let startVal = 0;
      hasAnimated.current = true;
      const step = Math.ceil(to / (duration / 16));
      const interval = setInterval(() => {
        startVal += step;
        if (startVal >= to) {
          setCount(to);
          clearInterval(interval);
        } else {
          setCount(startVal);
        }
      }, 16);
      return () => clearInterval(interval);
    } else if (!start) {
      setCount(0);
      hasAnimated.current = false;
    }
  }, [to, duration, start]);
  return <span className={className}>{count}</span>;
}

// Komponen judul section dengan typing effect (support React children)
function SectionTitle({ children, inView, className = '', speed = 80, ...props }) {
  // Helper untuk flatten children menjadi string dan array of nodes
  function flattenChildren(children) {
    let text = '';
    let nodes = [];
    function traverse(child) {
      if (typeof child === 'string') {
        text += child;
        nodes.push(child);
      } else if (Array.isArray(child)) {
        child.forEach(traverse);
      } else if (child && child.props && child.props.children) {
        traverse(child.props.children);
      } else if (child) {
        // For React elements without children (e.g. <span/>)
        nodes.push(child);
      }
    }
    traverse(children);
    return { text, nodes };
  }
  const { text } = flattenChildren(children);
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!inView) {
      setDisplayed('');
      return;
    }
    let i = 0;
    setDisplayed('');
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [inView, text, speed]);
  // Render: tampilkan children, tapi hanya sampai displayed.length
  function renderTyped(children, max) {
    let count = 0;
    function render(child) {
      if (typeof child === 'string') {
        const remain = max - count;
        if (remain <= 0) return null;
        const part = child.slice(0, remain);
        count += part.length;
        return part;
      } else if (Array.isArray(child)) {
        return child.map(render);
      } else if (child && child.props && child.props.children) {
        const inner = render(child.props.children);
        if (inner === null) return null;
        return { ...child, props: { ...child.props, children: inner } };
      } else if (child) {
        return child;
      }
      return null;
    }
    return render(children);
  }
  return (
    <h2 className={`font-bold ${className}`} {...props}>
      {renderTyped(children, displayed.length)}
      <span className="inline-block w-2 h-6 align-middle bg-primaryColor animate-pulse ml-1" style={{visibility: inView && displayed.length < text.length ? 'visible' : 'hidden'}} />
    </h2>
  );
}

export default function Home() {
  // Data kategori (urutan: Fashion, Medis, Casual, Non Medis)
  const categories = [
    {
      title: "Fashion",
      img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
      desc: "Lihat",
    },
    {
      title: "Produk Kebutuhan Medis",
      img: "https://plus.unsplash.com/premium_photo-1661578519713-6870aa63273f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      desc: "Lihat",
    },
    {
      title: "Casual",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      desc: "Lihat",
    },
    {
      title: "Non Medis",
      img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      desc: "Lihat",
    },
  ];

  // State untuk card aktif (default 1 = Medis)
  const [active, setActive] = useState(1);

  // Section refs for animation
  const [aboutRef, aboutInView] = useInViewAnimation();
  const [categoryRef, categoryInView] = useInViewAnimation();
  const [whyRef, whyInView] = useInViewAnimation();
  const [companiesRef, companiesInView] = useInViewAnimation();
  const [videoRef, videoInView] = useInViewAnimation();

  // Statistik bawah observer
  const [statRef, statInView] = useInViewAnimation(0.3);

  const aboutImages = [
    "https://plus.unsplash.com/premium_photo-1682142705901-28c534528ce8?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // factory 1
    "https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // factory 2
    "https://images.unsplash.com/photo-1493455198445-863243d88564?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // factory 3
    "https://images.unsplash.com/photo-1589793463357-5fb813435467?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // factory big
  ];

  return (
    <>
      <StickyNavbar />
      <main role="main" className="bg-gray-100">
        <Carousel slides={homeSlides} />
        
        {/* Section About (TrustedFactory) */}
        <section
          ref={aboutRef}
          aria-labelledby="about-heading"
          className={`relative bg-gray-100 p-4 md:p-10 max-w-7xl mx-auto mt-10 rounded-lg transition-all duration-1000 ${aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex border-r-[12px] border-primaryColor flex-col lg:flex-row gap-6 items-center lg:items-center">
            {/* Bagian gambar */}
            <div className="flex flex-row gap-4 md:gap-6 justify-center md:justify-start items-center">
              {/* 3 gambar kecil */}
              <div className="flex flex-col gap-3 md:gap-4 justify-center">
                {aboutImages.slice(0, 2).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`factory${i + 1}`}
                    className={`rounded-lg object-cover w-[140px] h-[84px] sm:w-[160px] sm:h-[96px] md:w-[250px] md:h-[120px]`}
                  />
                ))}
                <img
                  src={aboutImages[2]}
                  alt="factory3"
                  className="rounded-lg object-cover w-[140px] h-[84px] sm:w-[160px] sm:h-[96px] md:w-[250px] md:h-[180px]"
                />
              </div>
              {/* Gambar besar */}
              <div className="flex items-center justify-center">
                <img
                  src={aboutImages[3]}
                  alt="factory4"
                  className="rounded-lg object-cover w-[180px] h-[270px] sm:w-[200px] sm:h-[300px] md:w-[310px] md:h-[450px]"
                />
              </div>
            </div>
            {/* Kanan: Text dan Logo */}
            <article className="flex-1 flex flex-col justify-start pr-0 md:pr-8 mt-6 lg:mt-0">
              <div className="flex flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-base sm:text-lg text-gray-600 font-inter block">MOST TRUSTED</span>
                  <SectionTitle inView={aboutInView} id="about-heading" className="text-xl text-primaryColor sm:text-2xl md:text-3xl font-bold font-inter mt-2 mb-2">
                    GARMENT FACTORY
                  </SectionTitle>
                </div>
                <img src={secondaryLogo} alt="Zumar Garment" className="w-16 sm:w-20 md:w-24 h-auto ml-2 sm:ml-4" />
              </div>
              <p className="text-gray-600 font-montserrat text-xs sm:text-sm md:text-base leading-relaxed mt-2">
                Lorem ipsum dolor sit amet consectetur. Mauris volutpat posuere vel nunc. In aliquet vitae urna libero. Id feugiat libero at lacinia cras placerat. Turpis proin mattis donec in pellentesque malesuada commodo. At ante et tellus eu quisque. Cras ipsum diam aliquam justo. Aliquet faucibus consequat augue vestibulum cras. 
                <br /><br />
                Venenatis gravida tellus amet gravida sollicitudin consequat vel cras id. Pellentesque cursus tempus non arcu est. Egestas sagittis amet quam dictum id nullam sit. Nulla tristique urna gravida lectus. Est urna id tellus nisi. Placerat nunc molestie accumsan maecenas ultrices cursus amet tellus ut. Sagittis massa sit velit aliquam. Faucibus enim dignissim ligula scelerisque egestas.
              </p>
            </article>
          </div>
        </section>

        {/* Section Production Category (Expanding Card Horizontal) */}
        <section
          ref={categoryRef}
          aria-labelledby="category-heading"
          className={`bg-gray-100 max-w-7xl mx-auto mt-16 px-2 md:px-0 transition-all duration-1000 ${categoryInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Logo dan judul sejajar horizontal */}
          <header className="flex flex-row items-center justify-center gap-4 mb-4">
            <img src={primaryLogo} alt="Zumar Garment" className="h-12 md:h-16" />
            <SectionTitle inView={categoryInView} color="primaryColor" id="category-heading" className="text-2xl md:text-3xl font-montserrat font-semibold flex items-end gap-2 text-center">
              <span className="text-primaryColor">Production</span> <span className="text-secondaryColor">Category</span>
            </SectionTitle>
          </header>
          {/* Deskripsi */}
          <p className="text-center text-gray-500 font-montserrat font-light mb-6 text-sm md:text-base">
            Lorem ipsum dolor sit amet consectetur. Non sed commodo sed fermentum aliquam vulputate volutpat tortor hac.
          </p>
          {/* Expanding Card Grid */}
          <div className="flex gap-4 w-full max-w-5xl mx-auto mb-10" role="list" aria-label="Production categories">
            {categories.map((cat, i) => {
              const isActive = active === i;
              return (
                <article
                  key={i}
                  role="listitem"
                  onMouseEnter={() => setActive(i)}
                  className={`
                    group relative rounded-xl overflow-hidden shadow flex flex-col justify-end cursor-pointer
                    transition-all duration-500
                    ${isActive ? "flex-[2.5]" : "flex-1"}
                    min-h-[180px] md:min-h-[250px] bg-gray-200
                    hover:scale-105 hover:shadow-xl
                  `}
                  style={{
                    minWidth: 0,
                    maxWidth: isActive ? "420px" : "180px",
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
                    style={{
                      filter: isActive ? "brightness(1)" : "brightness(0.7)",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                  {/* Konten hanya muncul di card aktif */}
                  <div className={`relative z-10 transition-all duration-500 ${isActive ? "opacity-100 p-4" : "opacity-0 p-0"}`}>
                    {isActive && (
                      <>
                        <h3 className="text-white text-lg md:text-xl font-montserrat font-bold mb-2">{cat.title}</h3>
                        <button className="self-start px-6 py-2 bg-primaryColor text-white rounded-full font-semibold shadow hover:scale-110 hover:bg-secondaryColor transition-transform duration-300">
                          <span className="font-montserrat font-bold text-white text-base md:text-lg"> {cat.desc} </span>
                        </button>
                      </>
                    )}
                  </div>
                  {/* Overlay untuk efek gelap hanya pada card inactive */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 pointer-events-none ${!isActive ? "bg-black/40" : "bg-black/0"}`}
                  />
                </article>
              );
            })}
          </div>
        </section>

        {/* Section Kenapa Zumar (Revisi Final) */}
        <section
          ref={whyRef}
          aria-labelledby="why-zumar-heading"
          className={`w-full bg-[linear-gradient(to_right,_#245156_28%,_#f3f4f6_28%)] mt-16 pt-16 pb-0 transition-all duration-1000 ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4 md:px-0 items-start">
            <div className="relative h-[483px]">
              <img
                src="https://plus.unsplash.com/premium_photo-1676586308760-e6491557432f?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Kenapa Zumar"
                className="absolute rounded-2xl w-[370px] h-[462.5px] object-cover shadow-lg"
                style={{ top: '20px', left: '40px' }}
              />
            </div>
            <article className="flex flex-col justify-end gap-6 font-montserrat">
              <SectionTitle inView={whyInView} id="why-zumar-heading" className="text-2xl md:text-3xl font-bold mb-2 pl-[1.5rem]">
                <span className="text-primaryColor">Kenapa </span> <span className="text-secondaryColor">Zumar?</span>
              </SectionTitle>
              <div className="flex flex-col gap-0">
                {/* Item 1 */}
                <div className="flex items-center gap-4">
                  <UserIcon className={`w-6 md:w-8 h-6 md:h-8 text-primaryColor ${whyInView ? 'animate-bounce' : ''}`} aria-hidden="true" />
                  <h3 className="font-bold text-primaryColor text-lg md:text-xl">Jahit</h3>
                </div>
                <p className="text-gray-500 text-sm md:text-base pl-12">
                  Lorem ipsum dolor sit amet consectetur. Tellus diam dignissim imperdiet imperdiet. Phasellus massa ut morbi diam augue. Rhoncus porttitor faucibus arcu gravida cum augue.
                </p>

                {/* Item 2 */}
                <div className="flex items-center gap-4">
                  <Cog6ToothIcon className={`w-6 md:w-8 h-6 md:h-8 text-primaryColor ${whyInView ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <h3 className="font-bold text-primaryColor text-lg md:text-xl">Bordir</h3>
                </div>
                <p className="text-gray-500 text-sm md:text-base pl-12">
                  Lorem ipsum dolor sit amet consectetur. Tellus diam dignissim imperdiet imperdiet. Phasellus massa ut morbi diam augue. Rhoncus porttitor faucibus arcu gravida cum augue. Mauris scelerisque magna feugiat orci orci vestibulum vel nunc aliquam.
                </p>

                {/* Item 3 */}
                <div className="flex items-center gap-4">
                  <CheckBadgeIcon className={`w-6 md:w-8 h-6 md:h-8 text-primaryColor ${whyInView ? 'animate-pulse' : ''}`} aria-hidden="true" />
                  <h3 className="font-bold text-primaryColor text-lg md:text-xl">Inovasi</h3>
                </div>
                <p className="text-gray-500 text-sm md:text-base pl-12">
                  Lorem ipsum dolor sit amet consectetur. Tellus diam dignissim imperdiet imperdiet. Phasellus massa ut morbi diam augue
                </p>
              </div>
            </article>
            <div className="hidden md:flex justify-center items-start">
              <div className="bg-secondaryColor rounded-bl-[80px] w-[200px] h-[200px] flex items-center justify-center">
                <img src={secondaryLogoWhite} alt="Zumar Logo" className="w-28 h-28 object-contain" />
              </div>
            </div>
          </div>
          {/* Statistik bawah */}
          <div className="relative mt-12" ref={statRef}>
            {/* Background gambar pabrik */}
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
              alt="Pabrik"
              className="w-full h-[160px] object-cover"
            />
            {/* Overlay hijau tua */}
            <div className="absolute inset-0 bg-primaryColor/80" />
            {/* Statistik */}
            <div className="absolute font-inter inset-0 flex flex-row items-center justify-center gap-8 md:gap-44" role="list" aria-label="Company statistics">
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={2017} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">Founded</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={134} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">Clients</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={729} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">Projects done</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={103} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">5-Stars Review</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Big Companies With Us */}
        <section
          ref={companiesRef}
          aria-labelledby="companies-heading"
          className={`bg-gray-100 py-16 transition-all duration-1000 ${companiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="max-w-5xl mx-auto px-4 text-center font-montserrat">
            <SectionTitle inView={companiesInView} color="primaryColor" id="companies-heading" className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-primaryColor">Big Companies </span> <span className="text-secondaryColor">With Us</span>
            </SectionTitle>
            <img src={primaryLogoOrange} alt="Zumar Garment" className="w-auto h-11 mx-auto mb-6" />
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-12">
              Lorem ipsum dolor sit amet consectetur. Mauris volutpat posuere vel nunc. In aliquet vitae urna libero. Id feugiat libero at lacinia cras placerat. Turpis proin mattis donec in pellentesque malesuada commodo. At ante et tellus eu quisque. Cras ipsum diam aliquam justo. Aliquet faucibus consequat augue vestibulum cras. Venenatis gravida tellus amet gravida sollicitudin consequat vel cras id. Pellentesque cursus tempus non arcu est.
            </p>
            <CompanyLogoMarquee
              logos={[
                { src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", alt: "Microsoft" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png", alt: "Facebook" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", alt: "Netflix" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", alt: "Apple" },
              ]}
              speed={30}
            />
          </div>
        </section>

        {/* Section Video Production */}
        <section
          ref={videoRef}
          aria-labelledby="video-heading"
          className={`bg-gray-100 py-16 transition-all duration-1000 ${videoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="relative w-full aspect-video md:aspect-[16/7] bg-gray-300 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/OblL026SvD4"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="md:w-1/2 font-montserrat">
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  <span className="text-primaryColor">ZUMAR </span> <span className="text-secondaryColor">GARMENT</span>
                </p>
                <h2 id="video-heading" className="text-2xl font-bold text-primaryColor font-montserrat leading-tight">
                  Lorem ipsum dolor sit amet consectetur.
                </h2>
              </div>
              <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0 font-montserrat">
                <p className="text-primaryColor text-sm md:text-base leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur. Mi convallis in vivamus in mattis congue nulla.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTopButton />
    </>
  );
}
