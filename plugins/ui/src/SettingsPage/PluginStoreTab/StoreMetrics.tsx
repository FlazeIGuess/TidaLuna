import React from "react";

import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// Deliberately not a MUI Chip, lunaTheme hardcodes an opaque background on every Paper.
// Fixed height and flex none because the header row grows to two lines on narrow cards,
// and without these the badge stretches to match it and turns into a big dark block.
const badgeSx = {
	display: "inline-flex",
	alignItems: "center",
	alignSelf: "center",
	flex: "0 0 auto",
	gap: 0.5,
	height: 20,
	lineHeight: 1,
	fontSize: "0.7rem",
	fontVariantNumeric: "tabular-nums",
	color: "rgba(255, 255, 255, 0.75)",
	backgroundColor: "rgba(255, 255, 255, 0.08)",
	borderRadius: 1,
	paddingX: 0.75,
	whiteSpace: "nowrap",
} as const;

const Badge = React.memo(({ title, children, sx }: { title: string; children: React.ReactNode; sx?: object }) => (
	<Tooltip title={title} placement="top">
		<Typography variant="caption" sx={{ ...badgeSx, ...sx }} children={children} />
	</Tooltip>
));

/**
 * Repo stars, shown on the store and never on a plugin. TidaLuna stores ship many plugins from one
 * repo, so a star says something about the author and nothing about the individual plugin.
 * Zero is not rendered, an absent badge reads as unknown while a 0 reads as unpopular.
 */
export const StoreStars = React.memo(({ stars, repo, pluginCount }: { stars: number; repo: string; pluginCount?: number }) => {
	if (!stars) return null;
	return (
		<Badge title={`Stars of ${repo}${pluginCount ? `, shared by all ${pluginCount} plugins in this store` : ""}`}>
			{"★"} {stars.toLocaleString()}
		</Badge>
	);
});

export const PluginDownloads = React.memo(({ downloads }: { downloads?: number }) => {
	if (!downloads) return null;
	return <Badge title="Times this plugin was downloaded from its GitHub release">{`↓ ${downloads.toLocaleString()}`}</Badge>;
});

export const StoreHealth = React.memo(({ health }: { health?: "ok" | "archived" | "unreachable" }) => {
	if (health === undefined || health === "ok") return null;
	return (
		<Badge
			title={health === "archived" ? "The GitHub repo is archived, this store is unlikely to get updates" : "The registry could not reach this store"}
			sx={{ color: "#ffb74d", backgroundColor: "rgba(255, 183, 77, 0.15)" }}
			children={health === "archived" ? "Archived" : "Unreachable"}
		/>
	);
});
