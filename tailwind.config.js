const withMT = require("@material-tailwind/react/utils/withMT");
 
module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      'primaryColor': '#245156',
      'secondaryColor': '#E26C02'
    },
    fontFamily: {
      'montserrat': ['Montserrat', 'sans-serif'],
      'poppins': ['Poppins', 'sans-serif'],
      'inter': ['Inter', 'sans-serif']
    },
    extend: {},
  },
  plugins: [ require('tailwind-scrollbar-hide')],
});