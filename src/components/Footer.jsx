import primaryLogo from "../assets/Logo/primary_logo.png";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { HeartIcon } from '@heroicons/react/24/solid';

// Data constants for better maintainability
const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
];

const FOOTER_SECTIONS = [
  {
    title: "Company Info",
    links: [
      { text: "About Us", href: "#" },
      { text: "Carrier", href: "#" },
      { text: "We are hiring", href: "#" },
      { text: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { text: "About Us", href: "#" },
      { text: "Carrier", href: "#" },
      { text: "We are hiring", href: "#" },
      { text: "Blog", href: "#" },
    ],
  },
  {
    title: "Features",
    links: [
      { text: "Business Marketing", href: "#" },
      { text: "User Analytic", href: "#" },
      { text: "Live Chat", href: "#" },
      { text: "Unlimited Support", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { text: "IOS & Android", href: "#" },
      { text: "Watch a Demo", href: "#" },
      { text: "Customers", href: "#" },
      { text: "API", href: "#" },
    ],
  },
];

export default function Footer() {
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Add subscription logic here
    console.log("Subscribe functionality");
  };

  return (
    <footer className="bg-gray-200" role="contentinfo">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top Section: Logo and Social Media */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-gray-200">
          <img 
            src={primaryLogo} 
            alt="Zumar Garment" 
            className="h-12 mb-4 md:mb-0 mt-8" 
            loading="lazy"
          />
          <nav aria-label="Social media links">
            <div className="flex space-x-6">
              {SOCIAL_LINKS.map((socialLink) => {
                const IconComponent = socialLink.icon;
                return (
                  <a
                    key={socialLink.label}
                    href={socialLink.href}
                    aria-label={socialLink.label}
                    className="text-gray-600 hover:text-primaryColor cursor-pointer text-xl transition-colors duration-200"
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Middle Section: Links and Subscribe */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Footer Sections */}
          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={`${section.title} links`}>
              <h3 className="font-bold text-gray-800 mb-4 font-montserrat">
                {section.title}
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm font-montserrat">
                {section.links.map((link) => (
                  <li key={link.text}>
                    <a
                      href={link.href}
                      className="hover:text-primaryColor transition-colors duration-200"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Get In Touch */}
          <div className="w-full md:w-72">
            <h3 className="font-bold text-gray-800 mb-4 font-montserrat">
              Get In Touch
            </h3>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0">
              <input
                type="email"
                placeholder="Your Email"
                aria-label="Email address for subscription"
                required
                className="p-3 border border-gray-300 rounded-l-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-primaryColor flex-grow min-w-0"
              />
              <button 
                type="submit"
                className="bg-primaryColor font-montserrat text-white py-3 px-6 md:pl-5 pr-9 rounded-r-md sm:rounded-l-none font-semibold hover:bg-secondaryColor transition-colors duration-200 sm:border-l-0 min-w-0 focus:outline-none focus:ring-2 focus:ring-secondaryColor"
              >
                Subscribe
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-2">Lore imp sum dolor Amit</p>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="text-center py-6 border-t border-gray-200 text-gray-500 text-sm font-montserrat flex items-center justify-center gap-1">
          Made With
          <HeartIcon className="inline w-4 h-4 text-red-500 mx-1" aria-label="love" />
          By KUUMA Team. All Right Reserved
        </div>
      </div>
    </footer>
  );
}
