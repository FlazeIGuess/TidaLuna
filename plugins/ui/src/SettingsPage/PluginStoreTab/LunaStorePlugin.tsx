import { LunaPlugin } from "@luna/core";
import { store as obyStore } from "oby";

import React, { useEffect, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";

import { buttonSx, clampSx, descSx, metaSx, titleSx, wave } from "../../tidalTokens";

const authorName = (author: unknown): string | undefined =>
	typeof author === "string" ? author : ((author as { name?: string } | undefined)?.name ?? undefined);
const authorAvatar = (author: unknown): string | undefined =>
	typeof author === "string" ? undefined : ((author as { avatarUrl?: string } | undefined)?.avatarUrl ?? undefined);

/**
 * One plugin in the store, as a card. Cleaned of the earlier slop: raised means lighter plus a
 * hairline not a glow, installed state is a glyph and a neutral border not a coloured one, and the
 * install control is a real button with a visible fill, not a pill or faint text.
 */
export const LunaStorePlugin = React.memo(({ url, downloads }: { url: string; downloads?: number }) => {
	const [plugin, setPlugin] = useState<LunaPlugin | undefined>(undefined);
	const [loadError, setLoadError] = useState<string | undefined>(undefined);
	const [installed, setInstalled] = useState(false);
	const [busy, setBusy] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [btnHover, setBtnHover] = useState(false);

	useEffect(() => {
		LunaPlugin.fromStorage({ url })
			.then(setPlugin)
			.catch((err) => setLoadError(String(err?.message ?? err)));
	}, [url]);

	// Without this the card keeps offering Install after the plugin is already installed
	useEffect(() => {
		if (plugin === undefined) return;
		setInstalled(plugin.installed);
		return obyStore.on(
			() => plugin.installed,
			() => setInstalled(obyStore.unwrap(plugin.store.installed)),
		);
	}, [plugin]);

	if (!plugin) return null;

	const version = plugin.package?.version;
	const author = authorName(plugin.package?.author);
	const avatar = authorAvatar(plugin.package?.author);

	const toggleInstall = async () => {
		setBusy(true);
		try {
			await (installed ? plugin.uninstall() : plugin.install());
		} finally {
			setBusy(false);
		}
	};

	return (
		<Box
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			sx={{
				fontFamily: wave.font,
				display: "flex",
				flexDirection: "column",
				gap: 1,
				height: "100%",
				padding: "14px",
				borderRadius: wave.radius,
				backgroundColor: hovered ? wave.surfaceRaised : wave.surface,
				border: `1px solid ${wave.line}`,
				// Installed state gets exactly two cues, of two different kinds: an ambient accent
				// bloom off the left edge that reads across a whole grid at a glance, and a button
				// that names the action. No badge, no check, no coloured border stacked on top -
				// three stickers all saying "installed" is what made it look generated.
				backgroundImage: installed
					? `linear-gradient(100deg, color-mix(in srgb, ${wave.accent} 16%, transparent) 0%, transparent 58%)`
					: "none",
				transition: "background-color .15s ease",
			}}
		>
			<Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", minWidth: 0 }}>
				{loadError !== undefined && <ErrorOutlineRounded sx={{ fontSize: 16, color: wave.danger, flexShrink: 0, marginTop: "2px" }} />}
				<Tooltip title={plugin.name} placement="top-start">
					<Typography sx={{ ...titleSx, ...clampSx(2), flex: 1, minWidth: 0, overflowWrap: "anywhere" }} children={plugin.name} />
				</Tooltip>
				{version && <Typography sx={{ ...metaSx, flex: "0 0 auto", paddingTop: "1px" }} children={version} />}
			</Stack>

			<Typography
				sx={{ ...descSx, ...clampSx(2), flexGrow: 1 }}
				children={loadError ?? plugin.package?.description ?? "No description"}
			/>

			<Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
				{author && (
					<Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0, flexShrink: 1 }}>
						{avatar && <Avatar src={avatar} sx={{ width: 18, height: 18 }} />}
						<Typography sx={{ ...metaSx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} children={author} />
					</Stack>
				)}
				<Box sx={{ flexGrow: 1 }} />
				{downloads !== undefined && downloads > 0 && (
					<Tooltip title={`${downloads.toLocaleString()} downloads`} placement="top">
						<Stack direction="row" spacing={0.375} sx={{ alignItems: "center", flexShrink: 0, color: wave.textTertiary }}>
							<DownloadRounded sx={{ fontSize: 13 }} />
							<Typography sx={{ ...metaSx, fontVariantNumeric: "tabular-nums" }} children={downloads.toLocaleString()} />
						</Stack>
					</Tooltip>
				)}
				<Button
					disableRipple
					disabled={busy}
					onClick={toggleInstall}
					onMouseEnter={() => setBtnHover(true)}
					onMouseLeave={() => setBtnHover(false)}
					// Installed cards say only what the button will do. The state itself is carried by
					// the bloom on the card, so the button does not repeat it back as "Installed".
					startIcon={busy ? null : installed ? <DeleteOutlineRounded sx={{ fontSize: 15 }} /> : <AddRounded sx={{ fontSize: 15 }} />}
					sx={{
						...buttonSx,
						...(installed
							? {
									backgroundColor: "transparent",
									color: btnHover ? wave.danger : wave.textSecondary,
									borderColor: btnHover ? wave.danger : wave.lineStrong,
								}
							: null),
						// The icon grows on hover and dips on press. Deliberately not a rotation: a
						// plus has four-fold symmetry, so spinning it a quarter turn changes nothing
						// on screen.
						"& .MuiButton-startIcon": {
							marginRight: 0.5,
							transition: "transform 180ms cubic-bezier(0.2, 0, 0, 1)",
						},
						"&:hover .MuiButton-startIcon": { transform: installed ? "translateY(-1px) scale(1.1)" : "scale(1.25)" },
						"&:active .MuiButton-startIcon": { transform: "scale(0.82)" },
						"@media (prefers-reduced-motion: reduce)": {
							"& .MuiButton-startIcon": { transition: "none" },
						},
					}}
					children={busy ? (installed ? "Removing" : "Installing") : installed ? "Remove" : "Install"}
				/>
			</Stack>
		</Box>
	);
});
