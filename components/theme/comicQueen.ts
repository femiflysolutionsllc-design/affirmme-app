/*
 * Compatibility bridge for existing shared components.
 *
 * The name remains comicQueen temporarily so we do not have
 * to rewrite every import at once. The values now come from
 * the active CSS theme instead of permanent Comic colors.
 */

export const comicQueen = {
  colors: {
    background: "var(--page-bg)",

    card: "var(--surface-card)",
    cardDark: "var(--surface-main)",

    border: "var(--text-muted)",

    primary: "var(--accent-blue)",
    secondary: "var(--accent-pink)",
    accent: "var(--accent-yellow)",

    success: "var(--accent-green)",
    warning: "var(--accent-yellow)",
    danger: "var(--accent-pink)",

    text: "var(--text-main)",
    textSecondary: "var(--text-soft)",
    textMuted: "var(--text-muted)",
  },

  radius: {
    card: "var(--card-radius)",
    button: "var(--button-radius)",
    pill: "999px",
  },

  glow: {
    blue:
      "0 0 20px color-mix(in srgb, var(--accent-blue) 35%, transparent)",

    red:
      "0 0 20px color-mix(in srgb, var(--accent-pink) 30%, transparent)",

    rose:
      "0 0 20px color-mix(in srgb, var(--accent-yellow) 30%, transparent)",
  },

  gradients: {
    page:
      "linear-gradient(180deg, var(--page-bg), var(--surface-main))",

    hero:
      "linear-gradient(135deg, var(--accent-blue), var(--accent-pink), var(--accent-yellow))",

    card:
      "linear-gradient(180deg, var(--surface-card), var(--surface-main))",

    button:
      "linear-gradient(135deg, var(--accent-blue), var(--accent-pink))",
  },
};