import React, { useCallback, useEffect, useState } from "react";

import { store as obyStore } from "oby";

import { unloadSet } from "@luna/core";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { LunaGroup, LunaRow, LunaSection } from "../../components/LunaList";
import { descSx, inputSx, metrics, wave } from "../../tidalTokens";
import { InstallFromUrl } from "./InstallFromUrl";
import { LunaStore } from "./LunaStore";
import { hiddenStoreUrls, refreshRegistry, registryStores, removeStore, userStoreUrls, visibleStores, type StoreEntry } from "./registry";

export * from "./registry";

const DEV_STORE_URL = "http://127.0.0.1:3000";

export const PluginStoreTab = React.memo(() => {
	const [stores, setStores] = useState<StoreEntry[]>(visibleStores);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const update = () => setStores(visibleStores());
		// Any of the three can change the visible list, the registry from a fetch and the other two from the user
		const unloads = new Set([obyStore.on(registryStores, update), obyStore.on(userStoreUrls, update), obyStore.on(hiddenStoreUrls, update)]);
		refreshRegistry().catch((err) => console.error("[PluginStore] Failed to refresh registry:", err));
		// Block body on purpose, unloadSet is async and React rejects a Promise as cleanup
		return () => {
			unloadSet(unloads);
		};
	}, []);

	const onRemove = useCallback((storeUrl: string) => removeStore(storeUrl), []);

	return (
		<Stack spacing={3} sx={{ fontFamily: wave.font, maxWidth: metrics.maxTextW }}>
			{/* Sticky so filtering a long list never means scrolling back up to change the query */}
			<Box sx={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: wave.fill, paddingY: 1.5 }}>
				<TextField
					fullWidth
					size="small"
					sx={inputSx}
					placeholder="Search plugins"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</Box>

			<LunaStore url={DEV_STORE_URL} onRemove={() => {}} searchQuery={searchQuery} />
			{stores.map((store) => (
				<LunaStore key={store.url} url={store.url} entry={store.entry} onRemove={() => onRemove(store.url)} searchQuery={searchQuery} />
			))}

			{stores.length === 0 && (
				<LunaGroup>
					<LunaRow
						title="No plugin stores yet"
						desc="They load from the registry. Check your connection, or add one below."
					/>
				</LunaGroup>
			)}

			{/* At the bottom on purpose, so it stops competing with search for the top of the page */}
			<LunaSection title="Add a store or plugin" desc="Paste a link to a store.json, a plugin, or a .css theme.">
				<InstallFromUrl />
			</LunaSection>

			<Typography sx={{ ...descSx, color: wave.textTertiary }}>
				Being listed is not a security review. Plugins run with full access to your machine.
			</Typography>
		</Stack>
	);
});
