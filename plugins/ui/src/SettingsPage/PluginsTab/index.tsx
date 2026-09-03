import React, { useCallback, useMemo, useState } from "react";

import { LunaPlugin } from "@luna/core";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { LunaGroup, LunaRow, LunaSection } from "../../components/LunaList";
import { buttonSx, descSx, inputSx, metaSx, metrics, wave } from "../../tidalTokens";
import { LunaPluginSettings } from "./LunaPluginSettings";

const matches = (plugin: LunaPlugin, query: string) => {
	if (query === "") return true;
	const pkg = plugin.store.package;
	return `${pkg?.name ?? ""} ${pkg?.description ?? ""}`.toLowerCase().includes(query);
};

export const PluginsTab = React.memo(() => {
	const [query, setQuery] = useState("");
	// Single open accordion. One id, not a persisted flag per plugin, so a fresh visit never
	// starts with thirty panels left open from last time.
	const [openId, setOpenId] = useState<string | undefined>(undefined);

	// Partitioned once. Toggling a switch must not move the row into another section mid session,
	// or auditing ten plugins turns into ten re-scrolls.
	const partitions = useMemo(() => {
		const errored: LunaPlugin[] = [];
		const enabled: LunaPlugin[] = [];
		const disabled: LunaPlugin[] = [];
		for (const plugin of Object.values(LunaPlugin.plugins)) {
			if (LunaPlugin.corePlugins.has(plugin.name)) continue;
			if (!plugin.installed) continue;
			if (plugin.loadError._) errored.push(plugin);
			else if (plugin.enabled) enabled.push(plugin);
			else disabled.push(plugin);
		}
		const byName = (a: LunaPlugin, b: LunaPlugin) => a.name.localeCompare(b.name);
		return { errored: errored.sort(byName), enabled: enabled.sort(byName), disabled: disabled.sort(byName) };
	}, []);

	const toggle = useCallback((url: string) => setOpenId((prev) => (prev === url ? undefined : url)), []);

	const total = partitions.errored.length + partitions.enabled.length + partitions.disabled.length;
	if (total === 0)
		return (
			<Box sx={{ maxWidth: metrics.maxTextW }}>
				<LunaGroup>
					<LunaRow title="No plugins installed" desc="Open the Plugin Store tab to add one." />
				</LunaGroup>
			</Box>
		);

	const q = query.trim().toLowerCase();
	const shown = [...partitions.errored, ...partitions.enabled, ...partitions.disabled].filter((p) => matches(p, q)).length;

	const section = (title: string, plugins: LunaPlugin[]) => {
		const visible = plugins.filter((plugin) => matches(plugin, q));
		if (visible.length === 0) return null;
		return (
			<LunaSection title={`${title} (${visible.length})`}>
				<LunaGroup>
					{visible.map((plugin) => (
						<LunaPluginSettings key={plugin.store.url} plugin={plugin} open={openId === plugin.store.url} onToggle={() => toggle(plugin.store.url)} />
					))}
				</LunaGroup>
			</LunaSection>
		);
	};

	return (
		<Stack spacing={3} sx={{ fontFamily: wave.font, maxWidth: metrics.maxTextW }}>
			<Stack
				direction="row"
				spacing={1.5}
				sx={{ alignItems: "center", position: "sticky", top: 0, zIndex: 2, backgroundColor: wave.fill, paddingY: 1.5 }}
			>
				<TextField
					size="small"
					sx={{ ...inputSx, flex: 1 }}
					placeholder="Search installed plugins"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<Typography sx={{ ...metaSx, flex: "0 0 auto" }} children={q === "" ? `${total} installed` : `${shown} of ${total}`} />
				<Button
					disableRipple
					disabled={openId === undefined}
					onClick={() => setOpenId(undefined)}
					sx={{ ...buttonSx, flex: "0 0 auto" }}
					children="Collapse"
				/>
			</Stack>

			{/* Errors first: a plugin that failed to load is the thing you came here for */}
			{section("Errors", partitions.errored)}
			{section("Enabled", partitions.enabled)}
			{section("Disabled", partitions.disabled)}

			{shown === 0 && <Typography sx={{ ...descSx }} children={`No installed plugin matches "${query}".`} />}
		</Stack>
	);
});
