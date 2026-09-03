import React from "react";
import type { ErrorInfo, ReactNode } from "react";

import { LunaPlugin, unloadSet, type PluginPackage } from "@luna/core";
import { store as obyStore } from "oby";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";

import { LunaSwitch } from "../../components";
import { LunaBadge, LunaExpandableRow } from "../../components/LunaList";
import { buttonSx, descSx, iconBtnSx, metaSx, oneLineSx, wave } from "../../tidalTokens";

class PluginSettingsErrorBoundary extends React.Component<{ name: string; children: ReactNode }, { error?: string }> {
	state: { error?: string } = {};
	static getDerivedStateFromError(error: Error) {
		return { error: error.message || String(error) };
	}
	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error(`[Luna] Plugin settings crashed for ${this.props.name}:`, error, info.componentStack);
	}
	render() {
		if (this.state.error === undefined) return this.props.children;
		return (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, paddingY: 1 }}>
				<ErrorOutlineRounded sx={{ fontSize: 16, color: wave.danger, flexShrink: 0 }} />
				<Typography title={this.state.error} sx={{ ...descSx, ...oneLineSx, color: wave.danger, flex: 1 }} children={`Settings crashed: ${this.state.error}`} />
				<Button disableRipple sx={buttonSx} onClick={() => this.setState({ error: undefined })} children="Retry" />
			</Box>
		);
	}
}

export interface LunaPluginSettingsProps {
	plugin: LunaPlugin;
	open: boolean;
	onToggle: () => void;
}

/**
 * One installed plugin as a collapsible row. The chevron indicates state, the whole header
 * toggles, and only the two verbs used constantly stay on the row: the enable switch and expand.
 * Reload, live reload and uninstall moved into the overflow menu, which took the row from five
 * icon buttons down to two controls.
 */
export const LunaPluginSettings = React.memo(({ plugin, open, onToggle }: LunaPluginSettingsProps) => {
	const [enabled, setEnabled] = React.useState(plugin.enabled);
	const [loading, setLoading] = React.useState(plugin.loading._);
	const [loadError, setLoadError] = React.useState(plugin.loadError._);
	const [installed, setInstalled] = React.useState(plugin.installed);
	const [pkg, setPackage] = React.useState<PluginPackage>(obyStore.unwrap(plugin.store.package));
	const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		const unloads = new Set([
			plugin.onSetEnabled((next) => setEnabled(next)),
			plugin.loading.onValue((next) => setLoading(next)),
			plugin.loadError.onValue((next) => setLoadError(next)),
			obyStore.on(
				() => plugin.store.package,
				() => setPackage(obyStore.unwrap(plugin.store.package)),
			),
			obyStore.on(
				() => plugin.installed,
				() => setInstalled(obyStore.unwrap(plugin.store.installed)),
			),
		]);
		return () => {
			unloadSet(unloads);
		};
	}, [plugin]);

	const handleReload = React.useCallback(plugin.reload.bind(plugin), [plugin]);
	const toggleEnabled = React.useCallback((_: unknown, checked: boolean) => (checked ? plugin.enable() : plugin.disable()), [plugin]);
	const uninstall = React.useCallback(plugin.uninstall.bind(plugin), [plugin]);

	if (!installed) return null;

	const isDev = plugin.store.url.startsWith("http://127.0.0.1");
	const name = pkg.name;
	const isCore = LunaPlugin.corePlugins.has(name);
	const Settings = plugin.exports?.Settings;
	const hasSettings = Settings !== undefined && Settings !== null;
	const link = pkg.homepage ?? pkg.repository?.url;
	const author = typeof pkg.author === "string" ? pkg.author : pkg.author?.name;

	const closeMenu = () => setMenuAnchor(null);
	const run = (fn: () => unknown) => () => {
		closeMenu();
		fn();
	};

	return (
		<LunaExpandableRow
			open={open}
			onToggle={onToggle}
			lead={
				loadError ? (
					<ErrorOutlineRounded sx={{ fontSize: 16, color: wave.danger }} />
				) : enabled ? (
					<CheckCircleRounded sx={{ fontSize: 16, color: wave.textSecondary }} />
				) : (
					<RadioButtonUncheckedRounded sx={{ fontSize: 16, color: wave.textTertiary }} />
				)
			}
			title={name}
			meta={
				<>
					{pkg.version && <Typography component="span" sx={{ ...metaSx, flex: "0 0 auto" }} children={pkg.version} />}
					{isDev && <LunaBadge children="Dev" />}
					{!enabled && !loadError && <LunaBadge children="Disabled" />}
					{loadError && <LunaBadge tone="danger" children="Load failed" />}
				</>
			}
			desc={loadError ? <Typography title={loadError} sx={{ ...metaSx, ...oneLineSx, color: wave.danger }} children={loadError} /> : (pkg.description ?? "No description")}
			trailing={
				<>
					{author && <Typography sx={{ ...metaSx, display: { xs: "none", sm: "block" } }} children={author} />}
					{!isCore && (
						<Tooltip title={enabled ? `Disable ${name}` : `Enable ${name}`}>
							<span onClick={(e) => e.stopPropagation()}>
								<LunaSwitch checked={enabled} loading={loading} onChange={toggleEnabled} />
							</span>
						</Tooltip>
					)}
					<IconButton
						disableRipple
						aria-label={`More actions for ${name}`}
						sx={iconBtnSx}
						onClick={(e) => {
							e.stopPropagation();
							setMenuAnchor(e.currentTarget);
						}}
						children={<MoreVertRounded />}
					/>
					<Menu
						anchorEl={menuAnchor}
						open={menuAnchor !== null}
						onClose={closeMenu}
						slotProps={{ paper: { sx: { backgroundColor: wave.surfaceRaised, border: `1px solid ${wave.line}`, boxShadow: "none" } } }}
					>
						<MenuItem sx={descSx} onClick={run(handleReload)} children="Reload" />
						{isDev && (
							<MenuItem
								sx={descSx}
								onClick={run(() => (plugin.store.liveReload = !plugin.store.liveReload))}
								children={plugin.store.liveReload ? "Live reload: on" : "Live reload: off"}
							/>
						)}
						{link && <MenuItem sx={descSx} onClick={run(() => window.open(link, "_blank"))} children="Open homepage" />}
						<MenuItem sx={descSx} onClick={run(() => navigator.clipboard?.writeText(plugin.store.url))} children="Copy URL" />
						{!isCore && <MenuItem sx={{ ...descSx, color: wave.danger }} onClick={run(uninstall)} children="Uninstall" />}
					</Menu>
				</>
			}
			panel={
				hasSettings ? (
					<PluginSettingsErrorBoundary name={name} children={<Settings />} />
				) : (
					<Typography sx={{ ...metaSx, paddingY: 1 }} children="This plugin has no settings." />
				)
			}
		/>
	);
});
