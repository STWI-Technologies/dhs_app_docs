const fs = require("fs");
const path = require("path");

const guideRoots = ["en", "es"].map((locale) =>
	path.join(process.cwd(), "public", locale)
);

const guideFiles = guideRoots.flatMap((guideRoot) =>
	fs
		.readdirSync(guideRoot)
		.filter((file) => file.endsWith(".html") && !["404.html", "index.html"].includes(file))
		.map((file) => path.join(guideRoot, file))
);

describe("guide HTML source content", () => {
	it("does not expose learning center or old scheduling CTAs", () => {
		const blockedPatterns = [
			/Visit Learning Center/i,
			/Schedule a Phone Call/i,
			/Schedule a Video Call/i,
			/Schedule a 1-on-1 Setup Call/i,
			/1-schedule-traininglanguage/i,
		];

		const offenders = guideFiles.flatMap((file) => {
			const html = fs.readFileSync(file, "utf8");
			return blockedPatterns
				.filter((pattern) => pattern.test(html))
				.map((pattern) => `${path.relative(process.cwd(), file)} contains ${pattern}`);
		});

		expect(offenders).toEqual([]);
	});

	it("uses the new booking CTA in each guide", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			return (
				!/Book a Demo or Training Session/i.test(html) ||
				!/https:\/\/directhomeservice\.com\/book-a-session/i.test(html)
			);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("keeps video sections in the source but hides them until final video URLs are ready", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			return /YouTube Video Embed|youtube\.com|Watch .* Tutorial/i.test(html) && !/data-section="video"[^>]*display:\s*none/i.test(html);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("uses shared app guide icons instead of inline SVG in guide HTML", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			return /<svg\b/i.test(html) || !/\/icons\/.+\.svg/i.test(html);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});
});
