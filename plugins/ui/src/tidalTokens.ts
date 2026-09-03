/**
 * Tidal ships its own design system under the "wave" prefix as CSS custom properties on :root.
 * Referencing them instead of hardcoding hex means Luna follows along when Tidal retunes its
 * palette. Fallbacks are what Tidal 2.43 resolves to, so nothing collapses if a token is renamed.
 *
 * This is the single style source for every settings tab. Nothing else may define a surface
 * colour, a border, a radius or a shadow.
 */
export const wave = {
	// Surfaces, darkest to lightest. Raised means LIGHTER plus a hairline, never darker plus a
	// shadow: on a black page a drop shadow has nothing to darken and reads as a smudge.
	fill: "var(--wave-color-solid-base-fill, #000)",
	surface: "var(--wave-color-solid-base-bright, #18181b)",
	surfaceRaised: "var(--wave-color-solid-base-brighter, #242429)",
	surfaceHover: "var(--wave-color-solid-base-brightest, #303036)",

	// Text
	text: "var(--wave-color-text-main, #fff)",
	textSecondary: "var(--wave-color-text-secondary, #afafb6)",
	textTertiary: "var(--wave-color-text-tertiary, #787887)",
	danger: "var(--wave-color-text-danger, #ff4242)",
	warning: "var(--wave-color-opacity-special-fill-ultra-thick, #ffbe7dcc)",
	/** Only ever the focus ring, the checked switch track, and link hover. Never a border or badge fill. */
	accent: "var(--wave-color-text-link, #33ffee)",

	// Hairlines
	line: "var(--wave-color-opacity-contrast-fill-ultra-thin, #ffffff1a)",
	lineStrong: "var(--wave-color-opacity-contrast-fill-thin, #ffffff33)",

	// Radii
	radius: "var(--wave-border-radius--regular, 12px)",
	radiusSmall: "var(--wave-border-radius--small, 8px)",
	radiusTiny: "var(--wave-border-radius--extra-small, 4px)",

	// Type, matching what Tidal's own settings rows compute to
	font: '"Square Sans Text VF", "Square Sans Text", Helvetica, Arial, sans-serif',
} as const;

/** Row and group geometry. Every number is a multiple of 4. */
export const metrics = {
	rowH: 68,
	rowHCompact: 52,
	rowPadX: 16,
	rowPadY: 15,
	/** Leading status column */
	leadSlot: 20,
	gutter: 12,
	/** rowPadX + leadSlot + gutter, so a sub row lines up with the parent's text column */
	indent: 48,
	controlMinW: 120,
	iconBtn: 32,
	/** A 1900px wide row puts its trailing control a mouse-metre from its title */
	maxTextW: 960,
} as const;

/**
 * Exactly four type steps and nothing else. Three sizes within 15% of each other is a flat
 * hierarchy with extra rungs, which is why the old h7/h8/h9 variants are gone.
 */
export const sectionSx = { fontFamily: wave.font, fontSize: 16, fontWeight: 600, color: wave.text, lineHeight: "24px" } as const;
export const titleSx = { fontFamily: wave.font, fontSize: 14, fontWeight: 600, color: wave.text, lineHeight: "20px" } as const;
export const descSx = { fontFamily: wave.font, fontSize: 12, fontWeight: 500, color: wave.textSecondary, lineHeight: "18px" } as const;
/** Versions, counts, timestamps, inline state labels */
export const metaSx = { fontFamily: wave.font, fontSize: 11, fontWeight: 500, color: wave.textTertiary, lineHeight: "16px" } as const;

/** The one container. Opaque, lighter than the page, hairline, no shadow. */
export const groupSx = {
	backgroundColor: wave.surface,
	border: `1px solid ${wave.line}`,
	borderRadius: wave.radius,
	// So the first and last row inherit the rounded corners
	overflow: "hidden",
	// Chromium's scroll anchoring pins the toggle in place and yanks the list when a panel opens
	overflowAnchor: "none",
	boxShadow: "none",
} as const;

/** The one row. */
export const rowSx = {
	display: "grid",
	gridTemplateColumns: `${metrics.leadSlot}px minmax(0, 1fr) auto`,
	columnGap: `${metrics.gutter}px`,
	alignItems: "center",
	minHeight: metrics.rowH,
	padding: `${metrics.rowPadY}px ${metrics.rowPadX}px`,
	backgroundColor: "transparent",
	transition: "background-color 120ms linear",
	"&:not(:first-of-type)": { borderTop: `1px solid ${wave.line}` },
	"&:hover": { backgroundColor: wave.surfaceRaised },
	"&:focus-visible": { outline: `2px solid ${wave.accent}`, outlineOffset: -2 },
} as const;

/** Neutral by default. Colour is for a destructive item on hover, not for decoration. */
export const iconBtnSx = {
	width: metrics.iconBtn,
	height: metrics.iconBtn,
	padding: 0,
	borderRadius: wave.radiusSmall,
	color: wave.textSecondary,
	"& svg": { fontSize: 18 },
	"&:hover": { color: wave.text, backgroundColor: wave.line },
	"&.Mui-disabled": { color: wave.textTertiary, opacity: 0.4 },
} as const;

/**
 * A small real button, not a pill. A visible fill plus a hairline so it reads as a button on a
 * card, not as faint text: wave.line alone was too low contrast to recognise.
 */
export const buttonSx = {
	fontFamily: wave.font,
	fontSize: 12,
	fontWeight: 600,
	textTransform: "none",
	minWidth: 88,
	height: 30,
	paddingX: 1.5,
	borderRadius: wave.radiusSmall,
	color: wave.text,
	backgroundColor: wave.surfaceHover,
	border: `1px solid ${wave.lineStrong}`,
	boxShadow: "none",
	"&:hover": { backgroundColor: wave.lineStrong, borderColor: wave.textTertiary, boxShadow: "none" },
	"&.Mui-disabled": { color: wave.textTertiary, backgroundColor: wave.surface, borderColor: wave.line },
} as const;

/** A text field that looks like Tidal's own, not a bare MUI outline on black */
export const inputSx = {
	"& .MuiOutlinedInput-root": {
		fontFamily: wave.font,
		fontSize: 14,
		color: wave.text,
		backgroundColor: wave.surface,
		borderRadius: wave.radiusSmall,
		"& fieldset": { borderColor: wave.line },
		"&:hover fieldset": { borderColor: wave.lineStrong },
		"&.Mui-focused fieldset": { borderColor: wave.accent, borderWidth: 1 },
	},
	"& .MuiOutlinedInput-input::placeholder": { color: wave.textTertiary, opacity: 1 },
	"& .MuiInputLabel-root": { fontFamily: wave.font, fontSize: 14, color: wave.textTertiary },
	"& .MuiInputLabel-root.Mui-focused": { color: wave.accent },
} as const;

/** One line, ellipsis, full text belongs in a title attribute. Fixed row height depends on this. */
export const oneLineSx = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as const;

/** Clamp to n lines. No reserved height, the grid stretches cards in a row to match. */
export const clampSx = (lines: number) =>
	({ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }) as const;
