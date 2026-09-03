import { LunaPlugin } from "@luna/core";
import { store as obyStore } from "oby";

import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import CheckRounded from "@mui/icons-material/CheckRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";

import { LunaRow } from "../../components/LunaList";
import { buttonSx, metaSx, oneLineSx, wave } from "../../tidalTokens";

const authorName = (author: unknown): string | undefined =>
	typeof author === "string" ? author : ((author as { name?: string } | undefined)?.name ?? undefined);

/**
 * One plugin in a store, as a row. Not a card: every plugin carries the same field set, and a
 * grid of boxes forces the eye to re-find each field at a new position on every item. In a row
 * list the name, the download count and the action land in the same column every time.
 */
export const LunaStorePlugin = React.memo(({ url, downloads }: { url: string; downloads?: number }) => {
	const [plugin, setPlugin] = useState<LunaPlugin | undefined>(undefined);
	const [loadError, setLoadError] = useState<string | undefined>(undefined);
	const [installed, setInstalled] = useState(false);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		LunaPlugin.fromStorage({ url })
			.then(setPlugin)
			.catch((err) => setLoadError(String(err?.message ?? err)));
	}, [url]);

	// Without this the row keeps offering Install after the plugin is already installed
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

	const toggleInstall = async () => {
		setBusy(true);
		try {
			await (installed ? plugin.uninstall() : plugin.install());
		} finally {
			setBusy(false);
		}
	};

	return (
		<LunaRow
			// State reads from a glyph, not a coloured border, so it survives greyscale
			lead={
				loadError !== undefined ? (
					<ErrorOutlineRounded sx={{ fontSize: 16, color: wave.danger }} />
				) : installed ? (
					<CheckRounded sx={{ fontSize: 16, color: wave.textSecondary }} />
				) : undefined
			}
			title={plugin.name}
			meta={
				<>
					{version && <Typography component="span" sx={{ ...metaSx, flex: "0 0 auto" }} children={version} />}
					{author && <Typography component="span" sx={{ ...metaSx, flex: "0 0 auto" }} children={`by ${author}`} />}
				</>
			}
			desc={
				loadError !== undefined ? (
					<Typography title={loadError} sx={{ ...metaSx, ...oneLineSx, color: wave.danger }} children={loadError} />
				) : (
					(plugin.package?.description ?? "No description")
				)
			}
			trailing={
				<>
					{downloads !== undefined && downloads > 0 && (
						<Typography
							title="Downloads from the GitHub release"
							sx={{ ...metaSx, fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right" }}
							children={downloads.toLocaleString()}
						/>
					)}
					<Button
						disableRipple
						disabled={busy}
						onClick={toggleInstall}
						sx={
							installed
								? { ...buttonSx, backgroundColor: "transparent", color: wave.textSecondary, "&:hover": { backgroundColor: wave.line, color: wave.text } }
								: buttonSx
						}
						children={busy ? (installed ? "Removing" : "Installing") : installed ? "Remove" : "Install"}
					/>
				</>
			}
		/>
	);
});
