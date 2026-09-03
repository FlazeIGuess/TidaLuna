import React, { useLayoutEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import ExtensionIcon from "@mui/icons-material/Extension";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaletteIcon from "@mui/icons-material/Palette";
import SettingsIcon from "@mui/icons-material/Settings";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { Signal } from "@inrixia/helpers";
import { metrics, wave } from "../tidalTokens";
import { PluginsTab } from "./PluginsTab";
import { PluginStoreTab } from "./PluginStoreTab";
import { SettingsTab } from "./SettingsTab";
import { SupportersTab } from "./SupportersTab";
import { ThemesTab } from "./ThemesTab";

type LunaSettingsTab = "Plugins" | "Plugin Store" | "Themes" | "Settings" | "Supporters";

const TABS: { value: LunaSettingsTab; icon: React.ElementType }[] = [
	{ value: "Plugins", icon: ExtensionIcon },
	{ value: "Plugin Store", icon: StorefrontIcon },
	{ value: "Themes", icon: PaletteIcon },
	{ value: "Settings", icon: SettingsIcon },
	{ value: "Supporters", icon: FavoriteIcon },
];

// Tidal's player bar overlays the bottom of the scroll container and nothing reserves space for
// it, so the last row of every tab used to sit underneath it. Tidal's own views reserve 112px.
const PLAYER_BAR_CLEARANCE = 128;

/** Custom tab bar: an underline indicator that slides between tabs, plus hover and icon transitions. */
const LunaTabs = React.memo(({ value, onChange }: { value: LunaSettingsTab; onChange: (t: LunaSettingsTab) => void }) => {
	const refs = useRef<Partial<Record<LunaSettingsTab, HTMLButtonElement | null>>>({});
	const [indicator, setIndicator] = useState({ left: 0, width: 0 });

	useLayoutEffect(() => {
		const el = refs.current[value];
		if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
	}, [value]);

	return (
		<Box sx={{ position: "relative", display: "flex", gap: 0.5, borderBottom: `1px solid ${wave.line}` }}>
			{TABS.map(({ value: tab, icon: Icon }) => {
				const active = tab === value;
				return (
					<Box
						key={tab}
						component="button"
						type="button"
						ref={(el: HTMLButtonElement | null) => {
							refs.current[tab] = el;
						}}
						onClick={() => onChange(tab)}
						sx={{
							all: "unset",
							boxSizing: "border-box",
							display: "flex",
							alignItems: "center",
							gap: 1,
							cursor: "pointer",
							paddingX: 1.75,
							paddingY: 1.25,
							borderRadius: `${wave.radiusSmall} ${wave.radiusSmall} 0 0`,
							fontFamily: wave.font,
							fontSize: 13,
							fontWeight: 600,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							color: active ? wave.text : wave.textTertiary,
							transition: "color 160ms ease, background-color 160ms ease",
							"&:hover": { color: wave.text, backgroundColor: wave.surfaceRaised },
							"&:focus-visible": { outline: `2px solid ${wave.accent}`, outlineOffset: -2 },
						}}
					>
						<Icon
							sx={{
								fontSize: 18,
								color: active ? wave.accent : "inherit",
								transition: "color 160ms ease, transform 160ms ease",
								transform: active ? "scale(1.05)" : "none",
							}}
						/>
						{tab}
					</Box>
				);
			})}
			<Box
				sx={{
					position: "absolute",
					bottom: -1,
					height: 2,
					borderRadius: 2,
					backgroundColor: wave.accent,
					left: `${indicator.left}px`,
					width: `${indicator.width}px`,
					transition: "left 240ms cubic-bezier(0.2, 0, 0, 1), width 240ms cubic-bezier(0.2, 0, 0, 1)",
					"@media (prefers-reduced-motion: reduce)": { transition: "none" },
				}}
			/>
		</Box>
	);
});

const TabContent = React.memo(({ tab }: { tab: LunaSettingsTab }) => {
	switch (tab) {
		case "Plugins":
			return <PluginsTab />;
		case "Plugin Store":
			return <PluginStoreTab />;
		case "Themes":
			return <ThemesTab />;
		case "Settings":
			return <SettingsTab />;
		case "Supporters":
			return <SupportersTab />;
	}
});

export const currentSettingsTab = new Signal<LunaSettingsTab>("Plugins");
export const LunaPage = React.memo(() => {
	const [currentTab, setCurrentTab] = React.useState(currentSettingsTab._);
	React.useEffect(() => {
		const unload = currentSettingsTab.onValue((tab) => setCurrentTab(tab));
		return () => {
			unload();
		};
	}, []);

	return (
		<Container maxWidth="lg" sx={{ padding: 0, flexGrow: 1 }}>
			<LunaTabs value={currentTab} onChange={(tab) => (currentSettingsTab._ = tab)} />
			<Box
				// key forces a remount per tab so the content animates in; also drops stale state
				key={currentTab}
				sx={{
					marginTop: 3,
					paddingBottom: `${PLAYER_BAR_CLEARANCE}px`,
					maxWidth: metrics.maxTextW,
					animation: "lunaTabIn 220ms cubic-bezier(0.2, 0, 0, 1)",
					"@keyframes lunaTabIn": {
						from: { opacity: 0, transform: "translateY(6px)" },
						to: { opacity: 1, transform: "none" },
					},
					"@media (prefers-reduced-motion: reduce)": { animation: "none" },
				}}
			>
				<TabContent tab={currentTab} />
			</Box>
		</Container>
	);
});

