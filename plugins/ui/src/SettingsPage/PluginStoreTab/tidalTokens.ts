/**
 * Tidal ships its own design system under the "wave" prefix as CSS custom properties on :root.
 * Referencing them instead of hardcoding hex means Luna follows along when Tidal retunes its
 * palette, and the store stops looking like a bolted on panel. Fallbacks are the values Tidal
 * 2.43 resolves to, so nothing collapses if a token is renamed.
 */
export const wave = {
	// Surfaces, darkest to lightest
	fill: "var(--wave-color-solid-base-fill, #000)",
	surface: "var(--wave-color-solid-base-bright, #18181b)",
	surfaceRaised: "var(--wave-color-solid-base-brighter, #242429)",
	surfaceHover: "var(--wave-color-solid-base-brightest, #303036)",
	// Tidal draws its settings cards as a translucent fill over the page, not a solid block
	card: "color-mix(in srgb, var(--wave-color-solid-base-bright, #18181b) 60%, transparent)",

	// Text
	text: "var(--wave-color-text-main, #fff)",
	textSecondary: "var(--wave-color-text-secondary, #afafb6)",
	textTertiary: "var(--wave-color-text-tertiary, #787887)",
	danger: "var(--wave-color-text-danger, #ff4242)",
	accent: "var(--wave-color-text-link, #33ffee)",
	accentDark: "var(--wave-color-solid-accent-dark, #3d8f88)",

	// Hairlines and translucent fills
	line: "var(--wave-color-opacity-contrast-fill-ultra-thin, #ffffff1a)",
	lineStrong: "var(--wave-color-opacity-contrast-fill-thin, #ffffff33)",

	// Radii
	radiusGroup: "var(--floating-panel-border-radius, 16px)",
	radius: "var(--wave-border-radius--regular, 12px)",
	radiusSmall: "var(--wave-border-radius--small, 8px)",
	radiusTiny: "var(--wave-border-radius--extra-small, 4px)",
	radiusPill: "var(--wave-border-radius--full, 1000px)",

	// Type, matching what Tidal's own settings rows compute to
	font: '"Square Sans Text VF", "Square Sans Text", Helvetica, Arial, sans-serif',
} as const;

/** Tidal's settings row title: 14px/600 */
export const titleSx = { fontFamily: wave.font, fontSize: 14, fontWeight: 600, color: wave.text, lineHeight: "20px" } as const;
/** Tidal's settings row description: 12px/500 secondary */
export const descSx = { fontFamily: wave.font, fontSize: 12, fontWeight: 500, color: wave.textSecondary, lineHeight: "18px" } as const;
/** Tidal's section heading above a card group: 16px/600 */
export const sectionSx = { fontFamily: wave.font, fontSize: 16, fontWeight: 600, color: wave.text, lineHeight: "24px" } as const;

/**
 * Clamp to n lines instead of a hard ellipsis, so a long plugin name stays readable.
 * No reserved height on purpose, the grid already stretches every card in a row to the
 * same height and reserving it again just opens a gap under short titles.
 */
export const clamp = (lines: number) => ({
	display: "-webkit-box",
	WebkitLineClamp: lines,
	WebkitBoxOrient: "vertical" as const,
	overflow: "hidden",
});

/** A text field that looks like Tidal's own, not like a bare MUI outline on black */
export const inputSx = {
	"& .MuiOutlinedInput-root": {
		fontFamily: wave.font,
		fontSize: 14,
		color: wave.text,
		backgroundColor: wave.card,
		borderRadius: wave.radiusSmall,
		"& fieldset": { borderColor: wave.line },
		"&:hover fieldset": { borderColor: wave.lineStrong },
		"&.Mui-focused fieldset": { borderColor: wave.accent, borderWidth: 1 },
	},
	"& .MuiOutlinedInput-input::placeholder": { color: wave.textTertiary, opacity: 1 },
	"& .MuiInputLabel-root": { fontFamily: wave.font, fontSize: 14, color: wave.textTertiary },
	"& .MuiInputLabel-root.Mui-focused": { color: wave.accent },
} as const;
