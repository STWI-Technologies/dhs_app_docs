const fs = require("fs");
const path = require("path");

const guideRoots = ["en", "es"].map((locale) =>
	path.join(process.cwd(), "public", locale)
);

const htmlIn = (dir) =>
	fs.existsSync(dir)
		? fs
				.readdirSync(dir)
				.filter((file) => file.endsWith(".html") && !["404.html", "index.html"].includes(file))
				.map((file) => path.join(dir, file))
		: [];

// Solo-plan variants live in a `solo/` subfolder per locale and must satisfy every
// rule the standard guides do — readdirSync does not recurse, so they are added
// explicitly rather than silently skipped.
const guideFiles = guideRoots.flatMap((guideRoot) => [
	...htmlIn(guideRoot),
	...htmlIn(path.join(guideRoot, "solo")),
]);

const localeOf = (file) => (file.split(path.sep).includes("es") ? "es" : "en");

// Every CTA label is authored in the guide's own language; the English copy must not
// leak into the Spanish panels.
const CTA_LABELS = {
	booking: { en: "Book a Demo or Training Session", es: "Agenda una demo o sesión de capacitación" },
	knowledgebase: { en: "View Knowledgebase", es: "Ver base de conocimiento" },
	support: { en: "Contact Support", es: "Contactar a soporte" },
	tutorial: { en: "Watch the Feature Tutorial", es: "Ver el tutorial de la función" },
};

const labelFor = (cta, file) => CTA_LABELS[cta][localeOf(file)];
const foreignLabelFor = (cta, file) => CTA_LABELS[cta][localeOf(file) === "es" ? "en" : "es"];

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

	it("uses the new booking CTA, in the guide's own language, in each guide", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			return (
				!html.includes(labelFor("booking", file)) ||
				html.includes(foreignLabelFor("booking", file)) ||
				!/https:\/\/directhomeservice\.com\/book-a-session/i.test(html)
			);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("uses manifest-backed video regions now that final video URLs are available", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			return (
				!/data-dhs-help-video-region/i.test(html) ||
				!/data-dhs-help-video/i.test(html) ||
				!/data-dhs-video-device="solo_mobile"/i.test(html) ||
				!/src="\/js\/help-video\.js" defer/i.test(html) ||
				/youtube\.com|youtu\.be/i.test(html)
			);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("ships the video region hidden so the tutorial heading never flashes while the manifest loads", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			return !/<div data-dhs-help-video-region hidden>/i.test(html);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("keeps crew and team references out of the solo-plan guides", () => {
		const soloFiles = guideFiles.filter((file) => file.split(path.sep).includes("solo"));
		expect(soloFiles.length).toBeGreaterThan(0);

		const offenders = soloFiles.flatMap((file) => {
			const html = fs.readFileSync(file, "utf8");
			return [/\bcrews?\b/i, /\bcuadrillas?\b/i, /\bequipos?\b/i]
				.filter((pattern) => pattern.test(html))
				.map((pattern) => `${path.relative(process.cwd(), file)} mentions ${pattern}`);
		});

		expect(offenders).toEqual([]);
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

	it("does not include the Jobs-only management features section", () => {
		const offenders = ["en", "es"].filter((locale) => {
			const html = fs.readFileSync(path.join(process.cwd(), "public", locale, "jobs.html"), "utf8");
			return /Job Management Features|Funciones de Gestión de Trabajos/i.test(html);
		});

		expect(offenders).toEqual([]);
	});

	it("adds breathing room between each guide title and subtitle", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			const headerBlock = html.match(/<div style="padding: 20px 15px; margin-top: 8px;">[\s\S]*?<\/div>\s*<p style="([^"]*)">/)?.[1] || "";
			return !/margin:\s*6px 0 0 0/i.test(headerBlock);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
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

	it("includes a contact support CTA that asks the parent app to open support on every guide", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			const supportCta = html.match(/<a [^>]*data-support-contact="true"[^>]*>/i)?.[0] || "";
			return (
				!html.includes(labelFor("support", file)) ||
				html.includes(foreignLabelFor("support", file)) ||
				!/DHS_OPEN_SUPPORT/i.test(supportCta) ||
				!/box-sizing:\s*border-box/i.test(supportCta)
			);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("includes a View Knowledgebase CTA that opens the knowledgebase in a new window on every guide", () => {
		const offenders = guideFiles.filter((file) => {
			const html = fs.readFileSync(file, "utf8");
			const knowledgebaseCta = html.match(/<a [^>]*data-knowledgebase-link="true"[^>]*>/i)?.[0] || "";
			return (
				!html.includes(labelFor("knowledgebase", file)) ||
				html.includes(foreignLabelFor("knowledgebase", file)) ||
				!/https:\/\/knowledgebase\.directhomeservice\.com\//i.test(knowledgebaseCta) ||
				!/target="_blank"/i.test(knowledgebaseCta) ||
				!/rel="noopener noreferrer"/i.test(knowledgebaseCta) ||
				!/box-sizing:\s*border-box/i.test(knowledgebaseCta)
			);
		});

		expect(offenders.map((file) => path.relative(process.cwd(), file))).toEqual([]);
	});

	it("uses the failed-QA source documents for appointments, checklists, reports, and timesheets panels", () => {
		const expectedContent = {
			"public/en/appointments.html": [
				/Organize site visits before the work begins/i,
				/Track status visually: Draft, Scheduled, En Route, Started, Completed, Canceled, No Show/i,
				/View Related Records: linked jobs, estimates, and invoices/i,
				/Convert completed appointments to Jobs, Estimates, or Invoices/i,
				/Link appointments as Callbacks to maintain job history/i,
			],
			"public/en/checklist.html": [
				/Ensure quality\. Standardize tasks\. Never miss a step\./i,
				/Create reusable task checklists/i,
				/Search, archive, and restore checklists as needed/i,
				/Duplicate and customize frequently used checklists for speed/i,
			],
			"public/en/reports.html": [
				/Time and Labor Reports/i,
				/Work Order Reports/i,
				/Technician Performance/i,
				/Compliance and Safety Reports/i,
				/Travel and Mileage Reports/i,
			],
			"public/en/reports-timesheet.html": [
				/Track time\. Manage labor\. Simplify payroll\./i,
				/Time Entry Categories/i,
				/En Route.*Travel time between jobs/i,
				/Office Time.*Admin, prep, or other non-field time/i,
				/Review unlinked entries regularly to ensure accuracy/i,
			],
		};

		const offenders = Object.entries(expectedContent).flatMap(([file, patterns]) => {
			const html = fs.readFileSync(path.join(process.cwd(), file), "utf8");
			return patterns
				.filter((pattern) => !pattern.test(html))
				.map((pattern) => `${file} missing ${pattern}`);
		});

		expect(offenders).toEqual([]);
	});
});
