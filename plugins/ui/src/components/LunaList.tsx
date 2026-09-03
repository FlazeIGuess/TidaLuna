import React, { useCallback, useId, useLayoutEffect, useRef, type PropsWithChildren, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";

import { descSx, groupSx, metaSx, metrics, oneLineSx, rowSx, sectionSx, titleSx, wave } from "../tidalTokens";

/**
 * The list primitives. Tidal's own UI has two container idioms: full bleed lists of hairline
 * separated rows, and image tiles for things that have artwork. A plugin has no artwork, so
 * everything in Luna's settings is a row in a group. Nothing outside this file may set a
 * background, border, radius or shadow.
 */

/** The one container. Rows inside get their separators from rowSx. */
export const LunaGroup = React.memo(({ children, sx }: PropsWithChildren<{ sx?: object }>) => (
	<Box sx={{ ...groupSx, ...sx }} children={children} />
));

/** Heading and subline sit outside and above the group, so the group reads as one object. */
export const LunaSection = React.memo(
	({ title, desc, trailing, children }: PropsWithChildren<{ title: ReactNode; desc?: ReactNode; trailing?: ReactNode }>) => (
		<Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			<Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
				<Box sx={{ minWidth: 0, flex: 1 }}>
					{typeof title === "string" ? <Typography sx={{ ...sectionSx, ...oneLineSx }} children={title} /> : title}
					{desc !== undefined && (typeof desc === "string" ? <Typography sx={{ ...descSx, ...oneLineSx }} children={desc} /> : desc)}
				</Box>
				{trailing}
			</Stack>
			{children}
		</Box>
	),
);

export interface LunaRowProps {
	/** 20px status column. A dot, a check, an error glyph. */
	lead?: ReactNode;
	title: ReactNode;
	/** One line only. The fixed row height depends on it. */
	desc?: ReactNode;
	/** Sits after the title on the same line, for versions and state labels. */
	meta?: ReactNode;
	trailing?: ReactNode;
	/** 52px instead of 68px, for rows that carry no description. */
	compact?: boolean;
	titleAttr?: string;
	sx?: object;
	/** Ref to the row's outer element, for scrolling a row into view after it moves. */
	rootRef?: React.Ref<HTMLDivElement>;
}

const RowText = React.memo(({ title, desc, meta, titleAttr }: Pick<LunaRowProps, "title" | "desc" | "meta" | "titleAttr">) => (
	<Box sx={{ minWidth: 0 }}>
		<Stack direction="row" spacing={1} sx={{ alignItems: "baseline", minWidth: 0 }}>
			{typeof title === "string" ? <Typography title={titleAttr ?? title} sx={{ ...titleSx, ...oneLineSx }} children={title} /> : title}
			{meta}
		</Stack>
		{desc !== undefined &&
			(typeof desc === "string" ? <Typography title={desc} sx={{ ...descSx, ...oneLineSx }} children={desc} /> : desc)}
	</Box>
));

export const LunaRow = React.memo(({ lead, title, desc, meta, trailing, compact, titleAttr, sx, rootRef }: LunaRowProps) => (
	<Box ref={rootRef} sx={{ ...rowSx, ...(compact ? { minHeight: metrics.rowHCompact } : null), ...sx }}>
		<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: metrics.leadSlot }} children={lead} />
		<RowText title={title} desc={desc} meta={meta} titleAttr={titleAttr} />
		<Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }} children={trailing} />
	</Box>
));

export interface LunaExpandableRowProps extends LunaRowProps {
	open: boolean;
	onToggle: () => void;
	/** Rendered inside the animated panel. Not a card: no background, no border, no radius. */
	panel?: ReactNode;
}

/**
 * Row plus a grid based expand panel. The chevron is the state indicator, never the toggle:
 * the whole header is the button. A gear means "navigate to settings" in every desktop manager,
 * so it is not used for expanding.
 */
export const LunaExpandableRow = React.memo(
	({ open, onToggle, panel, lead, title, desc, meta, trailing, titleAttr, sx, rootRef }: LunaExpandableRowProps) => {
		const panelId = useId();
		const headerId = useId();
		const headerRef = useRef<HTMLDivElement>(null);

		// Collapsing a tall panel otherwise strands the user at a scroll position they never chose
		const toggle = useCallback(() => {
			const wasOpen = open;
			onToggle();
			if (!wasOpen) return;
			setTimeout(() => {
				const el = headerRef.current;
				if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "nearest" });
			}, 160);
		}, [open, onToggle]);

		return (
			<Box
				ref={rootRef}
				sx={{
					"&:not(:first-of-type)": { borderTop: `1px solid ${wave.line}` },
					backgroundColor: open ? wave.surfaceRaised : "transparent",
				}}
			>
				<Box
					ref={headerRef}
					sx={{
						...rowSx,
						// The wrapper owns the separator so an open panel stays visually attached
						"&:not(:first-of-type)": undefined,
						borderTop: "none",
						...sx,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: metrics.leadSlot }} children={lead} />
					<Box
						component="button"
						id={headerId}
						type="button"
						aria-expanded={open}
						aria-controls={panelId}
						onClick={toggle}
						sx={{
							all: "unset",
							cursor: "pointer",
							minWidth: 0,
							display: "block",
							"&:focus-visible": { outline: `2px solid ${wave.accent}`, outlineOffset: 2, borderRadius: wave.radiusTiny },
						}}
					>
						<RowText title={title} desc={desc} meta={meta} titleAttr={titleAttr} />
					</Box>
					<Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
						{trailing}
						<Box
							component="span"
							aria-hidden
							onClick={toggle}
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: metrics.iconBtn,
								height: metrics.iconBtn,
								cursor: "pointer",
								color: wave.textSecondary,
								borderRadius: wave.radiusSmall,
								transform: open ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 140ms cubic-bezier(0.2, 0, 0, 1)",
								"@media (prefers-reduced-motion: reduce)": { transition: "none" },
								"&:hover": { color: wave.text },
							}}
						>
							<ExpandMoreRounded sx={{ fontSize: 20 }} />
						</Box>
					</Stack>
				</Box>
				{panel !== undefined && (
					<Box
						id={panelId}
						role="region"
						aria-labelledby={headerId}
						sx={{
							// grid-template-rows 0fr to 1fr animates without measuring anything in JS
							display: "grid",
							gridTemplateRows: open ? "1fr" : "0fr",
							transition: "grid-template-rows 140ms cubic-bezier(0.2, 0, 0, 1)",
							"@media (prefers-reduced-motion: reduce)": { transition: "none" },
						}}
					>
						{/* min-height 0 is required or the row refuses to collapse */}
						<Box sx={{ minHeight: 0, overflow: "hidden" }}>
							{/* All padding lives here, never on the animating wrapper */}
							<Box sx={{ padding: `4px ${metrics.rowPadX}px ${metrics.rowPadX}px ${metrics.indent}px` }} children={panel} />
						</Box>
					</Box>
				)}
			</Box>
		);
	},
);

/**
 * Renders children and reports whether they produced any visible content. A plugin can export a
 * Settings component that renders only spacers, and an accordion onto nothing is worse than no
 * accordion. useLayoutEffect fires before paint, so a row found empty never shows a chevron frame.
 */
export const MeasureEmpty = React.memo(({ onResult, children }: PropsWithChildren<{ onResult: (empty: boolean) => void }>) => {
	const ref = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const meaningful = el.querySelector("input,button,select,textarea,a,svg,img,[role],label,h1,h2,h3,h4,h5,h6,p") !== null;
		onResult(!meaningful && el.textContent!.trim() === "");
	});
	return <Box ref={ref} children={children} />;
});

/** Genuine state only: Archived, Unreachable, Disabled, Needs reload. At most one per row. */
export const LunaBadge = React.memo(({ children, tone }: PropsWithChildren<{ tone?: "neutral" | "warning" | "danger" }>) => (
	<Typography
		component="span"
		sx={{
			...metaSx,
			flex: "0 0 auto",
			paddingX: 0.75,
			paddingY: "1px",
			borderRadius: wave.radiusTiny,
			whiteSpace: "nowrap",
			color: tone === "warning" ? wave.warning : tone === "danger" ? wave.danger : wave.textSecondary,
			backgroundColor: tone === undefined || tone === "neutral" ? "transparent" : wave.line,
			border: tone === undefined || tone === "neutral" ? `1px solid ${wave.line}` : "1px solid transparent",
		}}
		children={children}
	/>
));
