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
			// Copied from Tidal's own search field so the two read as one control: same height,
			// same radius, same translucent fill over the same blur, and no border. The border was
			// what made this look like a box sitting on top of the page.
			height: 36,
			paddingX: 1.75,
			borderRadius: "36px",
			color: wave.text,
			backgroundColor: "rgba(40, 40, 40, 0.75)",
			backdropFilter: "blur(20px) saturate(1.8)",
			WebkitBackdropFilter: "blur(20px) saturate(1.8)",
			border: "none",
			transition: "box-shadow .15s ease",
			"&:focus-within": { boxShadow: `0 0 0 1px ${wave.accent}` },
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
