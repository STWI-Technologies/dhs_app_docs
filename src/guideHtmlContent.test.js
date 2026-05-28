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
			const videoStart = html.search(/<div data-section="video"[^>]*>/i);
			const nextSection = videoStart === -1 ? -1 : html.indexOf("\n        <!--", videoStart + 1);
			const videoSection = videoStart === -1 ? "" : html.slice(videoStart, nextSection === -1 ? html.length : nextSection);
			return (
				/YouTube Video Embed|youtube\.com|Want to See It In Action|¿Quieres verlo/i.test(html) &&
				!(
					videoSection &&
					/display:\s*none/i.test(videoSection) &&
					/(Want to See It In Action|¿Quieres verlo)/i.test(videoSection) &&
					/youtube\.com/i.test(videoSection)
				)
			);
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

	it("uses the same Estimates icon as the SP UI page header", () => {
		const html = fs.readFileSync(path.join(process.cwd(), "public", "en", "estimates.html"), "utf8");

		expect(html).toContain('<img src="/icons/clipboard-list.svg"');
		expect(html).not.toContain('<img src="/icons/invoice.svg"');
	});

	it("gives section headers a subtle background and consistent icon spacing", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			const sectionHeaders = [...html.matchAll(/<div[^>]*data-section-header="true"[^>]*>[\s\S]*?<\/div>/gi)];
			return (
				sectionHeaders.length < 2 ||
				sectionHeaders.some(([section]) => {
					return (
						!/background:\s*#F8F9FB/i.test(section) ||
						!/border:\s*1px solid #EEF0F4/i.test(section) ||
						!/border-radius:\s*8px/i.test(section) ||
						!/gap:\s*8px/i.test(section)
					);
				})
			);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("keeps full-width CTA buttons inside the guide gutters", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			const bookingCta = html.match(/<a href="https:\/\/directhomeservice\.com\/book-a-session"[^>]*>/i)?.[0] || "";
			return !/box-sizing:\s*border-box/i.test(bookingCta);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("includes a contact support CTA that asks the parent app to open support", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			const supportCta = html.match(/<a [^>]*data-support-contact="true"[^>]*>/i)?.[0] || "";
			return (
				!/Contact Support/i.test(html) ||
				!/DHS_OPEN_SUPPORT/i.test(supportCta) ||
				!/box-sizing:\s*border-box/i.test(supportCta)
			);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});
});
