// Run with: node --experimental-strip-types --test "plugins/**/*.test.ts"
import assert from "node:assert/strict";
import { test } from "node:test";

import { previewImageUrl, showDownloadsFor } from "./previewImage.ts";

test("a GitHub raw image is accepted", () => {
	const url = "https://raw.githubusercontent.com/me/luna-plugins/main/preview.png";
	assert.equal(previewImageUrl(url), url);
});

test("other GitHub hosts are accepted", () => {
	for (const host of ["github.com", "user-images.githubusercontent.com", "objects.githubusercontent.com"]) {
		assert.equal(previewImageUrl(`https://${host}/a/b.png`), `https://${host}/a/b.png`);
	}
});

test("a foreign host is rejected, so the store cannot be used to log viewers", () => {
	assert.equal(previewImageUrl("https://tracker.example.com/pixel.png"), undefined);
	assert.equal(previewImageUrl("https://raw.githubusercontent.com.evil.example/x.png"), undefined);
});

test("plain http is rejected", () => {
	assert.equal(previewImageUrl("http://raw.githubusercontent.com/a/b.png"), undefined);
});

test("missing or malformed values fall back to no image", () => {
	assert.equal(previewImageUrl(undefined), undefined);
	assert.equal(previewImageUrl(""), undefined);
	assert.equal(previewImageUrl("preview.png"), undefined);
	assert.equal(previewImageUrl(42), undefined);
});

test("downloads are off unless somebody opts in", () => {
	assert.equal(showDownloadsFor(undefined, undefined), false);
	assert.equal(showDownloadsFor(undefined, false), false);
});

test("a store can switch downloads on for all of its plugins", () => {
	assert.equal(showDownloadsFor(undefined, true), true);
});

test("a plugin overrides its store either way", () => {
	assert.equal(showDownloadsFor(true, false), true);
	assert.equal(showDownloadsFor(false, true), false);
});
