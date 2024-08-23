// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}', 
  ],
  theme: {
    extend: {
      colors: {
        dark_green: '#00241f', 
        aston_yellow: '#cedc00',
        aston_widget_green: '#00473f',
        body_background:'#F4F4F2',
        shimmer_bg:'#C1C6CC'
      },
      boxShadow: {
        '3xl': '0px 4px 6px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
