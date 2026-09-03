/**
 * The plugin store renders the preview image of every listed plugin, so an unrestricted url would
 * let any listed author log the IP of everyone who opens the store. Images are therefore limited to
 * GitHub hosts, which is where the plugin code already comes from, and anything else is ignored so
 * the card falls back to its plain form.
 */
const ALLOWED_HOSTS = new Set(["github.com", "raw.githubusercontent.com", "user-images.githubusercontent.com", "objects.githubusercontent.com"]);

export const previewImageUrl = (image: unknown): string | undefined => {
	if (typeof image !== "string" || image === "") return undefined;
	let url: URL;
	try {
		url = new URL(image);
	} catch {
		return undefined;
	}
	if (url.protocol !== "https:") return undefined;
	if (!ALLOWED_HOSTS.has(url.hostname)) return undefined;
	return url.href;
};

/** Per plugin wins, otherwise the store wide default, otherwise off. */
export const showDownloadsFor = (pluginFlag: unknown, storeFlag: unknown): boolean =>
	typeof pluginFlag === "boolean" ? pluginFlag : storeFlag === true;
