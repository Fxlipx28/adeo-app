/**
 * Paleta "Mochilero": bosque, arena, atardecer y piedra.
 * - primary  = verde bosque (confianza, naturaleza)
 * - accent   = naranja atardecer (acción, destino seleccionado)
 * - background/surface = arena cálida (papel de mapa)
 */
/** @type {const} */
const themeColors = {
  primary: { light: '#1F6B57', dark: '#3FA386' },
  accent: { light: '#E8743B', dark: '#F08A55' },
  background: { light: '#FBF8F1', dark: '#14201B' },
  surface: { light: '#F3EEE2', dark: '#1D2B25' },
  foreground: { light: '#1D2A24', dark: '#EEF2EE' },
  muted: { light: '#6C756D', dark: '#9AA69D' },
  border: { light: '#E6DFCF', dark: '#31413A' },
  success: { light: '#2E8B57', dark: '#4ADE80' },
  warning: { light: '#D9962B', dark: '#FBBF24' },
  error: { light: '#C8472F', dark: '#F87171' },
};

module.exports = { themeColors };
