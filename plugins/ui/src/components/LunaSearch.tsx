import React from "react";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";

import SearchRounded from "@mui/icons-material/SearchRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";

import { wave } from "../tidalTokens";

export interface LunaSearchProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	/** When true the field sticks to the top of the scroll area, aligned with Tidal's own search. */
	sticky?: boolean;
}

/**
 * A search field shaped like Tidal's own: a full pill with a leading magnifier. Given glassmorphism
 * so, when it sticks, the content scrolling behind it blurs through rather than being hidden by a
 * flat bar. Sticky top is 14px, which places it at the same height as Tidal's real search field and
 * the back/forward buttons (both at y=44 in a scroll container that starts at y=30).
 */
export const LunaSearch = React.memo(({ value, onChange, placeholder = "Search", sticky }: LunaSearchProps) => (
	<Box
		sx={{
			position: sticky ? "sticky" : "relative",
			top: sticky ? "14px" : undefined,
			zIndex: 3,
			display: "flex",
			alignItems: "center",
			gap: 1,
			height: 40,
			paddingX: 1.75,
			borderRadius: 9999,
			color: wave.text,
			// Glassmorphism: a translucent tint over a blur, so the list shows through when stuck
			backgroundColor: `color-mix(in srgb, ${wave.surface} 62%, transparent)`,
			backdropFilter: "blur(16px) saturate(160%)",
			WebkitBackdropFilter: "blur(16px) saturate(160%)",
			border: `1px solid ${wave.line}`,
			transition: "border-color .15s ease, box-shadow .15s ease",
			"&:hover": { borderColor: wave.lineStrong },
			"&:focus-within": { borderColor: wave.accent, boxShadow: `0 0 0 1px ${wave.accent}` },
		}}
	>
		<SearchRounded sx={{ fontSize: 18, color: wave.textTertiary, flexShrink: 0 }} />
		<InputBase
			fullWidth
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			sx={{
				fontFamily: wave.font,
				fontSize: 14,
				color: wave.text,
				"& input::placeholder": { color: wave.textTertiary, opacity: 1 },
			}}
		/>
		{value !== "" && (
			<CloseRounded
				onClick={() => onChange("")}
				sx={{ fontSize: 18, color: wave.textTertiary, cursor: "pointer", flexShrink: 0, "&:hover": { color: wave.text } }}
			/>
		)}
	</Box>
));
