// Run with: node --experimental-strip-types --test plugins/ui/src/SettingsPage/PluginStoreTab/registry.logic.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeVisible, planAdd, planCleanup, planMigration, planRemove, type RegistryState, type RegistryStore } from "./registry.logic.ts";

const store = (url: string, extra: Partial<RegistryStore> = {}): RegistryStore => ({
	name: url,
	repo: "owner/repo",
	url: `${url}/store.json`,
	...extra,
});

const DEFAULT = "https://github.com/Inrixia/luna-plugins/releases/download/dev";
const DEAD = "https://github.com/DevonCasey/tidaluna-plugins/releases/download/latest";
const MINE = "https://example.com/my-store";

const state = (over: Partial<RegistryState> = {}): RegistryState => ({
	registryStores: [store(DEFAULT), store(DEAD, { status: "removed", reason: "Repo deleted" })],
	userUrls: [],
	hiddenUrls: [],
	legacyUrls: [],
	patterns: [],
	...over,
});

const urls = (s: RegistryState) => mergeVisible(s).map((entry) => entry.url);

test("a store the user added survives migration", () => {
	const s = state({ legacyUrls: [DEFAULT, MINE] });
	assert.deepEqual(planMigration(s), [MINE]);
});

test("a registry default does not end up in userStoreUrls", () => {
	const s = state({ legacyUrls: [`${DEFAULT}/store.json`] });
	assert.deepEqual(planMigration(s), []);
});

test("a tombstoned store is dropped from the legacy list", () => {
	const s = state({ legacyUrls: [DEAD] });
	assert.deepEqual(planMigration(s), []);
	assert.ok(!urls(s).includes(DEAD));
});

test("a tombstoned store is dropped even if the user added it themselves", () => {
	const s = state({ userUrls: [DEAD, MINE] });
	assert.deepEqual(planCleanup(s).dropUser, [DEAD]);
});

test("removing a registry default hides it instead of deleting it", () => {
	const s = state();
	assert.deepEqual(planRemove(s, DEFAULT), { dropUser: undefined, hide: DEFAULT });
	const hidden = state({ hiddenUrls: [DEFAULT] });
	assert.ok(!urls(hidden).includes(DEFAULT), "stays gone after a restart");
	assert.deepEqual(planAdd(hidden, DEFAULT), { unhide: DEFAULT }, "re-adding it unhides rather than duplicating");
});

test("removing a user store deletes it outright", () => {
	const s = state({ userUrls: [MINE] });
	assert.deepEqual(planRemove(s, MINE), { dropUser: MINE, hide: undefined });
});

test("a new registry entry shows up with no local state", () => {
	const fresh = store("https://github.com/new/store/releases/download/latest");
	const s = state({ registryStores: [...state().registryStores, fresh] });
	assert.ok(urls(s).includes("https://github.com/new/store/releases/download/latest"));
});

test("no registry yet falls back to the legacy list", () => {
	const s = state({ registryStores: [], legacyUrls: [DEFAULT, MINE] });
	assert.deepEqual(urls(s), [DEFAULT, MINE]);
	// and stops using it the moment a registry lands
	assert.deepEqual(urls(state({ legacyUrls: [DEFAULT, MINE] })), [DEFAULT]);
});

test("blocked stores disappear from every source", () => {
	const patterns = [{ pattern: "https://evil.example.com/*", reason: "Malware" }];
	const evil = "https://evil.example.com/store";
	const s = state({ patterns, userUrls: [evil], legacyUrls: [evil] });
	assert.ok(!urls(s).includes(evil));
	assert.deepEqual(planCleanup(s).dropUser, [evil]);
	assert.equal(planAdd(s, evil), false);
	assert.deepEqual(planMigration(s), []);
});

test("hidden entries the registry forgot are cleaned up", () => {
	const s = state({ hiddenUrls: [DEFAULT, "https://gone.example.com/store"] });
	assert.deepEqual(planCleanup(s).dropHidden, ["https://gone.example.com/store"]);
});

test("trailing store.json is normalized everywhere", () => {
	const s = state();
	assert.deepEqual(planAdd(s, `${MINE}/store.json`), { add: MINE });
	assert.equal(planAdd(s, `${DEFAULT}/store.json`), false, "already visible through the registry");
});

test("the same store is never listed twice", () => {
	const s = state({ userUrls: [DEFAULT], legacyUrls: [DEFAULT] });
	assert.deepEqual(urls(s), [DEFAULT]);
});
