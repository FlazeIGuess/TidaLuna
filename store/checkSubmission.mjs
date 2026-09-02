// Checks a store submitted through the issue form and prints a markdown report.
// Reads the issue body from ISSUE_BODY and the author from ISSUE_AUTHOR, both as env vars
// so nothing from an issue ever reaches a shell.
// Deliberately read only, it never writes to the repo. A human still merges the entry.
import { readFileSync } from "fs";
import { join } from "path";

const body = process.env.ISSUE_BODY ?? "";
const author = process.env.ISSUE_AUTHOR ?? "";
const token = process.env.GITHUB_TOKEN;

const URL_PATTERN = /^https:\/\/github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/releases\/download\/[^/\s]+\/store\.json$/;

const RETRY = "Edit the issue once it is fixed, the check runs again.";
const fail = (title, reason, hint, retry = true) => {
	console.log(`### ${title}\n\n${reason}\n\n${hint}${retry ? `\n\n${RETRY}` : ""}`);
	process.exit(0);
};

// GitHub issue forms render as "### Label" followed by the value
const field = (label) => {
	const match = body.split(/^### /m).find((section) => section.trim().toLowerCase().startsWith(label.toLowerCase()));
	return match?.split("\n").slice(1).join("\n").trim();
};

const url = field("store.json url");
if (!url) fail("Could not read the submission", "No store.json url found in the issue.", "Use the plugin store submission form so the fields can be read.");
if (!URL_PATTERN.test(url)) {
	fail(
		"Could not add this store",
		`\`${url.slice(0, 200)}\` is not a store.json release asset link.`,
		"It has to look like `https://github.com/you/luna-plugins/releases/download/latest/store.json`. A link to the repo or to a file in the git tree will not work, the client reads the release asset.",
	);
}

const repo = url.replace(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/releases\/.*$/, "$1");

const stores = JSON.parse(readFileSync(join(import.meta.dirname, "stores.json"), "utf8"));
const existing = stores.stores.find((entry) => entry.url === url);
if (existing !== undefined) {
	if (existing.status === "removed")
		fail(
			"This store was removed",
			`It is tombstoned with the reason: ${existing.reason}`,
			"Open a pull request explaining what changed if it should come back.",
			false,
		);
	fail("Already listed", "This store is in the registry already.", "It should show up in Luna Settings > Plugin Store, no action needed.", false);
}

const api = async (path) => {
	const res = await fetch(`https://api.github.com${path}`, {
		headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
};

const lines = [];
let blocking = 0;
const check = (ok, good, bad) => {
	lines.push(`- ${ok ? "✅" : "❌"} ${ok ? good : bad}`);
	if (!ok) blocking++;
};

let storeJson;
try {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	storeJson = await res.json();
	check(true, "store.json resolves");
} catch (err) {
	check(false, "", `store.json could not be fetched: ${err.message}`);
}

const name = storeJson?.name;
check(typeof name === "string" && name.length > 0, `Store name is \`${name}\``, "store.json has no name field");
const plugins = storeJson?.plugins;
check(
	Array.isArray(plugins) && plugins.length > 0 && plugins.every((plugin) => typeof plugin === "string"),
	`Lists ${plugins?.length} plugin${plugins?.length === 1 ? "" : "s"}`,
	"store.json needs a plugins array of file names",
);

let owner;
try {
	const info = await api(`/repos/${repo}`);
	owner = info.owner?.login;
	if (info.full_name !== repo) lines.push(`- ⚠️ Repo is now \`${info.full_name}\`, use that name in the entry`);
	if (info.archived) lines.push("- ⚠️ Repo is archived, it will show an Archived badge in the client");
} catch (err) {
	check(false, "", `Repo \`${repo}\` could not be read: ${err.message}`);
}

// Not blocking, a maintainer can still accept a submission on someone elses behalf
if (owner !== undefined) {
	const mine = owner.toLowerCase() === author.toLowerCase();
	lines.push(`- ${mine ? "✅" : "⚠️"} ${mine ? `\`@${author}\` owns \`${repo}\`` : `\`@${author}\` is not the owner of \`${repo}\` (\`@${owner}\` is)`}`);
}

const today = new Date().toISOString().slice(0, 10);
const entry = JSON.stringify({ name: name ?? "", repo, url, added: today }, null, "\t");

console.log(
	blocking > 0
		? `### Not ready yet\n\n${lines.join("\n")}\n\n${RETRY}`
		: `### Looks good\n\n${lines.join("\n")}\n\nEntry for \`store/stores.json\`:\n\n\`\`\`json\n${entry}\n\`\`\`\n\nA maintainer adds this and merges, it reaches clients about five minutes later.`,
);
