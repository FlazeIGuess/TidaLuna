import { LunaPlugin } from "@luna/core";
import { store as obyStore } from "oby";

import React, { useEffect, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { clamp, descSx, titleSx, wave } from "./tidalTokens";

const DEV_PREFIX = "http://127.0.0.1";

// Angle bracket casts are JSX in a .tsx file, so these use "as"
const authorName = (author: unknown): string | undefined =>
	typeof author === "string" ? author : ((author as { name?: string } | undefined)?.name ?? undefined);
const authorAvatar = (author: unknown): string | undefined =>
	typeof author === "string" ? undefined : ((author as { avatarUrl?: string } | undefined)?.avatarUrl ?? undefined);

/**
 * One plugin in the store grid. Deliberately not built on LunaPluginHeader: that component packs
 * name, version, badges and author into a single row, which works in the wide plugins tab and
 * falls apart in a grid column, wrapping the author and squeezing the name to three characters.
 * Here the card is three stacked rows instead, so nothing competes for the same horizontal space.
 */
export const LunaStorePlugin = React.memo(({ url, downloads }: { url: string; downloads?: number }) => {
	const [plugin, setPlugin] = useState<LunaPlugin | undefined>(undefined);
	const [loadError, setLoadError] = useState<string | undefined>(undefined);
	const [installed, setInstalled] = useState(false);
	const [hovered, setHovered] = useState(false);

	useEffect(() => {
		LunaPlugin.fromStorage({ url }).then(setPlugin).catch(setLoadError);
	}, [url]);

	// Without this the card keeps showing "Install" until something else forces a rerender
	useEffect(() => {
		if (plugin === undefined) return;
		setInstalled(plugin.installed);
		return obyStore.on(
			() => plugin.installed,
			() => setInstalled(obyStore.unwrap(plugin.store.installed)),
		);
	}, [plugin]);

	if (!plugin) return null;

	const isDev = url.startsWith(DEV_PREFIX);
	const version = plugin.package?.version;
	const author = plugin.package?.author;
	const name = authorName(author);
	const avatar = authorAvatar(author);

	return (
		<Box
			role="button"
			tabIndex={0}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={() => (installed ? plugin.uninstall() : plugin.install())}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					installed ? plugin.uninstall() : plugin.install();
				}
			}}
			sx={{
				fontFamily: wave.font,
				display: "flex",
				flexDirection: "column",
				gap: 1,
				height: "100%",
				padding: "14px",
				textAlign: "left",
				cursor: "pointer",
				borderRadius: wave.radius,
				backgroundColor: hovered ? wave.surfaceRaised : wave.card,
				// Installed reads as a state, not as a disabled card, so it keeps full contrast
				border: `1px solid ${installed ? wave.accentDark : wave.line}`,
				boxShadow: loadError ? `0 0 0 1px ${wave.danger}` : "none",
				transition: "background-color .15s ease, border-color .15s ease",
				"&:focus-visible": { outline: `2px solid ${wave.accent}`, outlineOffset: 2 },
			}}
		>
			<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
				<Tooltip title={plugin.name} placement="top-start">
					<Typography sx={{ ...titleSx, ...clamp(2), flex: 1, minWidth: 0, overflowWrap: "anywhere" }} children={plugin.name} />
				</Tooltip>
				{version && (
					<Typography
						sx={{ ...descSx, flex: "0 0 auto", color: wave.textTertiary, paddingTop: "1px" }}
						children={isDev ? `${version} DEV` : version}
					/>
				)}
			</Stack>

			<Typography
				sx={{ ...descSx, ...clamp(2), flexGrow: 1 }}
				children={loadError ?? plugin.package?.description ?? "No description"}
			/>

			<Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: "center" }}>
				{name && (
					<Stack direction="row" spacing={0.75} sx={{ minWidth: 0, flexShrink: 1, alignItems: "center" }}>
						{avatar && <Avatar src={avatar} sx={{ width: 18, height: 18 }} />}
						<Typography
							sx={{ ...descSx, color: wave.textTertiary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
							children={name}
						/>
					</Stack>
				)}
				<Box sx={{ flexGrow: 1 }} />
				{downloads !== undefined && downloads > 0 && (
					<Tooltip title="Downloads of this plugin from its GitHub release" placement="top">
						<Typography
							sx={{ ...descSx, color: wave.textTertiary, flex: "0 0 auto", fontVariantNumeric: "tabular-nums" }}
							children={`↓ ${downloads.toLocaleString()}`}
						/>
					</Tooltip>
				)}
				<Typography
					sx={{
						...descSx,
						flex: "0 0 auto",
						fontWeight: 600,
						// Fixed width so Install and Installed occupy the same space and the
						// download counts line up from card to card
						minWidth: 62,
						textAlign: "center",
						paddingX: 1,
						paddingY: "3px",
						borderRadius: wave.radiusPill,
						color: installed ? (hovered ? wave.danger : wave.accent) : hovered ? wave.fill : wave.textSecondary,
						backgroundColor: installed ? "transparent" : hovered ? wave.accent : wave.line,
						border: `1px solid ${installed ? (hovered ? wave.danger : wave.accentDark) : "transparent"}`,
						transition: "color .15s ease, background-color .15s ease, border-color .15s ease",
					}}
					children={installed ? (hovered ? "Remove" : "Installed") : "Install"}
				/>
			</Stack>
		</Box>
	);
});
