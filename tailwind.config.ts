import type { Config } from "tailwindcss";

// Tokens derivados diretamente da identidade visual oficial
// definida na especificação do Martins Briefing (seções 33-37).
// Não alterar sem atualização da referência de marca.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "mb-navy": "#0D1B2A", // títulos, textos importantes, navegação
        "mb-blue": "#163C6B", // botões, elementos de navegação, destaques
        "mb-cyan": "#00A9E0", // ações, links, estados ativos
        "mb-gray-100": "#F2F4F7", // backgrounds, cards, campos
        "mb-gray-400": "#8C97A6", // textos auxiliares, estados neutros
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(13, 27, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
