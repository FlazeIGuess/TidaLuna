import React from "react";

import { type PluginPackage } from "@luna/core";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { LunaTrashButton, SpinningButton } from "../../components";
import { LunaStorePlugin } from "./LunaStorePlugin";
import { metricsAreFresh, type RegistryStore } from "./registry";
import { StoreHealth, StoreStars } from "./StoreMetrics";
import { descSx, sectionSx, wave } from "./tidalTokens";

interface StorePackage extends PluginPackage {
	plugins: string[];
}

interface LunaStoreProps {
	url: string;
	onRemove: () => void;
	searchQuery: string;
	/** Registry metadata, undefined for stores the user added themselves */
	entry?: RegistryStore;
}

const DEV_STORE_URL = "http://127.0.0.1:3000";

export const LunaStore = React.memo(({ url, onRemove, searchQuery, entry }: LunaStoreProps) => {
	const [loading, setLoading] = React.useState(false);
	const [loadError, setLoadError] = React.useState<string | undefined>(undefined);
	const [pkg, setPackage] = React.useState<StorePackage | undefined>(undefined);

	const fetchPackage = React.useCallback(async () => {
		setLoading(true);
		setLoadError(undefined);
		try {
			const response = await fetch(`${url}/store.json`);
			if (!response.ok) throw new Error(`Failed to fetch package: ${response.statusText}`);
			setPackage(await response.json());
		} catch (error: any) {
			console.error("Error fetching package:", error);
			setLoadError(error.message || "Unknown error occurred");
			setPackage(undefined);
		} finally {
			setLoading(false);
		}
	}, [url]);

	React.useEffect(() => {
		fetchPackage();
	}, [fetchPackage]);

	const isLocalDevStore = url === DEV_STORE_URL;

	if (pkg === undefined && !loading && !loadError) return null;
	// The local dev store is absent for everyone who is not building a plugin, never shout about it
	if (isLocalDevStore && (loadError || (!pkg && !loading))) return null;

	// The registry knows the name even when the store itself is unreachable
	const name = `${pkg?.name ?? entry?.name ?? "Unknown Store"}${isLocalDevStore ? " [DEV]" : ""}`;
	const link = pkg?.homepage ?? pkg?.repository?.url ?? url;

	// A stale registry means wrong numbers, and a wrong number is worse than none
	const metrics = metricsAreFresh() ? entry : undefined;

	// Stores are third party json, a malformed plugins array must not take the whole settings page down
	const plugins = Array.isArray(pkg?.plugins) ? pkg.plugins.filter((plugin) => typeof plugin === "string") : undefined;
	const query = searchQuery.trim().toLowerCase();
	const filtered = query ? plugins?.filter((plugin) => plugin.toLowerCase().includes(query)) : plugins;
	if (query && !filtered?.length) return null;

	return (
		<Box component="section" sx={{ fontFamily: wave.font, display: "flex", flexDirection: "column", gap: 1.5 }}>
			<Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
				<Tooltip title={url} placement="top-start">
					<Typography
						component="a"
						href={link}
						target="_blank"
						rel="noreferrer"
						sx={{
							...sectionSx,
							minWidth: 0,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							textDecoration: "none",
							"&:hover": { color: wave.accent },
						}}
						children={name}
					/>
				</Tooltip>
				{metrics && (
					<>
						<StoreStars stars={metrics.stars ?? 0} repo={metrics.repo} pluginCount={metrics.pluginCount} />
						<StoreHealth health={metrics.health} />
					</>
				)}
				{filtered !== undefined && (
					<Typography
						sx={{ ...descSx, color: wave.textTertiary, flex: "0 0 auto" }}
						children={`${filtered.length} plugin${filtered.length === 1 ? "" : "s"}`}
					/>
				)}
				<Box sx={{ flexGrow: 1 }} />
				<SpinningButton title="Reload store" spin={loading} disabled={loading} onClick={fetchPackage} />
				<LunaTrashButton disabled={isLocalDevStore} title="Remove store" onClick={onRemove} />
			</Stack>

			{pkg?.description && <Typography sx={{ ...descSx, marginTop: -1 }} children={pkg.description} />}

			{loadError ? (
				<Box sx={{ padding: "12px 14px", borderRadius: wave.radius, border: `1px solid ${wave.line}`, backgroundColor: wave.card }}>
					<Typography sx={{ ...descSx, color: wave.danger }} children={`Could not load this store: ${loadError}`} />
					<Typography sx={{ ...descSx, color: wave.textTertiary }} children={url} />
				</Box>
			) : (
				<Box
					sx={{
						display: "grid",
						// auto-fill instead of a fixed two columns, so wide windows actually use the space
						gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
						gap: 1.5,
						alignItems: "stretch",
					}}
				>
					{filtered?.map((plugin) => (
						<LunaStorePlugin
							key={plugin}
							url={`${url}/${isLocalDevStore ? plugin : plugin.replaceAll(" ", ".")}`}
							downloads={metrics?.downloads?.[plugin]}
						/>
					))}
				</Box>
			)}
		</Box>
	);
});
