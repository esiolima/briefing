// Fonte única da verdade para os tokens visuais oficiais do Martins Briefing.
// Espelha as variáveis definidas em tailwind.config.ts — mantenha os dois em sincronia.
export const colors = {
  navy: "#0D1B2A",
  blue: "#163C6B",
  cyan: "#00A9E0",
  gray100: "#F2F4F7",
  gray400: "#8C97A6",
  white: "#FFFFFF",
} as const;

export const fontFamily = "Montserrat, sans-serif";

export const wizardSteps = [
  "Identificação",
  "Necessidade",
  "Complementação",
  "Briefing",
  "Revisão",
  "Respostas Droni",
  "Referências",
  "Finalização",
] as const;
