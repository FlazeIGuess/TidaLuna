import React from "react";

import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

// Deliberately not a MUI Chip, lunaTheme hardcodes an opaque background on every Paper
const badgeSx = {
	color: "rgba(255, 255, 255, 0.75)",
	backgroundColor: "rgba(255, 255, 255, 0.08)",
	borderRadius: 1,
	paddingX: 0.75,
	paddingY: 0.25,
	whiteSpace: "nowrap",
} as const;

const Badge = React.memo(({ title, children }: { title: string; children: React.ReactNode }) => (
	<Tooltip title={title} placement="top">
		<Typography variant="caption" sx={badgeSx} children={children} />
	</Tooltip>
));

/**
 * Repo stars, shown on the store and never on a plugin. TidaLuna stores ship many plugins from one
 * repo, so a star says something about the author and nothing about the individual plugin.
 */
export const StoreStars = React.memo(({ stars, repo, pluginCount }: { stars: number; repo: string; pluginCount?: number }) => (
	<Badge title={`Stars of ${repo}${pluginCount ? `, shared by all ${pluginCount} plugins in this store` : ""}`}>
		{"⭐"} {stars.toLocaleString()}
	</Badge>
));

export const PluginDownloads = React.memo(({ downloads }: { downloads: number }) => (
	<Badge title="Times this plugin was downloaded from its GitHub release">
		{"⬇"} {downloads.toLocaleString()}
	</Badge>
));

export const StoreHealth = React.memo(({ health }: { health: "archived" | "unreachable" }) => (
	<Tooltip
		title={health === "archived" ? "The GitHub repo is archived, this store is unlikely to get updates" : "The registry could not reach this store"}
		placement="top"
	>
		<Typography
			variant="caption"
			sx={{ ...badgeSx, color: "#ffb74d", backgroundColor: "rgba(255, 183, 77, 0.15)" }}
			children={health === "archived" ? "Archived" : "Unreachable"}
		/>
	</Tooltip>
));
