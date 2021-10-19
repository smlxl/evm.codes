module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      serif: ['Inter', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
    },
    extend: {
      fontSize: {
        '2xs': '10px',
        tiny: '13px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
