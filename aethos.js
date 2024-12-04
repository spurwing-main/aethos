function main() {
	// gsap.registerPlugin(GSDevTools);
	// GSDevTools.create();

	// Get themes
	(function () {
		// City Theme
		aethos.themes.city = {
			dark: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--terracotta--dark")
				.trim(),
			medium: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--terracotta--medium")
				.trim(),
			light: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--terracotta--light")
				.trim(),
			background: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--terracotta--bg")
				.trim(),
		};

		// Coast Theme
		aethos.themes.coast = {
			dark: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--sky--dark")
				.trim(),
			medium: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--sky--medium")
				.trim(),
			light: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--sky--light")
				.trim(),
			background: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--sky--bg")
				.trim(),
		};

		// Country Theme
		aethos.themes.country = {
			dark: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--leaf--dark")
				.trim(),
			medium: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--leaf--medium")
				.trim(),
			light: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--leaf--light")
				.trim(),
			background: getComputedStyle(document.documentElement)
				.getPropertyValue("--color--leaf--bg")
				.trim(),
		};
	})();

	/* load aethos settings */
	(function () {
		const pageWrap = document.querySelector(".page-wrap");

		if (pageWrap) {
			// Retrieve and store the aethos-page-bg, aethos-page, and aethos-page-loader attributes
			aethos.settings.pageWrap = pageWrap;
			aethos.settings.pageBg = pageWrap.getAttribute("aethos-page-bg") || "";
			aethos.settings.pageName =
				pageWrap.getAttribute("aethos-page-name") || "";
			aethos.settings.pageLoader =
				pageWrap.getAttribute("aethos-page-loader") || "";
			aethos.settings.destinationSlug =
				pageWrap.getAttribute("aethos-destination-slug") || "";
			aethos.settings.destinationStatus =
				pageWrap.getAttribute("aethos-destination-status") || "";
			const themeAttribute = pageWrap.getAttribute("aethos-theme");
			aethos.settings.theme = themeAttribute
				? themeAttribute.toLowerCase()
				: "";

			// Log the settings if debug mode is on
			aethos.log(`Page settings loaded: ${JSON.stringify(aethos.settings)}`);
		} else {
			aethos.log("No .page-wrap element found.");
		}
	})();

	/* load destination themes */
	(function () {
		const destinations = document.querySelectorAll(".dest-data_item");

		destinations.forEach((item) => {
			const slug = item.getAttribute("aethos-destination-slug");
			const theme = item.getAttribute("aethos-theme");
			const name = item.getAttribute("aethos-destination-name") || slug;
			const status = item.getAttribute("aethos-status") || "active";

			aethos.destinations[slug] = {
				name: name,
				slug: slug,
				theme: theme,
				status: status,
			};
		});

		aethos.log("Destination data loaded");
	})();

	/* redirect if destination is coming soon */
	(function () {
		// Construct the destination homepage URL
		const destinationHomepageUrl = `/destinations/${aethos.settings.destinationSlug}`;

		// Check if we need to redirect
		if (
			aethos.settings.destinationStatus == "coming soon" &&
			aethos.settings.destinationSlug &&
			window.location.pathname !== destinationHomepageUrl
		) {
			// Redirect to the destination homepage
			window.location.href = destinationHomepageUrl;
		}
	})();

	/* update any relative destination links */
	aethos.functions.updateRelativeLinks = function () {
		// Step 1: Ensure `aethos` and `aethos.settings` are available
		if (!aethos || !aethos.settings) {
			console.warn(
				"Aethos settings not found. Skipping relative links update."
			);
			return;
		}

		// Step 2: Retrieve `destinationSlug` from settings
		const destinationSlug = aethos.settings.destinationSlug;

		// Step 3: If `destinationSlug` is not available, exit gracefully
		if (!destinationSlug) {
			aethos.log(
				"Destination slug not found. Assuming this is not a destination page. Skipping relative links update."
			);
			return;
		}

		// Step 4: Select all links with the `aethos-relative-link` attribute
		const relativeLinks = document.querySelectorAll(
			'a[aethos-relative-link][href^="./"], a[aethos-relative-link][href^="http://./"]'
		);

		// Step 5: If no links found, log and exit
		if (relativeLinks.length === 0) {
			aethos.log(
				"No links with aethos-relative-link attribute and './' or 'http://./' href found."
			);
			return;
		}

		// Step 6: Iterate over each link and update it
		relativeLinks.forEach((link) => {
			// Ensure the href attribute is available
			const originalHref = link.getAttribute("href");
			if (!originalHref) {
				console.warn(
					"Href attribute is missing on one of the links. Skipping this link.",
					link
				);
				return;
			}

			// Determine the relative path by handling both "./" and "http://./" cases
			const relativePath = originalHref.startsWith("http://./")
				? originalHref.substring(8) // Removes "http://./"
				: originalHref.substring(2); // Removes "./"

			// Construct the new href with the destination slug
			const newHref = `/destinations/${destinationSlug}/${relativePath.replace(
				/^\/+/,
				""
			)}`;

			// Update the href of the link
			link.setAttribute("href", newHref);

			// Log success message for each updated link
			aethos.log(`Link updated successfully: ${originalHref} ➔ ${newHref}`);
		});
	};

	// Execute the function
	aethos.functions.updateRelativeLinks();

	// Open all external links in a new tab
	(function openExternalLinksInNewTab() {
		const links = document.querySelectorAll(
			"a[href^='https://'], a[href^='http://']"
		);
		const host = window.location.hostname;

		const isInternalLink = (link) => new URL(link).hostname === host;

		links.forEach((link) => {
			if (isInternalLink(link)) return;

			link.setAttribute("target", "_blank");
			link.setAttribute("rel", "noopener");
		});
	})();

	/* helper to get a custom prop value */
	aethos.helpers.getProp = function (
		propName,
		element = document.documentElement
	) {
		const value = getComputedStyle(element).getPropertyValue(propName).trim();
		if (!value) {
			console.warn(`CSS property "${propName}" not found on the element.`);
		} else {
			// aethos.log(value);
		}
		return value;
	};

	/* register GSAP plugins */
	gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother);

	// /* GSAP config */
	// ScrollTrigger.config({
	// 	ignoreMobileResize: true,
	// 	autoRefreshEvents:
	// 		"DOMContentLoaded,load" /* we remove 'resize' and 'visibilitychange' to avoid unwanted re-animations https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/ */,
	// });

	/* set up GSAP smooth scroll */
	aethos.anim.smoothScroll = function () {
		gsap.registerPlugin(ScrollSmoother);

		aethos.smoother = ScrollSmoother.create({
			smooth: 1,
			effects: true,
			content: "#smooth-content",
			wrapper: "#smooth-wrapper",
			normalizeScroll: true,
			onUpdate: () => {},
			onRefresh: () => {
				// Ensure the scroll trigger is refreshed once the smooth scroll has recalculated the height
				ScrollTrigger.refresh();
			},
		});

		// disable normalise on mobile
		let mm = gsap.matchMedia();
		mm.add(`(max-width: ${aethos.breakpoints.mbl}px)`, () => {
			console.log("normalise scroll disabled");
			ScrollTrigger.normalizeScroll(false);

			return () => {
				// optional
				console.log("normalise scroll enabled");

				ScrollTrigger.normalizeScroll(true);
			};
		});
	};

	/* add class to <body> when .nav is open. Used for animating nav burger icon */
	aethos.functions.nav = function () {
		aethos.helpers.globalNavClass = "nav-open";
		aethos.helpers.destNavClass = "dest-nav-open";
		aethos.helpers.clubNavClass = "club-nav-open";

		function handleResize() {
			// default - remove global nav class on mbl and smaller on close
			if (aethos.settings.theme == "default" || !aethos.settings.theme) {
				if (window.innerWidth <= aethos.breakpoints.mbl) {
					document.body.classList.remove(aethos.helpers.globalNavClass);
					ScrollTrigger.normalizeScroll(true); // Ensure normalization is back on
				}
			}
			// dest - remove dest nav class on tab and smaller on close
			if (
				aethos.settings.theme &&
				aethos.settings.theme !== "default" &&
				aethos.settings.theme !== "club"
			) {
				if (window.innerWidth <= aethos.breakpoints.tab) {
					document.body.classList.remove(aethos.helpers.destNavClass);
					document.body.classList.remove(aethos.helpers.globalNavClass);
					ScrollTrigger.normalizeScroll(true); // Ensure normalization is back on
				}
			}
			if (aethos.settings.theme == "club") {
				if (window.innerWidth <= aethos.breakpoints.tab) {
					document.body.classList.remove(aethos.helpers.clubNavClass);
					document.body.classList.remove(aethos.helpers.globalNavClass);
					ScrollTrigger.normalizeScroll(true); // Ensure normalization is back on
				}
			}
		}

		// Check for nav buttons before adding event listeners
		const navBtn = document.querySelector(".nav-btn");

		if (navBtn) {
			navBtn.addEventListener("click", () => {
				const isNavOpen = document.body.classList.toggle(
					aethos.helpers.globalNavClass
				);
				if (isNavOpen) {
					console.log("normalise scroll off");
					ScrollTrigger.normalizeScroll(false); // Turn off scroll normalization when nav is open
				} else {
					console.log("normalise scroll on");

					ScrollTrigger.normalizeScroll(true); // Re-enable scroll normalization when nav is closed
				}
			});
		}

		// Add resize event listener to handle window resizing - for width only
		var prevWidth = window.innerWidth;
		window.addEventListener("resize", function () {
			var width = window.innerWidth;
			if (width !== prevWidth) {
				prevWidth = width;
				handleResize();
			}
		});

		// Initial check in case the page loads in mobile size
		handleResize();
	};

	/* nav hide/show */
	aethos.anim.navReveal = function () {
		// if we are on a non-destination page...
		if (!aethos.settings.theme || aethos.settings.theme == "default") {
			const navReveal = gsap
				.from(".header", {
					yPercent: -100,
					paused: true,
					duration: 0.5,
				})
				.progress(1);

			ScrollTrigger.create({
				start: "top -1px",
				end: "max",
				pin: ".header",
				onUpdate: (self) => {
					self.direction === -1 ? navReveal.play() : navReveal.reverse();
				},
			});
		} else if (aethos.settings.theme == "club") {
			ScrollTrigger.create({
				start: "top -1px",
				end: "max",
				pin: ".club-header",
			});
		} else {
			ScrollTrigger.create({
				start: "top -1px",
				end: "max",
				pin: ".dest-header",
			});
		}
	};

	/* Basic slide and fade animation */
	aethos.anim.fadeUp = function () {
		const getAnimAttr = (el, attr, defaultValue) => {
			const value = el.getAttribute(attr);
			return value !== null ? parseFloat(value) : defaultValue;
		};

		// For elements that are their own trigger
		const self_targets = gsap.utils.toArray(".anim_fade-up_self");
		self_targets.forEach((target) => {
			// Fetch animation attributes with defaults
			const opacity_duration = getAnimAttr(
				target,
				"aethos-anim-duration-opacity",
				1
			);
			const y_duration = getAnimAttr(target, "aethos-anim-duration-y", 0.8);
			const y = getAnimAttr(target, "aethos-anim-y", 20);
			const start =
				target.getAttribute("aethos-anim-scroll-start") ?? "top 80%";

			// Initial setup
			gsap.set(target, { y: y, opacity: 0 });

			// Create animation timeline
			gsap
				.timeline({
					scrollTrigger: {
						trigger: target,
						start: start,
						scrub: false,
					},
				})
				.to(target, { y: 0, duration: y_duration })
				.to(target, { opacity: 1, duration: opacity_duration }, "<");
		});

		// For elements that have a different trigger
		const triggers = gsap.utils.toArray(".anim_fade-up_trigger");
		triggers.forEach((trigger) => {
			// Fetch animation attributes with defaults
			const stagger = getAnimAttr(trigger, "aethos-anim-stagger", 0);
			const y = getAnimAttr(trigger, "aethos-anim-y", 20);
			const opacity_duration = getAnimAttr(
				trigger,
				"aethos-anim-duration-opacity",
				1
			);
			const y_duration = getAnimAttr(trigger, "aethos-anim-duration-y", 0.8);
			const start =
				trigger.getAttribute("aethos-anim-scroll-start") ?? "top 70%";

			// Initial setup for target elements within the trigger
			const targets = trigger.querySelectorAll(".anim_fade-up_target");
			gsap.set(targets, { y: y, opacity: 0 });

			// Create animation timeline with stagger
			gsap
				.timeline({
					scrollTrigger: {
						trigger: trigger,
						start: start,
						scrub: false,
					},
				})
				.to(targets, { y: 0, duration: y_duration, stagger: stagger })
				.to(
					targets,
					{ opacity: 1, duration: opacity_duration, stagger: stagger },
					"<"
				);
		});
	};

	/* arch animation */
	aethos.anim.arch = function () {
		/* get all arch triggers on page */
		let arch_triggers = document.querySelectorAll(".anim-arch_trigger");
		arch_triggers.forEach((trigger) => {
			/* get the clip paths */
			let arch_path = document.querySelector("#shape-arch path"); // front img SVG clip path
			let arch_path_bg = document.querySelector("#shape-arch-bg path"); // bg image SVG clip path
			let arch_arch = gsap.utils.toArray(".anim-arch_arch", trigger); // the actual clip elements
			let arch_logo = trigger.querySelector(".contact-hero_media-logo"); // logo - only exists on contact hero

			gsap.set(arch_path, {
				transformOrigin: "bottom left",
			});

			let arch_h = 0.2; // the amount of vertical straight bit of the arch on load
			let arch_d =
				"M0.001,0.559 c0,-0.198,0.219,-0.359,0.489,-0.359 h0.023 c0.27,0,0.489,0.161,0.489,0.359 v" +
				arch_h +
				"H0.001 v-" +
				arch_h;

			// timeline and scroll trigger. Trigger element is the default position of the img wrapper, the same as the top of the text
			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: trigger,
					start: "20% 95%",
					// markers: true,
				},
			});

			tl.timeScale(0.75);

			if (aethos.settings.pageName == "contact") {
				tl.timeScale(1.5);
			}

			// move whole element (incl bg image) up
			tl.from(arch_arch, {
				y: "90%",
				duration: 1.75,
				ease: "power1.inOut",
			});

			// extend both fg & bg clipping paths to make arches 'taller'
			// also apply a transform up
			tl.from(
				[arch_path, arch_path_bg],
				{
					attr: {
						d: arch_d,
					},
					y: 0.2,
					duration: 1.5,
					ease: "power1.inOut",
				},
				"<+=0.4" // start anim 0.4 after start of prev anim
			);

			// scale fg path up
			tl.from(
				arch_path,
				{
					scale: 0.9,
					duration: 1,
					ease: "power1.inOut",
				},
				"<+=0.4" // start anim 0.4 after start of prev anim
			);

			if (arch_logo) {
				tl.from(
					arch_logo,
					{
						opacity: 0,
						duration: 1,
						ease: "power1.inOut",
					},
					"<+=0.4" // start anim 0.4 after start of prev anim
				);
			}
		});
	};

	/* short arch animation on Destination Homepage */
	aethos.anim.arch_short = function () {
		/* get all arch triggers on page */
		let arch_triggers = document.querySelectorAll(".anim-arch-short_trigger");
		arch_triggers.forEach((trigger) => {
			let arch_path_short = document.querySelector("#shape-arch-short path"); // short front img SVG clip path - used on Destination Homepage
			let arch_arch = gsap.utils.toArray(".anim-arch-short_arch", trigger); // the actual clip elements inside the trigger
			gsap.set(arch_path_short, {
				transformOrigin: "bottom center",
			});

			// timeline and scroll trigger. Trigger element is the default position of the img wrapper, the same as the top of the text
			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: trigger,
					start: "20% 95%",
					markers: false,
				},
			});

			// move whole element (incl bg image) up
			tl.from(arch_arch, {
				y: "90%",
				duration: 1.75,
				ease: "power1.inOut",
			});

			//  apply a transform up to clip path
			tl.from(
				arch_path_short,
				{
					y: 0.2,
					duration: 1.5,
					ease: "power1.inOut",
				},
				"<+=0.4"
			);

			// scale clip path up
			tl.from(
				arch_path_short,
				{
					scale: 0.9,
					duration: 1,
					ease: "power1.inOut",
				},
				"<+=0.4"
			);
		});
	};

	/* stagger in anim - used in Destination Homepage Intro second part */
	aethos.anim.staggerIn = function () {
		/* get all stagger sections on page */
		/* we use a wrapper section to help us associate trigger to items easily, ie where the trigger is not necessarily a parent of the animated items */
		let stagger_sections = document.querySelectorAll(".anim-stagger-in_sect");
		stagger_sections.forEach((section) => {
			// get trigger - either current section, or a descendent
			let trigger;
			if (section.classList.contains("anim-stagger-in_trigger")) {
				trigger = section;
			} else {
				trigger = section.querySelector(".anim-stagger-in_trigger");
			}
			let items = gsap.utils.toArray(".anim-stagger-in_item", section); // elements to animate

			// Check if the trigger element has the `aethos-trigger-start` attribute

			if (!trigger) {
				return;
			}
			let startValue =
				trigger.getAttribute("aethos-trigger-start") || "20% 80%";

			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: trigger,
					start: startValue, // Use the attribute value if present, otherwise default to "20% 80%"
					markers: false,
				},
			});

			gsap.set(items, {
				y: 20,
				// autoAlpha: 0, // set with critical CSS
			});

			tl.to(items, { y: 0, duration: 0.5, stagger: 0.25 });
			tl.to(items, { autoAlpha: 1, duration: 2, stagger: 0.25 }, "<"); // opacity anim is slightly longer
		});
	};

	/* add class when filter drawer is opened/closed */
	aethos.anim.filterDrawerOpenClose = function () {
		document.querySelectorAll(".grid-header_filter-btn").forEach((trigger) => {
			trigger.addEventListener("click", function () {
				this.x = ((this.x || 0) + 1) % 2;
				if (this.x) {
					this.closest(".card-grid-header").classList.add("is-open");
				} else {
					this.closest(".card-grid-header").classList.remove("is-open");
				}
			});
		});
	};

	/* lets us detect when one child in a group is hovered over, so we can style the others - e.g. nav links on desktop */
	aethos.anim.HoverTrigger = function () {
		const hover_triggers = document.querySelectorAll(".hover-trigger");
		hover_triggers.forEach((trigger) => {
			const parent = trigger.closest(".hover-trigger-parent");
			trigger.addEventListener("mouseover", function () {
				trigger.classList.add("is-active");
				parent.classList.add("is-child-active");
			});
			trigger.addEventListener("mouseout", function () {
				trigger.classList.remove("is-active");
				parent.classList.remove("is-child-active");
			});
		});
	};

	/* Show nav images on nav link hover */
	aethos.anim.NavImage = function () {
		const navLinkTriggers = document.querySelectorAll(
			".anim-nav-img_trigger[data-link-id]"
		);
		const navLinkImgs = document.querySelectorAll(
			".anim-nav-img_target[data-link-id]"
		);
		const navLinkImgDefault = document.querySelector(
			".nav_img-wrap.is-default"
		);

		navLinkImgDefault.classList.add("is-active");

		navLinkTriggers.forEach((link) => {
			link.addEventListener("mouseenter", () => {
				const linkId = link.getAttribute("data-link-id");
				let imageFound = false;

				navLinkImgs.forEach((img) => {
					if (img.getAttribute("data-link-id") === linkId) {
						img.classList.add("is-active");
						imageFound = true;
					} else {
						img.classList.remove("is-active");
					}
				});

				// Toggle default image visibility
				navLinkImgDefault.classList.toggle("is-active", !imageFound);
			});

			link.addEventListener("mouseleave", () => {
				navLinkImgs.forEach((img) => img.classList.remove("is-active"));
				navLinkImgDefault.classList.add("is-active");
			});
		});
	};

	/* animated text effect 1 */
	aethos.anim.splitText = function () {
		let typeSplit;
		const targetClass = "anim-split";
		const linesClass = "anim-split_line";
		const maskClass = "anim-split_line-mask";

		function runSplit() {
			// Revert any previous SplitText instance
			if (typeSplit) {
				typeSplit.revert();
			}

			// Create new SplitText instance
			typeSplit = new SplitText("." + targetClass, {
				types: "lines",
				linesClass: linesClass,
			});

			// Append masks to each line
			$("." + linesClass).append(`<div class="${maskClass}"></div>`);

			// Create the animation once
			createAnimation();
		}

		function createAnimation() {
			const trigger = document.querySelector("." + targetClass);
			const lines = $("." + linesClass);

			gsap
				.timeline({
					scrollTrigger: {
						trigger: trigger,
						start: "top 90%",
						end: "bottom 10%",
						scrub: true,
					},
				})
				.to(lines.find("." + maskClass), {
					width: "0%",
					duration: 1,
					ease: "power2.out",
					stagger: 0.5,
				});
		}

		// Run the split and animation once
		runSplit();

		// Revert split on window resize without reanimating
		let windowWidth = $(window).innerWidth();
		window.addEventListener("resize", () => {
			if (windowWidth !== $(window).innerWidth()) {
				windowWidth = $(window).innerWidth();
				typeSplit.revert();
			}
		});
	};

	/* animated text effect 2 */
	aethos.anim.splitTextBasic = function () {
		const targets = document.querySelectorAll(".anim-split-basic");

		function setupSplits() {
			targets.forEach((target) => {
				// Revert SplitText instance if it exists
				if (target.split) {
					target.split.revert();
				}

				// Create a new SplitText instance
				target.split = new SplitText(target, {
					type: "lines",
				});

				// Set up the animation once
				if (!target.animInitialized) {
					target.animInitialized = true;
					gsap.from(target.split.lines, {
						scrollTrigger: {
							trigger: target,
							start: "top 70%",
							toggleActions: "play none none none",
						},
						opacity: 0,
						duration: 1,
						stagger: 1 / target.split.lines.length,
					});
				}
			});
		}

		// Initialize splits once
		setupSplits();

		// Revert on window resize without reanimating
		let windowWidth = window.innerWidth;
		window.addEventListener("resize", () => {
			if (windowWidth !== window.innerWidth) {
				windowWidth = window.innerWidth;
				targets.forEach((target) => {
					if (target.split) {
						target.split.revert();
					}
				});
			}
		});
	};

	/* Carousel Animations */
	aethos.anim.carousel = function () {
		/* Utility Functions */

		// Set up pagination dots
		function setupPagination(pagination, slideCount, dotClass) {
			pagination.innerHTML = ""; // Clear existing dots
			const dots = [];
			for (let i = 0; i < slideCount; i++) {
				const dot = document.createElement("div");
				dot.classList.add(dotClass);
				pagination.appendChild(dot);
				dots.push(dot);
				if (i === 0) {
					dot.classList.add("is-active"); // Make first dot active
				}
			}
			pagination.style.display = "flex"; // Make pagination visible
			return dots;
		}

		// Set up slide counters
		function setupCounters(counters, slideCount) {
			const totalCounter = counters.querySelector(
				".room-card_counter-item.is-total"
			);
			const activeCounter = counters.querySelector(
				".room-card_counter-item.is-active"
			);
			if (totalCounter) totalCounter.innerHTML = slideCount;
			counters.style.display = "flex"; // Make counters visible
			return activeCounter;
		}

		// Hide pagination and counters
		function hidePaginationAndCounters(pagination, counters) {
			if (pagination) pagination.style.display = "none";
			if (counters) counters.style.display = "none";
		}

		// Initialize Splide for a carousel
		function initializeSplide(carousel, pagination, counters) {
			const splideInstance = new Splide(carousel, {
				type: "loop",
				perPage: 1,
				perMove: 1,
				autoplay: false,
				pagination: false,
				arrows: false,
				drag: true,
			}).mount();

			splideInstance.on("move", (newIndex) => {
				if (counters) {
					const activeCounter = counters.querySelector(
						".room-card_counter-item.is-active"
					);
					if (activeCounter) activeCounter.innerHTML = newIndex + 1;
				}
				if (pagination) {
					const dots = pagination.querySelectorAll(".room-card_pagination-dot");
					dots.forEach((dot, index) =>
						dot.classList.toggle("is-active", index === newIndex)
					);
				}
			});

			aethos.log("Splide carousel initialized.");
		}

		// Generic carousel initializer
		function initializeCarousel(container, config) {
			const mediaList = container.querySelector(config.mediaListSelector);
			if (!mediaList) return;

			const slides = Array.from(
				mediaList.querySelectorAll(config.slideSelector)
			).slice(0, config.maxSlides || Infinity);
			const slideCount = slides.length;

			const pagination = container.querySelector(config.paginationSelector);
			const counters = container.querySelector(config.countersSelector);

			if (slideCount < 2) {
				hidePaginationAndCounters(pagination, counters);
				return;
			}

			const dots = pagination
				? setupPagination(pagination, slideCount, config.dotClass)
				: null;
			const activeCounter = counters
				? setupCounters(counters, slideCount)
				: null;

			const splideEl =
				container.querySelector(".splide") || mediaList.closest(".splide");
			if (splideEl) {
				initializeSplide(splideEl, pagination, counters);
			}
		}

		/* Carousel Types */

		// Block Carousel
		function blockCarousel() {
			document.querySelectorAll(".block").forEach((block) => {
				initializeCarousel(block, {
					mediaListSelector: ".block_media-list",
					slideSelector: ".img-wrap",
					paginationSelector: ".block_pagination",
					countersSelector: null,
					dotClass: "block_pagination-dot",
					maxSlides: Infinity, // No limit on slides
				});
			});
		}

		// Room Card Carousel
		function roomCardCarousel() {
			document.querySelectorAll(".room-card").forEach((roomCard) => {
				initializeCarousel(roomCard, {
					mediaListSelector: ".room-card_media-list",
					slideSelector: ".img-wrap",
					paginationSelector: ".room-card_pagination",
					countersSelector: ".room-card_counters",
					dotClass: "room-card_pagination-dot",
					maxSlides: 8, // Limit to 8 slides
				});
			});
		}

		// CMS Carousels
		function loadCMSCarousels() {
			document
				.querySelectorAll("[aethos-cms-carousel='enabled']")
				.forEach((carouselSection) => {
					const slug = carouselSection.getAttribute("aethos-cms-carousel-slug");
					const path = carouselSection.getAttribute("aethos-cms-carousel-path");
					const maxSlides =
						parseInt(carouselSection.getAttribute("aethos-cms-carousel-max")) ||
						8;

					const carousel = carouselSection.querySelector(".cms-carousel");
					if (!carousel) return;

					const setupCarousel = (carouselInner) => {
						initializeCarousel(carouselSection, {
							mediaListSelector: ".cms-carousel_inner",
							slideSelector: ".cms-carousel_list-item",
							paginationSelector: ".room-card_pagination",
							countersSelector: ".room-card_counters",
							dotClass: "room-card_pagination-dot",
							maxSlides: maxSlides,
						});
					};

					if (slug && path) {
						ScrollTrigger.create({
							trigger: carouselSection,
							start: "top 150%",
							onEnter: () => {
								fetch(`${path}/${slug}`)
									.then((response) => response.text())
									.then((html) => {
										const parser = new DOMParser();
										const doc = parser.parseFromString(html, "text/html");
										const carouselInner = doc.querySelector(
											".page-resources .cms-carousel_inner"
										);

										if (carouselInner) {
											carousel.innerHTML = "";
											carousel.appendChild(carouselInner);
											setupCarousel(carouselInner);
										}
									})
									.catch((error) =>
										console.error("Error fetching carousel:", error)
									);
							},
							once: true,
						});
					} else {
						setupCarousel(carousel.querySelector(".cms-carousel_inner"));
					}
				});
		}

		/* Initialize All Carousels */
		blockCarousel();
		roomCardCarousel();
		loadCMSCarousels();
	};

	/* create sliders */
	aethos.anim.loadSliders = function () {
		/* splide defaults */
		Splide.defaults = {
			perMove: 1,
			gap: "0rem",
			arrows: false,
			pagination: false,
			focus: "center",
			flickPower: 400,
			speed: 600,
			dragAngleThreshold: 60,
			autoWidth: false,
			rewind: false,
			rewindSpeed: 400,
			waitForTransition: false,
			updateOnMove: true,
			trimSpace: "move" /* removes space at end */,
			type: "slide",
			drag: "free" /* required to disable snapping */,
			snap: false /* required to disable snapping */,
			autoWidth: false,
			autoplay: false,
		};

		function initializeSplide({
			selector,
			options,
			useExtensions = false,
			useProgressBar = false,
		}) {
			let targets = document.querySelectorAll(selector);
			let splides = [];

			const isMobile = () => window.innerWidth <= aethos.breakpoints.mbl;

			targets.forEach((target) => {
				let splide = new Splide(target, options);

				let list = target.querySelector(".splide__list");
				let track = target.querySelector(".splide__track");

				track.style.overscrollBehavior = "none";

				let progressWrapper, bar, observer;
				const enableProgressBar = () => {
					progressWrapper = target.querySelector(".progress");
					bar = target.querySelector(".progress_bar");

					if (!bar || !progressWrapper || !list) return;

					let lastTransform = "";

					// Helper function to calculate progress rate
					const getRate = () => {
						const { Layout, Move, Direction, Slides } = splide.Components;
						const position = Direction.orient(Move.getPosition());
						// const base = Layout.listSize(); // Visible size of the slider
						const base = Layout.sliderSize(); // Computed size of the slider
						const containerW = target.getBoundingClientRect().width;
						adjustedBase = base - containerW;

						let rate = 0;
						if (splide.options.type === "loop") {
							rate = Math.abs(
								Math.abs(position / adjustedBase) - 1 / Slides.get(true).length
							);
						} else {
							rate = position / adjustedBase + 0 / splide.length;
						}
						// console.log(
						// 	`Base: ${base}, Adusted base: ${adjustedBase}, Position: ${position}, Rate: ${rate},`
						// );
						return rate;
					};

					// Update the progress bar position
					const updateProgressBar = () => {
						const rate = getRate();

						// Calculate the maximum translation value
						const maxTranslateX = progressWrapper.offsetWidth - bar.offsetWidth;

						// Calculate the current position of the bar
						const translateX = rate * maxTranslateX;

						// Apply the transform
						bar.style.transform = `translateX(${translateX}px)`;
					};

					// Detect changes to the .splide__list element's transform
					const observer = new MutationObserver(() => {
						const currentTransform = list.style.transform;

						if (currentTransform !== lastTransform) {
							lastTransform = currentTransform;
							updateProgressBar();
						}
					});

					// Observe changes to the style attribute
					observer.observe(list, {
						attributes: true,
						attributeFilter: ["style"],
					});

					// Clean up when not needed
					splide.on("destroy", () => {
						observer.disconnect();
					});

					// Initial update
					splide.on("mounted", () => {
						updateProgressBar();
					});
				};

				const disableProgressBar = () => {
					if (observer) observer.disconnect();
					if (bar) bar.style.transform = ""; // Reset the bar position
				};

				// Handle mobile or desktop
				const handleResize = () => {
					if (isMobile()) {
						disableProgressBar();
					} else {
						enableProgressBar();
					}
				};

				// Initial check
				if (!isMobile() && useProgressBar) {
					enableProgressBar();
				}

				// Listen for window resize
				window.addEventListener("resize", handleResize);

				splide.on("destroy", () => {
					window.removeEventListener("resize", handleResize);
				});

				// Mount splide instance with or without extensions
				if (useExtensions) {
					splide.mount(window.splide.Extensions);
				} else {
					splide.mount();
				}

				splides.push(splide);
			});

			return splides;
		}

		/* declare slider selectors, options and any callback functions */
		const sliders = [
			{
				selector: ".carousel",
				options: {
					type: "slide",
					autoWidth: true,
					autoScroll: {
						autoStart: false,
					},
					focus: 0,
					trimSpace: "move",
				},
				useExtensions: false,
				useProgressBar: true,
			},
			{
				selector: ".carousel-square_inner",
				options: {
					type: "slide",
					autoWidth: true,
					autoScroll: {
						autoStart: false,
					},
					focus: 0,
					trimSpace: "move",
					arrows: true,
				},
				useExtensions: false,
				useProgressBar: false,
			},
			{
				selector: ".c-carousel-loose",
				options: {
					type: "slide",
					autoWidth: true,
					autoScroll: {
						autoStart: false,
					},
					focus: 0,
					trimSpace: "move",
					arrows: false,
				},
				useExtensions: false,
				useProgressBar: true,
			},
		];

		/* loop through and initialize each slider */
		sliders.forEach(initializeSplide);
	};

	/* About page Values section */
	aethos.anim.values = function () {
		// only run for larger screen
		let mm = gsap.matchMedia();

		// add a media query. When it matches, the associated function will run

		// get all values components on page
		let valuesSections = document.querySelectorAll(".s-values");
		valuesSections.forEach((section) => {
			// dsk list
			let list_dsk = section.querySelector(".values_dsk .values_list");
			// mbl list
			let list_mbl = section.querySelector(".values_mbl .values_list");

			// assemble the component
			let values = list_dsk.querySelectorAll(".values_item");
			values.forEach((value) => {
				// clone the value
				let value_clone = value.cloneNode(true);
				// move clone to mbl list - this is the list we show on mbl only
				list_mbl.append(value_clone);

				// get id and set it on the title link
				let id = /[^/]*$/.exec(
					value.querySelector(".values_item-title").getAttribute("data-id")
				)[0];
				value.querySelector(".values_item-title").href = "#" + id;

				section
					.querySelector(".values_title-list")
					.append(value.querySelector(".values_item-title"));
				section
					.querySelector(".values_body-list")
					.append(value.querySelector(".values_item-body"));
				section
					.querySelector(".values_img-list")
					.append(value.querySelector(".values_item-img"));
			});

			// check component has some values
			if (values.length == 0) return;

			mm.add(`(min-width: ${aethos.breakpoints.mbl + 1}px)`, () => {
				// gsap selector fn
				let gsap_section = gsap.utils.selector(section);

				// get elements to animate within this component
				let titles = gsap_section(".values_item-title");
				let bodies = gsap_section(".values_item-body");
				let images = gsap_section(".values_item-img");

				// get first items
				let title_first = titles[0];
				let body_first = bodies[0];

				// resize last img so we can fine control end of pinning. We set last img to be the same height as the RHS content so the section unsticks when top of img is at same height as top of content.
				const values_pin = section.querySelector(".values_pin");
				var h =
					gsap.getProperty(values_pin, "height") -
					gsap.getProperty(values_pin, "padding-top") -
					gsap.getProperty(values_pin, "padding-bottom");
				gsap.set(images[images.length - 1], {
					height: h,
				});

				// Set the parent component to be pinned
				gsap.to(section, {
					scrollTrigger: {
						trigger: section, // trigger is the whole section
						start: "top top",
						end: "bottom bottom",
						pin: ".values_pin", // we want to pin the RHS of the section - ie make it sticky
						pinSpacing: false,
						// markers: true,
					},
				});

				// Set up scroll triggers for each value
				values.forEach((value, index) => {
					let title = titles[index];
					let body = bodies[index];
					let image = images[index];

					console.log(index);

					let start = "top 70%";
					let end = "bottom 70%";
					let markers = false;
					if (index == 0) {
						start = "top 150%";
					}
					if (index == values.length - 1) {
						end = "bottom top";
					}

					// add a scrolltrigger for each image that toggles an active class on/off the corresponding title and body elements
					ScrollTrigger.create({
						trigger: image,
						start: start,
						end: end,
						toggleClass: { targets: [title, body], className: "is-active" },
						scrub: true,
						markers: markers,
						// onEnter: () => {
						// 	title.classList.add("is-active");
						// 	body.classList.add("is-active");
						// },
						// onLeave: () => {
						// 	title.classList.remove("is-active");
						// 	body.classList.remove("is-active");
						// },
						// onEnterBack: () => {
						// 	title.classList.add("is-active");
						// 	body.classList.add("is-active");
						// },
						// onLeaveBack: () => {
						// 	title.classList.remove("is-active");
						// 	body.classList.remove("is-active");
						// },
					});
				});
			});
		});
	};

	/* sticky images and quotes in articles */
	aethos.anim.articleSticky = function () {
		let mm = gsap.matchMedia();
		mm.add(`(min-width: ${aethos.breakpoints.mbl + 1}px)`, () => {
			// only make sticky on large screens
			let parents = document.querySelectorAll(
				".article-grid:not(.w-condition-invisible)" // exclude any sections that are unused/hidden
			);

			parents.forEach((parent) => {
				let gsap_section = gsap.utils.selector(parent);

				let child = gsap_section(".article-sticky:not(.w-condition-invisible)"); // exclude any sticky quotes/imgs that are unused/hidden

				ScrollTrigger.create({
					trigger: parent,
					start: "top 32px", // annoyingly doesn't seem possible to set this in rem
					end: () => `${parent.offsetHeight - child[0].offsetHeight}px 0px`,
					pin: child,
					invalidateOnRefresh: true,
					pinSpacing: false,
					// markers: true,
				});
			});
		});
	};

	/* sticky cards in journal */
	aethos.anim.journalSticky = function () {
		let mm = gsap.matchMedia();
		mm.add(
			`(min-width: ${aethos.breakpoints.mbl + 1}px) and (min-height: 651px)`,
			() => {
				// only make sticky on large screens

				// get sticky cards. We have already done the logic in CSS to identify the ones to be restyled as large, so we hook off a CSS variable rather than doing all this logic again
				let cards = document.querySelectorAll(".journal-card");
				let sticky_cards = []; // cards to make sticky
				cards.forEach((card) => {
					if (
						getComputedStyle(card).getPropertyValue(
							"--c--journal-card--type"
						) == "large" &&
						!card.getAttribute("data-scrollTrigger-processed")
					) {
						sticky_cards.push(card);
						card.setAttribute("data-scrollTrigger-processed", "true"); // tracking if we've already processed this card
					} else {
					}
				});

				sticky_cards.forEach((card) => {
					let card_wrapper = card.closest(".journal-grid_item");
					ScrollTrigger.create({
						trigger: card_wrapper,
						start: "top 32px", // annoyingly doesn't seem possible to set this in rem
						end: () => `${card_wrapper.offsetHeight - card.offsetHeight}px 0px`,
						pin: card,
						invalidateOnRefresh: true,
						pinSpacing: false,
					});
				});
			}
		);
	};

	/* map */
	aethos.map.init = function () {
		aethos.map.mapElement = document.querySelector(".map");
		aethos.map.destinations = [];

		// return if no map on page
		if (!aethos.map.mapElement) {
			return;
		}

		aethos.log("Map found, building...");

		// define marker group and add to map
		var markerLayer = new L.featureGroup();

		// Collect destination elements
		const destinations = document.querySelectorAll(".map-data");
		if (destinations.length === 0) {
			aethos.log("No destination data found.");
			return;
		}

		// check which destination is the primary one (ie if we are on a specific destination Contact page)
		const primarySlug = aethos.map.mapElement.getAttribute(
			"aethos-map-primary-dest"
		);

		// Add markers and tooltips
		destinations.forEach((destEl) => {
			const destination = {};
			destination.lat = parseFloat(destEl.getAttribute("aethos-dest-lat"));
			destination.long = parseFloat(destEl.getAttribute("aethos-dest-long"));
			destination.name = destEl.getAttribute("aethos-dest-name");
			destination.address = destEl.getAttribute("aethos-dest-address");
			destination.imgSrc = destEl.getAttribute("aethos-dest-img");
			destination.theme = destEl.getAttribute("aethos-dest-theme");
			destination.slug = destEl.getAttribute("aethos-dest-slug");
			destination.themeColor =
				aethos.themes[destination.theme.toLowerCase()]?.dark || "#000"; // Default to black if theme is undefined

			if (!destination.lat || !destination.long) {
				return;
			}

			// choose the primary destination
			if (primarySlug && primarySlug == destination.slug) {
				destination.isPrimary = true;
				aethos.map.primaryLatLong = [destination.lat, destination.long]; // so we know to focus map
			}

			// for club, make pin colors dark
			if (aethos.settings.theme == "club") {
				destination.themeColor = "#000";
			}

			// Create and add custom circle marker
			destination.marker = L.circleMarker([destination.lat, destination.long], {
				radius: 8,
				color: destination.themeColor,
				fillColor: destination.themeColor,
				fillOpacity: 1,
			}).addTo(markerLayer);

			// Use the createPopupContent function to generate the HTML for each pop-up
			destination.popupContent = createPopupContent({
				imageUrl: destination.imgSrc,
				address: destination.address,
				name: destination.name,
				slug: destination.slug,
				linkUrl: "/destinations/" + destination.slug + "/contact",
			});

			// Bind the pop-up to the marker
			destination.marker.bindPopup(destination.popupContent, {
				maxWidth: 300,
			});

			aethos.map.destinations.push(destination);
		});

		// choose tile theme
		if (aethos.settings.theme) {
			aethos.map.tileId = aethos.map.tileIds[aethos.settings.theme]; // if we are on a destination page with a specified theme, set map tile accordingly
			aethos.log("using custom map theme");
		} else {
			aethos.map.tileId = aethos.map.tileIds.default; // otherwise set default theme
			aethos.log("using default map theme");
		}

		// Define Mapbox tile layer
		var tileLayer = new L.tileLayer(
			"https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
			{
				id: aethos.map.tileId,
				accessToken: aethos.map.accessToken,
			}
		);

		// Initialize the map
		aethos.map.map = L.map(aethos.map.mapElement, {
			attributionControl: false,
			scrollWheelZoom: false,
			center: [0, 0],
			zoom: 0,
			layers: [tileLayer, markerLayer],
		});

		// fit map to markers
		if (aethos.map.primaryLatLong) {
			console.log(aethos.map.primaryLatLong);
			aethos.map.map.setView(aethos.map.primaryLatLong, 11);
		} else {
			aethos.map.map.fitBounds(markerLayer.getBounds());
		}

		// // if a destination page, zoom out a lot
		// if (aethos.settings.destinationSlug) {
		// 	aethos.map.map.setZoom(11);
		// }

		// }

		function createPopupContent({ imageUrl, address, name, linkUrl }) {
			return `
				<div class="popup">
					<div class="popup_media">
						<img src="${imageUrl}" alt="${name}" class="img-cover">
					</div>
					<div class="popup_content">
						<div class="popup_header">
							<div class="label-heading">${name}</div>
						</div>
						<div class="popup_body">
							<div class="body-xxs">${address}</div>
						</div>
						<a class="popup_footer" href="${linkUrl}" aria-label="Contact Aethos ${name}">
							<div class="button-text-xs">Contact</div>
							<div class="popup_icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" class="icon"><path d="M20.9939 11.9938L13.5689 19.9876L13.0001 19.3752L19.8563 11.9938L13.0001 4.61234L13.5689 4L20.9939 11.9938Z" fill="currentColor"></path><path d="M20.547 11.5574L20.5471 11.5946V12.3879L3 12.3878L3.00001 11.5574L20.547 11.5574Z" fill="currentColor"></path></svg>
							</div>
						</a>
					</div>
				</div>
			`;
		}
	};

	/* update copyright */
	aethos.functions.updateCopyrightYear = function () {
		const year = new Date().getFullYear().toString();
		document
			.querySelectorAll('[copyright="year"]')
			.forEach((el) => (el.textContent = year));
	};

	/* load in standard hero sections */
	aethos.anim.loadHero = function () {
		/* get all the animated sections */
		let sections = document.querySelectorAll(".anim-load-hero_parent");
		sections.forEach((section) => {
			let gsap_section = gsap.utils.selector(section); // gsap selector
			let content = gsap_section(".anim-load-hero_content"); // content element
			let media = gsap_section(".anim-load-hero_media"); // media element
			let content_bg = gsap_section(".anim-load-hero_content-bg"); // bg element behind content - already exists on page
			let section_bg_color = getComputedStyle(
				document.documentElement
			).getPropertyValue("--color--sand--light");

			if (aethos.settings.theme == "club") {
				section_bg_color = getComputedStyle(
					document.documentElement
				).getPropertyValue("--color--charcoal--dark");
			}

			/* decide if we are doing full animation or not */
			/* if we have a content element AND the layout IS inverted (ie we only do it if text is above image), then we do full anim. Otherwise we just do an img fade in */
			let doFullAnimation = false;
			if (section.querySelector('[aethos-hero-layout="inverted"]') && content) {
				aethos.log("Doing full hero animation");
				doFullAnimation = true;
			}

			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: "top bottom",
					scrub: false,
				},
			});

			// if this hero has a content element - ie we are animating the content too, we do the bg colour anim as well. Otherwise, the only thing that animates is the img fade
			if (doFullAnimation) {
				tl.from(content_bg, { height: 0, duration: 0.8, ease: "power2.inOut" });

				tl.from(
					content,
					{ autoAlpha: 0, duration: 0.6, ease: "power2.inOut" },
					">"
				);

				tl.from(
					media,
					{ autoAlpha: 0, duration: 0.8, ease: "power2.inOut" },
					">"
				);
				tl.from(
					section,
					{
						backgroundColor: section_bg_color,
						duration: 0.6,
						ease: "power2.inOut",
					},
					"<"
				);
			} else {
				gsap.set(content, { autoAlpha: 1 });
				tl.from(
					media,
					{ autoAlpha: 0, duration: 0.8, ease: "power2.inOut" },
					">"
				);
			}
		});
	};

	/* load vibes into listing cards */
	aethos.functions.loadVibes = function () {
		const targets = document.querySelectorAll("[aethos-vibes='target']");
		const fetchPromises = []; // Array to store fetch promises

		targets.forEach((target) => {
			const slug = target.getAttribute("aethos-item-slug");
			const type = target.getAttribute("aethos-item-type");
			let sourcePath;

			if (type == "experience") {
				sourcePath = "/experiences/" + slug;
			} else if (type == "wellness") {
				sourcePath = "/wellness/" + slug;
			} else {
				return; // If type is not recognized, exit the function for this target
			}

			// Create a fetch promise for each target
			const fetchPromise = fetch(sourcePath)
				.then((response) => {
					if (!response.ok) {
						throw new Error(`Error fetching content from ${sourcePath}`);
					}
					return response.text();
				})
				.then((html) => {
					// Create a temporary DOM element to parse the HTML content
					const parser = new DOMParser();
					const doc = parser.parseFromString(html, "text/html");

					// Find the element with aethos-vibes='source' in the fetched document
					const sourceElement = doc.querySelector("[aethos-vibes='source']");

					if (sourceElement) {
						// Insert the sourceElement content into the target element
						target.innerHTML = sourceElement.innerHTML;
					} else {
						console.warn(
							`No element with aethos-vibes='source' found in ${sourcePath}`
						);
					}
				})
				.catch((error) => {
					console.error(`Failed to load content from ${sourcePath}:`, error);
				});

			// Add the fetch promise to the array
			fetchPromises.push(fetchPromise);
		});

		// When all fetch requests have completed, refresh the Finsweet filter
		Promise.all(fetchPromises)
			.then(() => {
				aethos.log("All vibes loaded. Initializing Finsweet filter...");
				window.fsAttributes.cmsfilter.init(); // Initialize the Finsweet filter
			})
			.catch((error) => {
				console.error("An error occurred while loading vibes:", error);
			});
	};

	/* add direct links to experiene filters */
	aethos.functions.addExperienceFilterLinks = function () {
		const blocks = document.querySelectorAll("[aethos-experience-category]");

		blocks.forEach((block) => {
			// Get the filter slug and destination slug
			const experienceCategory = block.getAttribute(
				"aethos-experience-category"
			);
			const destinationSlug = block.getAttribute("aethos-destination-slug");

			// Check if the filter slug or destination slug are missing or empty
			if (!experienceCategory || !destinationSlug) {
				console.warn("Missing filter or destination slug for block:", block);
				return; // Skip this block if either attribute is missing
			}

			// Find the button within the block
			const button = block.querySelector(".button .button_link");
			if (!button) {
				console.warn("No button found in block:", block);
				return; // Skip if no button is found
			}

			// Set the button href with the correct link
			try {
				button.href = `/destination-all-experiences/${destinationSlug}?category=${experienceCategory}`;
			} catch (error) {
				console.error("Error setting href for button:", error);
			}
		});
	};

	/* load Vimeo videos */
	aethos.functions.loadVideos = function () {
		const videoSections = document.querySelectorAll('[aethos-video="enabled"]');

		videoSections.forEach((section) => {
			const vimeoContainer = section.querySelector(".video-cover");

			if (!vimeoContainer) return;

			const vimeoId = section.getAttribute("aethos-vimeo-id");
			if (!vimeoId) return;

			const imgs = section.querySelectorAll(".img-cover"); // Fallback/thumbnail images

			let player; // Declare player for reuse

			// Debounce helper
			let debounceTimer;
			const debounce = (callback, delay = 300) => {
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(callback, delay);
			};

			const vimeoInnerContainer = document.createElement("div");
			vimeoInnerContainer.classList.add(".video-cover");
			vimeoContainer.append(vimeoInnerContainer);
			gsap.set(vimeoInnerContainer, { opacity: 0 }); // Hide container at first
			vimeoContainer.classList.remove("video-cover"); // roundabout route to avoid having to replace all video-cover elements in WF - if we don't do this then the clever Vimeo covering CSS doesn't work for the inner container

			ScrollTrigger.create({
				trigger: section,
				start: "top 90%",
				end: "bottom 10%",
				onEnter: () => {
					if (!player) {
						debounce(() => {
							player = initVimeo(vimeoInnerContainer, vimeoId, imgs);
						});
					} else {
						debounce(() => {
							player.play().catch((error) => {
								console.error(`Error resuming video ${vimeoId}:`, error);
							});
						});
					}
				},
				onLeave: () => {
					if (player) {
						debounce(() => {
							player.pause().catch((error) => {
								console.error(`Error pausing video ${vimeoId}:`, error);
							});
						});
					}
				},
				onEnterBack: () => {
					if (player) {
						debounce(() => {
							player.play().catch((error) => {
								console.error(`Error resuming video ${vimeoId}:`, error);
							});
						});
					}
				},
				onLeaveBack: () => {
					if (player) {
						debounce(() => {
							player.pause().catch((error) => {
								console.error(`Error pausing video ${vimeoId}:`, error);
							});
						});
					}
				},
			});
		});

		function initVimeo(vimeoInnerContainer, vimeoId, imgs) {
			const options = {
				id: vimeoId,
				byline: false,
				title: false,
				muted: true,
				controls: false,
				autoplay: true,
				loop: true,
				background: true,
				responsive: true,
			};

			const player = new Vimeo.Player(vimeoInnerContainer, options);

			player.on("loaded", function () {
				// Attempt to play the video
				player.play().catch((error) => {
					console.error(`Error playing video ${vimeoId}:`, error);
				});

				// Transition from image to video
				// gsap.to(imgs, { opacity: 0, duration: 0.5 });
				gsap.to(vimeoInnerContainer, { opacity: 1, duration: 2 });
			});

			player.on("play", function () {
				aethos.log(`Video ${vimeoId} is playing.`);
			});

			player.on("pause", function () {
				aethos.log(`Video ${vimeoId} is paused.`);
			});

			player.on("error", function (error) {
				switch (error.name) {
					case "TypeError":
						console.error("Type error:", error);
						break;
					case "PasswordError":
						console.error("Password error:", error);
						break;
					case "PrivacyError":
						console.error("Privacy error:", error);
						break;
					default:
						console.error("An unknown error occurred:", error);
						break;
				}
			});

			return player; // Return the player object for later use
		}
	};

	/* format dates */
	aethos.functions.formatDates = function () {
		let dateEls = document.querySelectorAll(
			".date:not([aethos-date-formatted='true']"
		); // get all date elements on the page that haven't been formatted already

		dateEls.forEach((dateEl) => {
			var startDate = dateEl.getAttribute("aethos-date-start");
			var endDate = dateEl.getAttribute("aethos-date-end");
			if (!startDate) {
				return; // if no start date, return
			}
			if (!endDate) {
				endDate = startDate; // if end date is not set, assume single date
			}
			dateEl.innerHTML = formatDateRange(startDate, endDate); // update element
			dateEl.setAttribute("aethos-date-formatted", "true"); // mark as formatted
		});

		function formatDateRange(dateStr1, dateStr2) {
			// Helper function to format a single date
			function formatDate(date) {
				const options = { year: "numeric", month: "short", day: "2-digit" };
				return date.toLocaleDateString("en-US", options);
			}

			// Convert date strings to Date objects
			const date1 = new Date(dateStr1);
			const date2 = new Date(dateStr2);

			// Check if the two dates are the same
			if (date1.getTime() === date2.getTime()) {
				return formatDate(date1);
			}

			// Format date range
			const day1 = date1.getDate();
			const day2 = date2.getDate();

			const month1 = date1.toLocaleDateString("en-US", { month: "short" });
			const month2 = date2.toLocaleDateString("en-US", { month: "short" });

			const year1 = date1.getFullYear();
			const year2 = date2.getFullYear();

			if (year1 === year2) {
				if (month1 === month2) {
					// Same month and year: format as Nov 03 - 04, 2024
					return `${month1} ${day1} - ${day2}, ${year1}`;
				} else {
					// Different months, same year: format as Nov 30 - Dec 01, 2024
					return `${month1} ${day1} - ${month2} ${day2}, ${year1}`;
				}
			} else {
				// Different years: format as Nov 30, 2024 - Jan 01, 2025
				return `${formatDate(date1)} - ${formatDate(date2)}`;
			}
		}
	};

	// Helper function to fetch the destination-specific nav
	aethos.functions.buildDestinationNav = async function () {
		async function fetchDestinationNav(destinationSlug) {
			try {
				aethos.log(`Fetching navigation for destination: ${destinationSlug}`);

				// Fetch the destination-specific page
				const response = await fetch(`/destinations/${destinationSlug}`);
				if (!response.ok)
					throw new Error("Failed to fetch the destination nav");

				// Parse the response HTML to extract the .dest-nav element
				const responseText = await response.text();
				const tempDiv = document.createElement("div");
				tempDiv.innerHTML = responseText;
				const fetchedNav = tempDiv.querySelector(".dest-nav");

				if (!fetchedNav)
					throw new Error(".dest-nav element not found in the fetched page");

				aethos.log(
					`Successfully fetched navigation for destination: ${destinationSlug}`
				);
				return fetchedNav;
			} catch (error) {
				console.error(`Error fetching navigation: ${error.message}`);
				return null;
			}
		}

		async function setupNavigation() {
			return new Promise(async (resolve, reject) => {
				try {
					// Check if navigation already exists on the page
					let navElement = document.querySelector(
						".header .dest-nav-wrap .dest-nav"
					);

					if (navElement) {
						aethos.log(
							"Navigation already exists on the page. Skipping fetch."
						);
					} else {
						// Retrieve the destination slug from aethos.settings
						const destinationSlug = aethos.settings.destinationSlug;

						if (!destinationSlug) {
							aethos.log("Destination slug not found in aethos.settings");
							return reject("Destination slug not found");
						}

						aethos.log(
							`Starting navigation setup for destination: ${destinationSlug}`
						);

						// Fetch the destination-specific navigation
						navElement = await fetchDestinationNav(destinationSlug);

						if (!navElement) {
							console.warn("Failed to retrieve the navigation");
							return reject("Failed to retrieve navigation");
						}

						// Insert the fetched nav into the .header element
						const headerElement = document.querySelector(
							".dest-header .dest-nav-wrap"
						);
						if (!headerElement) {
							console.warn(".header element not found on the page");
							return reject(".header element not found");
						}

						// Keep the nav hidden during processing

						navElement.style.display = "none";
						headerElement.appendChild(navElement);
					}

					// Process the navigation
					aethos.log("Processing the navigation structure");
					processNavigation(navElement);

					// Show the navigation after processing
					navElement.style.display = "";
					aethos.log(
						"Navigation processing complete. Navigation is now visible."
					);

					// Resolve the promise when done
					resolve();
				} catch (error) {
					console.error(`Error during navigation setup: ${error}`);
					reject(error);
				}
			});
		}

		function processNavigation(navElement) {
			// Select all nav items within the fetched .dest-nav element
			const navItems = Array.from(
				navElement.querySelectorAll(".dest-nav_item")
			);

			// Separate primary and secondary items
			const primaryItems = [];
			const secondaryItems = [];

			navItems.forEach((item) => {
				const level = item.getAttribute("aethos-nav-level");
				const parentId = item.getAttribute("aethos-nav-parent-id");
				const bottomContainer = item.querySelector(".dest-nav_bottom");

				if (!level) {
					// If `aethos-nav-level` is blank, it's a primary item
					primaryItems.push({
						element: item,
						id: item.getAttribute("aethos-nav-id"),
						bottomContainer: bottomContainer,
					});
				} else if (level === "secondary") {
					// If `aethos-nav-level` is 'secondary', it's a secondary item
					secondaryItems.push({
						element: item,
						parentId: parentId || null, // Set to null if empty
					});
				}
			});

			// Reference to the .dest-nav_bottom container within the fetched nav
			const bottomContainer_global =
				navElement.querySelector(".dest-nav_bottom");

			if (!bottomContainer_global) {
				console.warn(
					".dest-nav_bottom element not found within the fetched nav"
				);
				return;
			}

			// Process primary items
			primaryItems.forEach((primary) => {
				// Create a container for the secondary links related to this primary
				const childContainer = document.createElement("div");
				childContainer.classList.add("dest-nav_child-list");

				// Assign the primary ID to the child container
				if (primary.id) {
					childContainer.setAttribute("aethos-nav-id", primary.id);
					// aethos.log(
					// 	`Creating child container for primary item with ID: ${primary.id}`
					// );
				}

				// Function to create a clone of the primary item, but without appending it
				function clonePrimary(primary) {
					const clone = primary.element.cloneNode(true);
					const cloneTextEl = clone.querySelector(
						".dest-nav_link-text:not(.w-condition-invisible)"
					);
					cloneTextEl.innerHTML = "All " + cloneTextEl.innerHTML; // append 'All' to clone link text
					clone.classList.add("is-clone");
					primary.clonedElement = clone; // store reference to use later
					primary.cloned = true;
				}

				// Append secondary items that belong to this primary
				secondaryItems.forEach((secondary) => {
					if (secondary.parentId === primary.id) {
						// aethos.log(
						// 	`Appending secondary item to primary item with ID: ${primary.id}`
						// );

						childContainer.appendChild(secondary.element);
						primary.element.setAttribute("aethos-nav-children", "true");

						// Create clone if it hasn't been done yet
						if (!primary.cloned) {
							clonePrimary(primary);
						}
					}
				});

				// Append the clone to the end of the child container, if it exists
				if (primary.cloned && primary.clonedElement) {
					childContainer.appendChild(primary.clonedElement);
				}

				// Append the child container to the .dest-nav_bottom if it has children
				if (childContainer.children.length > 0) {
					primary.bottomContainer.appendChild(childContainer);
					// aethos.log(
					// 	`Child container for primary item with ID: ${primary.id} added to .dest-nav_bottom`
					// );
				}
			});

			// Hide any secondary items with no parent or invalid parent reference
			secondaryItems.forEach((secondary) => {
				if (
					!secondary.parentId ||
					!primaryItems.some((primary) => primary.id === secondary.parentId)
				) {
					// Hide the orphaned secondary link
					secondary.element.style.display = "none";
					console.warn(
						`Hiding orphaned secondary item with parent ID: ${secondary.parentId}`
					);
				}
			});

			// open Global Nav from Dest Nav
			const globalNavLink = navElement.querySelector(
				".dest-nav_link.is-global"
			);
			const globalMenuButton = document.querySelector(".header .nav-btn");
			const destMenuButton = document.querySelector(".header .dest-nav-btn");
			if (globalNavLink && globalMenuButton && destMenuButton) {
				globalNavLink.addEventListener("click", (event) => {
					destMenuButton.click();
					globalMenuButton.click();
				});
			} else {
			}

			// when dest menu button is clicked, toggle a class on the <body> so we can keep track
			if (destMenuButton) {
				destMenuButton.addEventListener("click", () =>
					document.body.classList.toggle(aethos.helpers.destNavClass)
				);
			}
		}

		function menuHover(menu, target, underlineWidthProp, underlineOffsetProp) {
			const menuRect = menu.getBoundingClientRect();
			const targetRect = target.getBoundingClientRect();
			// Calculate the offset relative to the menu
			const offsetX = targetRect.left - menuRect.left;

			// Set underline width and position properties
			menu.style.setProperty(underlineWidthProp, `${target.offsetWidth}px`);
			menu.style.setProperty(underlineOffsetProp, `${offsetX}px`);
		}

		function addNavigationHover(
			menuSelector,
			underlineWidthProp,
			underlineOffsetProp,
			isChildCheck = false
		) {
			const menus = document.querySelectorAll(menuSelector);

			const topNav_selector = ".dest-nav_top";
			const topNav_underlineWidthProp = "--dest-nav-underline-width";
			const topNav_underlineOffsetProp = "--dest-nav-underline-offset-x";

			menus.forEach((menu) => {
				// set offset to a reasonable starting pos
				menu.style.setProperty(
					underlineOffsetProp,
					`${window.innerWidth * 0.5}px`
				);

				menu.addEventListener("mouseover", (event) => {
					if (
						event.target.classList.contains("link-cover") &&
						(!isChildCheck || !event.target.classList.contains("is-child"))
					) {
						// trigger hover on this item
						menuHover(
							menu,
							event.target,
							underlineWidthProp,
							underlineOffsetProp
						);

						// if we are on a child item, trigger the parent item hover to be safe
						if (event.target.classList.contains("is-child")) {
							const parentItem = event.target.closest(
								"[aethos-nav-children='true']"
							);
							const parentMenu = parentItem.closest(topNav_selector);

							console.log(parentItem, parentMenu);
							menuHover(
								parentMenu,
								parentItem,
								topNav_underlineWidthProp,
								topNav_underlineOffsetProp
							);
						}
					}
				});

				menu.addEventListener("mouseleave", () => {
					menu.style.setProperty(underlineWidthProp, "0");
				});
			});
		}

		function showSubnavOnHover() {
			const primaryItems = document.querySelectorAll(
				".dest-nav_item[aethos-nav-children='true']" // get primary items with children
			);

			primaryItems.forEach((primaryItem) => {
				const primaryId = primaryItem.getAttribute("aethos-nav-id");

				// Find the corresponding sub-navigation container
				const subnav = primaryItem.querySelector(
					`.dest-nav_child-list[aethos-nav-id="${primaryId}"]`
				);

				const subnav_wrapper = primaryItem.querySelector(".dest-nav_bottom");

				function setupSubnavTimeline() {
					gsap.set(subnav, { overflow: "hidden" });

					var tl = gsap
						.timeline({
							paused: true,
							// reversed: true,
							onReverseComplete: function () {
								gsap.set(subnav_wrapper, { display: "none" });
							},
						})
						.set(subnav_wrapper, { display: "grid" })
						.fromTo(
							subnav,
							{ autoAlpha: 0, height: 0 },
							{
								autoAlpha: 1,
								height: "auto",
								duration: 0.2,
							}
						)
						.fromTo(
							subnav.querySelectorAll(".dest-nav_link"),
							{ autoAlpha: 0 },
							{
								autoAlpha: 1,
								duration: 0.15,
								stagger: 0.075,
							},
							0
						);

					return tl;
				}

				if (subnav) {
					gsap
						.matchMedia()
						.add(`(min-width: ${aethos.breakpoints.tab + 1}px)`, () => {
							console.log("setting up subnav hover");
							const tl = setupSubnavTimeline();

							// Desktop: toggle timeline on hover
							let isHovered = false;

							function toggleTimeline() {
								isHovered ? tl.play() : tl.reverse();
							}

							primaryItem.addEventListener("mouseenter", () => {
								isHovered = true;
								toggleTimeline();
							});

							primaryItem.addEventListener("mouseleave", () => {
								isHovered = false;

								toggleTimeline();
							});

							subnav.addEventListener("mouseenter", () => {
								isHovered = true;

								toggleTimeline();
							});

							subnav.addEventListener("mouseleave", () => {
								isHovered = false;

								toggleTimeline();
							});

							// Cleanup function for when the media query condition changes
							return () => {
								console.log("turning off subnav hover");

								primaryItem.removeEventListener("mouseenter", openSubmenu);
								primaryItem.removeEventListener("mouseleave", closeSubmenu);
								subnav.removeEventListener("mouseenter", openSubmenu);
								subnav.removeEventListener("mouseleave", closeSubmenu);
							};
						});

					gsap
						.matchMedia()
						.add(`(max-width: ${aethos.breakpoints.tab}px)`, () => {
							const tl = setupSubnavTimeline();

							let isOpen = false;

							primaryItem.addEventListener("click", () => {
								isOpen = !isOpen;
								isOpen ? tl.play() : tl.reverse();
							});

							// Back button closes subnav
							const backBtn = document.querySelector(".dest-nav_back");
							if (backBtn) {
								backBtn.addEventListener("click", () => {
									gsap.set(subnavWrapper, { display: "none" });
									isOpen = false;
									tl.reverse();
								});
							}

							// Cleanup function for when the media query condition changes
							return () => {
								primaryItem.removeEventListener("click", onClick);
								if (backBtn) {
									backBtn.removeEventListener("click", onClick);
								}
							};
						});
				}
			});
		}

		// Run the setup and animation functions sequentially
		try {
			// Wait for the navigation setup to complete
			await setupNavigation();

			// refresh scrolltrigger pagewide
			ScrollTrigger.refresh();

			// Add navigation hover effects for top and bottom menus
			$(".dest-nav_bottom .link-cover").addClass("is-child"); // Patch to distinguish top and bottom items

			const topNav_selector = ".dest-nav_top";
			const topNav_underlineWidthProp = "--dest-nav-underline-width";
			const topNav_underlineOffsetProp = "--dest-nav-underline-offset-x";

			const botNav_selector = ".dest-nav_bottom";
			const botNav_underlineWidthProp = "--dest-nav-underline-width-bot";
			const botNav_underlineOffsetProp = "--dest-nav-underline-offset-x-bot";

			// top
			addNavigationHover(
				topNav_selector,
				topNav_underlineWidthProp,
				topNav_underlineOffsetProp,
				true
			);

			// bottom
			addNavigationHover(
				botNav_selector,
				botNav_underlineWidthProp,
				botNav_underlineOffsetProp,
				false
			);

			showSubnavOnHover();
			document.querySelector(".dest-nav").classList.add("is-ready");
		} catch (error) {
			console.error("Error setting up the destination navigation:", error);
		}
	};

	// Function to apply theme based on destination slug in URL
	aethos.functions.updateThemeOnStaticPages = function () {
		// 1. Get the destination name from the URL
		const urlParts = window.location.pathname.split("/");
		const destinationName = urlParts[urlParts.indexOf("destinations") + 1]; // Assuming the URL has /destinations/<name>/

		if (!destinationName) {
			aethos.log("Destination name not found in URL.");
			return;
		}

		// 2. Get the hidden .dest-data_item element that has the matching data-dest-slug attribute
		const destinationElement = document.querySelector(
			`.dest-data_item[aethos-destination-slug="${destinationName}"]`
		);

		if (!destinationElement) {
			aethos.log("Matching destination element not found.");
			return;
		}

		// 3. Get the theme from the data-theme attribute of the destination element
		const theme = destinationElement.getAttribute("aethos-theme");

		if (!theme) {
			aethos.log("Theme not found on the destination element.");
			return;
		}

		// 4. Get the .page-wrap element and update its data-theme attribute
		const pageWrap = document.querySelector(".page-wrap");

		if (!pageWrap) {
			aethos.log(".page-wrap element not found.");
			return;
		}

		pageWrap.setAttribute("aethos-theme", theme);
	};

	/* Retreat outline/itinerary component */
	aethos.functions.retreatOutline = function () {
		// Get all .c-outline components on the page
		const outlines = document.querySelectorAll(".c-outline");

		// Loop through each .c-outline component
		outlines.forEach((outline) => {
			// Get all .outline_day elements, .outline_media-item elements, and .outline_body-item elements in the current outline component
			const days = outline.querySelectorAll(".outline_day");
			const mediaItems = outline.querySelectorAll(".outline_media-item");
			const bodyItems = outline.querySelectorAll(".outline_body-item");

			// Loop through each .outline_day element
			days.forEach((day, index) => {
				// Add hover event listener to each .outline_day element
				day.addEventListener("mouseenter", () => {
					// Remove .is-active class from all days, media items, and body items
					days.forEach((el) => el.classList.remove("is-active"));
					mediaItems.forEach((el) => el.classList.remove("is-active"));
					bodyItems.forEach((el) => el.classList.remove("is-active"));

					// Add .is-active class to the hovered day, matching media item, and matching body item
					day.classList.add("is-active");
					if (mediaItems[index]) {
						mediaItems[index].classList.add("is-active");
					}
					if (bodyItems[index]) {
						bodyItems[index].classList.add("is-active");
					}
				});
			});
		});
	};

	// Replace listing links
	aethos.functions.listingLinks = function () {
		document
			.querySelectorAll(
				'a[href^="/experiences/"], a[href^="/happenings/"], a[href^="/wellness/"]'
			)
			.forEach((link) => {
				const destinationSlug = link.getAttribute("aethos-destination-slug");
				if (destinationSlug) {
					const currentHref = link.getAttribute("href");
					const slug = currentHref.split("/").pop(); // Extract the `x` part from `/experiences/x`, `/events/x`, etc.
					const updatedHref = `/listing?slug=${slug}&dest=${destinationSlug}`;
					link.setAttribute("href", updatedHref);
				}
			});
	};

	// Hidden form fields
	aethos.functions.hiddenFormFields = function () {
		/* user language */
		const userLanguage = navigator.language || navigator.userLanguage;
		const languageFields = document.querySelectorAll(
			'input[name="USERLANGUAGE"]'
		);

		languageFields.forEach((field) => {
			field.value = userLanguage.substring(0, 2); // Optionally, only use the language code (e.g., 'en')
		});

		/* page title */
		const titleFields = document.querySelectorAll('input[name="PAGETITLE"]');

		titleFields.forEach((field) => {
			field.value = document.title;
		});

		/* page url */
		const urlFields = document.querySelectorAll('input[name="PAGEURL"]');

		urlFields.forEach((field) => {
			field.value = location.href;
		});

		/* current destination */
		const destinationFields = document.querySelectorAll(
			'input[name="PAGEDESTINATION"]'
		);

		// if we know the current destination
		if (aethos.settings.destinationSlug) {
			destinationFields.forEach((field) => {
				field.value = aethos.settings.destinationSlug;
			});
		}
	};

	// lang selector close button
	aethos.functions.langSwitcherClose = function () {
		document
			.querySelector(".lang-switcher_close")
			.addEventListener("click", function () {
				const langSwitcherDD = document.querySelector(
					".lang-switcher_dd-toggle"
				);
				if (langSwitcherDD) {
					// langSwitcherDD.click(); // Simulates a click on the .lang-switcher_dd element
					console.log("click");

					langSwitcherDD.dispatchEvent(new Event("mousedown"));
					setTimeout(() => {
						langSwitcherDD.dispatchEvent(new Event("mouseup"));
					}, 10); // A short delay ensures that events are distinguished
				}
			});
	};

	/* update things when CMS load fires */
	aethos.functions.handleCMSFilter = function () {
		window.fsAttributes = window.fsAttributes || [];
		window.fsAttributes.push([
			"cmsfilter",
			(filterInstances) => {
				aethos.log("cmsfilter Successfully loaded!");

				// The callback passes a `filterInstances` array with all the `CMSFilters` instances on the page.
				const [filterInstance] = filterInstances;

				// Check if filterInstance exists before proceeding
				if (filterInstance) {
					// The `renderitems` event runs whenever the list renders items after filtering.
					filterInstance.listInstance.on("renderitems", (renderedItems) => {
						aethos.log("CMS filter - render items");
						aethos.helpers.refreshSticky(true); // hard refresh
					});

					// aethos.functions.clearSelect("destination", "all");
				} else {
					aethos.log("No CMSFilters instances found on the page.");
				}
			},
		]);
	};

	/* update things when CMS load fires */
	aethos.functions.handleCMSLoad = function () {
		window.fsAttributes = window.fsAttributes || [];
		window.fsAttributes.push([
			"cmsload",
			(listInstances) => {
				aethos.log("cmsload Successfully loaded!");

				// The callback passes a `listInstances` array with all the `CMSList` instances on the page.
				const [listInstance] = listInstances;

				// Check if listInstance exists before proceeding
				if (listInstance) {
					// The `renderitems` event runs whenever the list renders items after switching pages.
					listInstance.on("renderitems", (renderedItems) => {
						aethos.log("CMS load - render items");
						aethos.helpers.refreshSticky(); // soft refresh - only process new items
					});
				} else {
					aethos.log("No CMSList instances found on the page.");
				}
			},
		]);
	};

	/* handle date formatting */
	aethos.functions.dateSuffixes = function () {
		/* dates */
		// "suffixMe" function definition
		function suffixMe(num) {
			// remainder operations dealing with edge case
			const j = num % 10,
				k = num % 100;
			// return respective suffix accordingly
			if (j == 1 && k != 11) {
				return `${num}st`;
			} else if (j == 2 && k != 12) {
				return `${num}nd`;
			} else if (j == 3 && k != 13) {
				return `${num}rd`;
			} else {
				return `${num}th`;
			}
		}

		// create array of numbers
		const numbers = Array.from(
			document.querySelectorAll("[data-date-suffix='true']")
		);
		// apply function definition for each number
		numbers.forEach((number) => {
			const suffix = suffixMe(Number(number.textContent));
			// override original number with its newly return suffixed number
			number.textContent = suffix;
		});
	};

	/* handle destination subscribe form names */
	aethos.functions.updateSubscribeFormName = function () {
		// Find all forms with a data-destination attribute
		const forms = document.querySelectorAll("form[data-destination]");

		// Helper function to capitalize the first letter of a word
		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
		}

		forms.forEach(function (form) {
			let destinationName = form.getAttribute("data-destination");

			// Capitalize the destination name
			destinationName = capitalizeFirstLetter(destinationName);

			// Update data-name attribute in the required format
			form.setAttribute(
				"data-name",
				`Destination Subscribe - ${destinationName}`
			);
		});
	};

	/* hide empty sections */
	aethos.functions.hideEmptySections = function () {
		$(".u-empty-section").has(".w-dyn-empty").css("display", "none");
	};

	/* assorted small patches */
	aethos.functions.patches = function () {
		/* patch for nav to allow back button to close Destinations dd correctly */
		/* Based on https://www.sygnal.com/lessons/close-dropdown-menu-on-anchor-link-click */
		$(".nav-dests_back").click(function () {
			aethos.log("dest back btn click");
			$(this).closest(".nav-link_dd-content").removeClass("w--open");
			$(this).closest(".nav-link_dd .w-dropdown-toggle").removeClass("w--open");
		});

		/* patch for date input fields to show date when one is selected instead of placeholder */
		$("input[type='date']").on("input", function () {
			if ($(this).val().length > 0) {
				$(this).removeClass("is-date-placeholder");
			} else {
				$(this).addClass("is-date-placeholder");
			}
		});
	};

	/* club - memberships */
	aethos.anim.clubMemberships = function () {
		//only animate on tablet and above
		let mm = gsap.matchMedia();
		// get all sections on page
		let sections = document.querySelectorAll(".c-memberships");

		sections.forEach((section) => {
			// get sticky image container
			const imgContainer = section.querySelector(".memberships_img-sticky");

			// get all items
			let items = section.querySelectorAll(".memberships-item");
			items.forEach((item, index) => {
				const img = item.querySelector(".memberships-item_img-wrap");
				// move img into sticky container
				imgContainer.append(img);

				// hide all but first image
				if (index == 0) {
					img.style.display = "block";
					img.style.opacity = 1;
				} else {
					img.style.display = "none";
					img.style.opacity = 0;
				}

				mm.add(`(min-width: ${aethos.breakpoints.mbl + 1}px)`, () => {
					// change image on scroll
					gsap.to(img, {
						display: "block",
						opacity: 1,
						scrollTrigger: {
							trigger: item,
							start: "top center",
							end: "top 30%", // End animation when the section is 25% from the bottom of the viewport
							scrub: true, // Smooth animation as you scroll
							toggleActions: "play none none reverse", // Play when entering, reverse when leaving
							// markers: true,
						},
					});
				});
			});
			mm.add(`(min-width: ${aethos.breakpoints.mbl + 1}px)`, () => {
				// make image wrap sticky
				ScrollTrigger.create({
					trigger: section,
					start: "top 32px",
					end: () =>
						`${section.offsetHeight - imgContainer.offsetHeight}px 0px`,
					pin: imgContainer,
					invalidateOnRefresh: true,
					pinSpacing: false,
					// markers: true,
				});
			});
		});
	};

	/* FAQ */
	aethos.anim.faq = function () {
		// get all sections on page
		let sections = document.querySelectorAll(".c-faq");

		sections.forEach((section) => {
			// Initialize all FAQ content elements with height: 0 on page load
			section.querySelectorAll(".faq_content").forEach((content) => {
				content.style.height = "0px";
			});

			// FAQ toggle functionality
			section.querySelectorAll(".faq-item").forEach((faq) => {
				const toggle = faq.querySelector(".faq-item_header");
				const content = faq.querySelector(".faq_content");

				faq.addEventListener("click", function () {
					// Close other open items
					section.querySelectorAll(".faq-item").forEach((other_faq) => {
						if (other_faq !== faq && other_faq.classList.contains("is-open")) {
							other_faq.classList.remove("is-active", "is-open");
							const otherContent = other_faq.querySelector(".faq_content");
							gsap.to(otherContent, {
								height: 0,
								duration: 0.6,
								// onComplete: () => other_faq.classList.remove("is-active"),
							});
						}
					});

					// Toggle open/close functionality for clicked item
					if (faq.classList.contains("is-open")) {
						// Close content using GSAP and remove active classes
						gsap.to(content, {
							height: 0,
							duration: 0.6,
							ease: "power4.inOut",
							// onComplete: () => faq.classList.remove("is-active"),
						});
						faq.classList.remove("is-active", "is-open");
					} else {
						// Add active classes
						faq.classList.add("is-open");

						// Open content using GSAP
						// gsap.set(content, { height: "auto" });
						// const autoHeight = content.clientHeight;
						gsap.fromTo(
							content,
							{ height: 0 },
							{ height: "auto", duration: 0.6, ease: "power4.inOut" }
						);
					}
				});
			});
		});
	};

	/* mobile lang slider */
	aethos.anim.mblLangSlider = function () {
		const drawerWrap = document.querySelector(".lang-switcher-mob_drawer-wrap");
		const overlay = document.querySelector(".lang-switcher-mob_overlay"); // currently not using
		const closeBtn = document.querySelector(".lang-switcher-mob_close");
		const toggleButton = document.querySelector(".lang-switcher-mob_bar"); // Add your toggle button selector

		// GSAP animation timeline for opening
		const openAnimation = gsap
			.timeline({ paused: true })
			.set([drawerWrap], { display: "block" }) // Ensure elements are visible
			.fromTo(
				drawerWrap,
				{ height: 0, opacity: 0 },
				{ height: "10rem", opacity: 1, duration: 0.4, ease: "quart.inOut" }
			)
			.fromTo(
				closeBtn,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.4, ease: "quart.inOut" },
				"<" // Align with previous animation
			);

		// Event listeners
		toggleButton.addEventListener("click", () => {
			if (toggleButton.classList.contains("is-open")) {
				toggleButton.classList.remove("is-open");
				aethos.log("reverse");
				openAnimation.reverse();
			} else {
				toggleButton.classList.add("is-open");

				aethos.log("play");

				openAnimation.play();
			}
		});
	};

	/* when a proposal form is submitted, we want to preserve the height of the section to avoid it becoming very short. */
	/* CSS will override WF's default display: none so form height doesn't change */
	aethos.functions.formSubmissionStyling = function () {
		const proposalForms = document.querySelectorAll(".proposal-form");
		const forms = document.querySelectorAll("form");

		// fade in success message on footer forms - TODO, not working
		gsap.set(".footer-form_success", { opacity: 0 });

		forms.forEach((form) => {
			form.addEventListener("submit", () => {
				// Add the '.is-submitted' class to the form
				form.classList.add("is-submitted");

				if (form.classList.contains("footer-form")) {
					gsap.set(".footer-form_success", { display: "block" });
					gsap.to(".footer-form_success", { opacity: 1, duration: 0.3 });
				}
			});
		});

		// for proposal forms, on resize, remove this class to allow flexible heights
		window.addEventListener("resize", () => {
			proposalForms.forEach((form) => {
				form.classList.remove("is-submitted");
			});
		});
	};

	/* benefits */
	aethos.anim.benefits = function () {
		// Set height: 0 on page load
		gsap.set(".mem-benefits_list-wrap", { height: 0 });

		// Toggle functionality
		const items = document.querySelectorAll(".mem-benefits");

		items.forEach((item) => {
			const content = item.querySelector(".mem-benefits_list-wrap");

			// Prevent rapid clicks from causing animation glitches
			let isAnimating = false;

			item.addEventListener("click", function () {
				if (isAnimating) return; // Ignore if already animating
				isAnimating = true;

				if (item.classList.contains("is-open")) {
					// Close content using GSAP and remove active classes
					gsap.to(content, {
						height: 0,
						duration: 0.6,
						ease: "power4.inOut",
						onComplete: () => {
							isAnimating = false;
						},
					});
					item.classList.remove("is-open");
					item.setAttribute("aria-expanded", "false");
				} else {
					// Add active classes
					item.classList.add("is-open");
					item.setAttribute("aria-expanded", "true");

					// Calculate natural height and animate
					const contentHeight = content.scrollHeight; // Get natural height
					gsap.fromTo(
						content,
						{ height: 0 },
						{
							height: contentHeight,
							duration: 0.6,
							ease: "power4.inOut",
							onComplete: () => {
								isAnimating = false;
								content.style.height = "auto"; // Reset height to auto after animation
							},
						}
					);
				}
			});
		});

		// Handle window resize to recalculate heights
		window.addEventListener("resize", () => {
			items.forEach((item) => {
				const content = item.querySelector(".mem-benefits_list-wrap");
				if (item.classList.contains("is-open")) {
					content.style.height = `auto`;
				}
			});
		});
	};

	/* calculator */
	aethos.functions.calc = function () {
		const form = document.querySelector(".calc");
		if (!form) {
			return;
		}
		const result = document.querySelector(".calc-result");
		const backButton = document.querySelector(".calc-result_back");
		const clubSelect = document.querySelector('select[name="Club"]');
		const otherClubsRadio = document.querySelectorAll(
			'input[name="other-clubs"]'
		);
		const partnerClubsRadioFieldset = document.querySelector(
			".calc_partner-clubs"
		);
		const partnerClubsRadio = document.querySelectorAll(
			'input[name="partner-clubs"]'
		);
		const submitButton = document.querySelector(".calc_submit .button");
		const calcDataElements = document.querySelectorAll(".calc-data");
		const benefitsContainer = document.querySelector(".calc-result_benefits");

		let selectedClub = null;
		let selectedPlan = null;
		let price = null;
		let fee = null;
		let bodyText = null;

		// Function to enable/disable the button
		function buttonEnabled() {
			const clubSelected = !!selectedClub;
			const otherClubsSelected = Array.from(otherClubsRadio).some(
				(radio) => radio.checked
			);
			const otherClubsYes = Array.from(otherClubsRadio).find(
				(radio) => radio.value === "yes" && radio.checked
			);
			const partnerClubsSelected = Array.from(partnerClubsRadio).some(
				(radio) => radio.checked
			);

			if (
				clubSelected &&
				otherClubsSelected &&
				(otherClubsYes || partnerClubsSelected)
			) {
				submitButton.removeAttribute("disabled");
			} else {
				submitButton.setAttribute("disabled", true);
			}
		}

		// Function to get calc data based on the selected club
		const getCalcData = (club) => {
			return Array.from(calcDataElements).find(
				(el) => el.getAttribute("aethos-calc-name") === club
			);
		};

		// Function to reset visibility and values
		const resetForm = () => {
			partnerClubsRadioFieldset.style.display = "none";
			buttonEnabled();
		};

		// Function to populate benefits
		const loadBenefits = async () => {
			// Remove any existing benefits
			benefitsContainer.innerHTML = "";

			try {
				const response = await fetch(
					`/memberships/${selectedPlan.toLowerCase()}`
				);
				if (!response.ok) throw new Error("Failed to load benefits");

				const pageHtml = await response.text();
				const parser = new DOMParser();
				const doc = parser.parseFromString(pageHtml, "text/html");
				const benefits = doc.querySelectorAll(".calc-result_benefit");

				if (benefits.length) {
					benefits.forEach((benefit) => {
						benefitsContainer.appendChild(benefit.cloneNode(true));
					});
				} else {
					benefitsContainer.textContent = "";
				}
			} catch (error) {
				console.error("Error loading benefits:", error);
				benefitsContainer.textContent = "";
			}
		};

		// Function to display the result
		const showResult = async () => {
			const resultTitle = result.querySelector('[aethos-calc-result="title"]');
			const resultBody = result.querySelector('[aethos-calc-result="body"]');
			const resultPrice = result.querySelector('[aethos-calc-result="price"]');
			const resultFee = result.querySelector('[aethos-calc-result="fee"]');

			resultTitle.textContent = `Aethos ${selectedPlan} ${selectedClub}`;
			resultBody.textContent = bodyText;
			resultPrice.textContent = price;
			resultFee.textContent = fee;

			await loadBenefits();
			/* if no price, hide footer */
			if (!price) {
				document.querySelector(".calc-result_footer").style.display = "none";
			}

			form.style.display = "none";
			result.style.display = "flex";
		};

		// Event listener for club selection
		clubSelect.addEventListener("change", (e) => {
			selectedClub = e.target.value;
			buttonEnabled();
		});

		// Event listener for other clubs radio
		otherClubsRadio.forEach((radio) => {
			radio.addEventListener("change", (e) => {
				if (e.target.value === "yes") {
					partnerClubsRadioFieldset.style.display = "none";
					selectedPlan = "Pioneer";
				} else {
					partnerClubsRadioFieldset.style.display = "block";
				}
				buttonEnabled();
			});
		});

		// Event listener for partner clubs radio
		partnerClubsRadio.forEach((radio) => {
			radio.addEventListener("change", (e) => {
				selectedPlan = e.target.value === "yes" ? "Adventurer" : "Explorer";
				buttonEnabled();
			});
		});

		// Event listener for form submission
		submitButton.addEventListener("click", async (e) => {
			e.preventDefault();

			if (!selectedClub || !selectedPlan) {
				alert("Please complete all required fields.");
				return;
			}

			const calcData = getCalcData(selectedClub);
			if (!calcData) {
				alert("Data for the selected club is unavailable.");
				return;
			}

			price = calcData.getAttribute(
				`aethos-calc-${selectedPlan.toLowerCase()}-price`
			);
			fee = calcData.getAttribute(
				`aethos-calc-${selectedPlan.toLowerCase()}-fee`
			);
			bodyText = calcData.getAttribute(
				`aethos-calc-${selectedPlan.toLowerCase()}-body`
			);

			await showResult();
		});

		// Event listener for back button
		backButton.addEventListener("click", () => {
			result.style.display = "none";
			form.style.display = "block";
			resetForm();
		});

		// Initial reset
		resetForm();
	};

	/* underline effect on hover for club nav */
	aethos.anim.addClubNavHover = function () {
		const menus = document.querySelectorAll(".club-nav");

		menus.forEach((menu) => {
			/* on load, set offset to a reasonable midway number to avoid underline sliding in from 0px on first hover */
			const menuRect = menu.getBoundingClientRect();
			menu.style.setProperty(
				"--club-nav-underline-offset-x",
				`${menuRect.right / 2}px`
			);
			menu.addEventListener("mouseover", (event) => {
				// Check if screen width is 992px or above
				if (
					window.matchMedia(`(min-width: ${aethos.breakpoints.tab + 1}px)`)
						.matches
				) {
					if (event.target.classList.contains("club-nav_link-text")) {
						const targetRect = event.target.getBoundingClientRect();

						// Calculate the offset relative to the menu
						const offsetX = targetRect.left - menuRect.left;

						// Set underline width and position properties
						menu.style.setProperty(
							"--club-nav-underline-width",
							`${event.target.offsetWidth}px`
						);

						menu.style.setProperty(
							"--club-nav-underline-offset-x",
							`${offsetX}px`
						);
					}
				}
			});

			menu.addEventListener("mouseleave", () => {
				// Only reset underline if screen width is 992px or above
				if (
					window.matchMedia(`(min-width: ${aethos.breakpoints.tab + 1}px)`)
						.matches
				) {
					menu.style.setProperty("--club-nav-underline-width", "0");
				}
			});
		});
	};

	aethos.anim.wellTabsUnderline = function () {
		const tabMenu = document.querySelector(".well-tabs_menu");
		if (!tabMenu) return;

		const tabs = tabMenu.querySelectorAll(".well-tabs_link");
		const dropdownToggleLabel = document.querySelector(
			".well-tabs_dd-toggle .label-heading"
		);

		function updateUnderline() {
			const activeTab = tabMenu.querySelector(".well-tabs_link.is-active");
			if (!activeTab) return;

			const menuRect = tabMenu.getBoundingClientRect();
			const activeTabRect = activeTab.getBoundingClientRect();
			const offsetX = activeTabRect.left - menuRect.left;

			tabMenu.style.setProperty(
				"--tabs-underline-width",
				`${activeTabRect.width}px`
			);
			tabMenu.style.setProperty("--tabs-underline-offset-x", `${offsetX}px`);
		}

		function updateDropdownLabel(tab) {
			const tabLabel = tab.querySelector(".label-heading")?.textContent;
			if (dropdownToggleLabel && tabLabel) {
				dropdownToggleLabel.textContent = tabLabel;
			}
		}

		function setActiveTab(tab) {
			tabs.forEach((t) => t.classList.remove("is-active"));
			tab.classList.add("is-active");
		}

		tabs.forEach((tab) => {
			tab.addEventListener("click", (event) => {
				event.preventDefault();
				const clickedTab = event.target.closest(".well-tabs_link");
				if (!clickedTab) return;

				setActiveTab(clickedTab);
				updateUnderline();
				updateDropdownLabel(clickedTab);
			});
		});

		const initialTab =
			tabMenu.querySelector(".well-tabs_link.is-active") || tabs[0];
		if (initialTab) {
			setActiveTab(initialTab);
			updateUnderline();
			updateDropdownLabel(initialTab);
		}

		let resizeTimeout;
		window.addEventListener("resize", () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(updateUnderline, 100);
		});
	};

	/* club nav */
	aethos.functions.clubNav = function () {
		// open Global Nav from Club Nav
		const globalNavLink = document.querySelector(".club-nav_item.is-global");
		const globalMenuButton = document.querySelector(".header .nav-btn");
		const clubMenuButton = document.querySelector(".header .club-nav-btn");
		if (globalNavLink && globalMenuButton && clubMenuButton) {
			globalNavLink.addEventListener("click", (event) => {
				clubMenuButton.click(); // close club nav
				globalMenuButton.click(); // open global nav
			});
		} else {
		}

		// when club menu button is clicked, toggle a class on the <body> so we can keep track
		if (clubMenuButton) {
			clubMenuButton.addEventListener("click", () =>
				document.body.classList.toggle(aethos.helpers.clubNavClass)
			);
		}
	};

	/* toggle normalise and smooth scroll depending on whether nav is open */
	aethos.functions.toggleNormaliseScroll = function () {
		aethos.smoother = null;

		// Check if any navigation menu is open
		const isNavOpen = () =>
			document.body.classList.contains("nav-open") ||
			document.body.classList.contains("dest-nav-open") ||
			document.body.classList.contains("loader-playing") ||
			document.body.classList.contains("club-nav-open");

		// Initialize smooth scroll
		const initSmoothScroll = () => {
			if (!aethos.smoother) {
				aethos.smoother = ScrollSmoother.create({
					smooth: 1,
					effects: true,
					content: "#smooth-content",
					wrapper: "#smooth-wrapper",
					onUpdate: () => {},
					onRefresh: () => {
						ScrollTrigger.refresh();
					},
				});
				console.log("Smooth Scroll initialized.");
			}
		};

		// Kill smooth scroll
		const killSmoothScroll = () => {
			if (aethos.smoother) {
				aethos.smoother.paused(true);
			}
		};

		// Toggle GSAP's normalizeScroll and smoothScroll based on the nav state
		const toggleScrollFeatures = () => {
			const scrollEnabled = !isNavOpen();

			// Toggle normalizeScroll
			ScrollTrigger.normalizeScroll(scrollEnabled);
			console.log(`Normalize Scroll is now ${scrollEnabled ? "ON" : "OFF"}`);

			// Toggle smoothScroll
			if (scrollEnabled) {
				initSmoothScroll();
			} else {
				killSmoothScroll();
			}
		};

		// Observe changes to the body's class list
		const observer = new MutationObserver(() => toggleScrollFeatures());

		// Start observing the body for attribute changes (class additions/removals)
		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ["class"],
		});

		// Initialize the correct state on load
		toggleScrollFeatures();
	};

	/* GSAP page transitions */
	aethos.anim.pageTransition = function () {
		// clear localstorage - we use this to track whether we show second half of transition on a page load
		localStorage.setItem("aethos_transition", "false");

		aethos.transition = {};
		console.log("Running page transition setup");
		const links = document.querySelectorAll("a");

		aethos.transition.themes = {
			city: {
				foreground: [0.733, 0.38, 0.341, 1.0], // Terracotta-dark (RGBA)
				background: "#d19393", // Terracotta-light (Hex)
			},
			coast: {
				foreground: [0.447, 0.506, 0.545, 1.0], // Sky-dark (RGBA)
				background: "#a3afb8", // Sky-light (Hex)
			},
			country: {
				foreground: [0.392, 0.545, 0.545, 1.0], // Leaf-dark (RGBA)
				background: "#97b7b6", // Leaf-light (Hex)
			},
			club: {
				foreground: [1, 1, 1, 1.0], // white (RGBA)
				background: "#1e1d1b", // Charcoal-extra dark (Hex)
			},
			default: {
				foreground: [0.0, 0.0, 0.0, 1.0], // Black (RGBA)
				background: "#ffffff", // white (Hex)
			},
		};
		// Transition elements
		aethos.transition.element = document.querySelector(".page-transition");
		aethos.transition.container = aethos.transition.element.querySelector(
			".page-transition_lottie"
		);

		// Load the Lottie animation
		aethos.transition.lottie = lottie.loadAnimation({
			container: aethos.transition.container,
			renderer: "svg",
			loop: false,
			autoplay: false,
			path: "https://cdn.prod.website-files.com/668fecec73afd3045d3dc567/67508beb66c783b283415ad0_page-transition-logo-v3.json",
		});

		// Keep track of prefetched links
		const prefetchedLinks = new Set();

		// Add prefetch link to the head
		function prefetchLink(href) {
			if (!prefetchedLinks.has(href)) {
				const link = document.createElement("link");
				link.setAttribute("rel", "prefetch");
				link.setAttribute("href", href);
				document.head.appendChild(link);
				prefetchedLinks.add(href);
				console.log("Prefetching:", href);
			}
		}

		function prerenderLink(href) {
			if (!prefetchedLinks.has(href)) {
				const link = document.createElement("link");
				link.setAttribute("rel", "prerender");
				link.setAttribute("href", href);
				document.head.appendChild(link);
				prefetchedLinks.add(href);
				console.log("Prerendering:", href);
			}
		}

		// Set up link event listeners
		links.forEach((link) => {
			link.addEventListener("click", function (e) {
				const destinationUrl = new URL(link.href);

				// Only trigger transition for internal links without hash targets or new tab links
				if (
					destinationUrl.hostname === window.location.hostname &&
					!link.hash &&
					link.target !== "_blank"
				) {
					e.preventDefault();

					// Prefetch the destination page
					prerenderLink(destinationUrl.href);

					// Determine current and target themes and destinations
					const currentTheme = aethos.settings.theme || "default";
					const currentDestination = aethos.settings.destination || "default"; // Track current destination

					const { targetTheme, targetDestination } =
						getThemeAndDestinationFromUrl(destinationUrl.pathname);

					console.log(
						`Going from theme: ${currentTheme}, destination: ${currentDestination} -> theme: ${targetTheme}, destination: ${targetDestination}`
					);

					// Skip transition if both destinations are unknown AND themes are the same
					if (
						currentDestination === "default" &&
						targetDestination === "default" &&
						currentTheme === targetTheme
					) {
						console.log(
							"Both current and target destinations are default, and themes are the same. Skipping transition."
						);
						setTimeout(() => {
							window.location.assign(destinationUrl.href);
						}, 0);
						return;
					}

					// Play transition if themes or destinations are different
					if (
						currentTheme !== targetTheme ||
						currentDestination !== targetDestination
					) {
						playPageTransition(currentTheme, targetTheme, () => {
							console.log("Navigating with transition:", destinationUrl.href);
							localStorage.setItem("aethos_transition", "true");
							setTimeout(() => {
								window.location.assign(destinationUrl.href);
							}, 0);
						});
					} else {
						console.log("Navigating without transition:", destinationUrl.href);
						localStorage.setItem("aethos_transition", "false");
						setTimeout(() => {
							window.location.assign(destinationUrl.href);
						}, 0);
					}
				}
			});
		});

		function getThemeAndDestinationFromUrl(pathname) {
			// Check for /club or /clubs at the start of the URL
			if (pathname.startsWith("/club") || pathname.startsWith("/clubs")) {
				return { targetTheme: "club", targetDestination: "club" };
			}

			// Check for /destinations/.../club
			const clubInDestinationsMatch = pathname.match(
				/^\/destinations\/[^\/]+\/club/
			);
			if (clubInDestinationsMatch) {
				return { targetTheme: "club", targetDestination: "club" };
			}

			// Check for /hotels/x or /destinations/x
			const hotelMatch = pathname.match(/^\/destinations\/([^\/]+)/);
			if (hotelMatch) {
				const slug = hotelMatch[1]; // Extract the destination slug
				const theme = aethos.destinations?.[slug]?.theme || "default";
				return { targetTheme: theme.toLowerCase(), targetDestination: slug };
			}

			// Default theme and destination
			return { targetTheme: "default", targetDestination: "default" };
		}

		function playPageTransition(theme1, theme2, onComplete) {
			console.log("Initializing Lottie animation...");

			// Hide the Lottie container initially
			gsap.set(aethos.transition.container, { display: "none" });

			// Update the Lottie animation colors based on themes
			updateLottieColors(aethos.transition.lottie, theme1, theme2);

			// Force Lottie renderer to refresh with updated colors
			aethos.transition.lottie.goToAndStop(
				aethos.transition.lottie.totalFrames - 1,
				true
			);
			aethos.transition.lottie.renderer.renderFrame(
				aethos.transition.lottie.currentFrame
			);
			aethos.transition.lottie.goToAndStop(0, true);
			console.log(`Lottie colors updated: ${theme1} -> ${theme2}`);

			// Once colors are updated, start the animation
			startLottieAnimation(theme1, theme2, onComplete);
		}

		function startLottieAnimation(theme1, theme2, onComplete) {
			console.log("Starting Lottie animation...");

			// Display the transition overlay
			gsap.set(aethos.transition.element, { display: "flex" });

			// Disable scrolling
			if (aethos.smoother) {
				aethos.smoother.paused(true);
			}

			// Fade in transition element using CSS animations
			aethos.transition.element.classList.remove("fade-out");
			aethos.transition.element.classList.add("fade-in");

			// Create the GSAP timeline for the transition
			let tl = gsap.timeline({
				paused: true,
				delay: 0,
				onComplete: () => {
					console.log("Transition complete.");
					onComplete();
				},
			});

			// Play the Lottie animation
			let playhead = { frame: 0 };
			tl.to(
				playhead,
				{
					frame: aethos.transition.lottie.totalFrames - 1,
					duration: 3.16,
					ease: "none",
					onUpdate: () => {
						aethos.transition.lottie.goToAndStop(playhead.frame, true);
					},
					onStart: () => console.log("Lottie animation started."),
					onComplete: () => console.log("Lottie animation completed."),
				},
				0.6
			);

			tl.fromTo(
				aethos.transition.element,
				{ backgroundColor: aethos.transition.themes[theme1].background },
				{
					backgroundColor: aethos.transition.themes[theme2].background,
					duration: 1,
				},
				1.6
			);

			tl.set(
				aethos.transition.container,
				{
					display: "block",
				},
				0.1
			);

			// Play the timeline
			console.log("Starting GSAP timeline...");
			tl.play();
		}

		// Update Lottie colors based on themes
		function updateLottieColors(animation, currentTheme, destinationTheme) {
			const startColor =
				aethos.transition.themes[currentTheme].foreground ||
				aethos.transition.themes.default.foreground;
			const endColor =
				aethos.transition.themes[destinationTheme].foreground ||
				aethos.transition.themes.default.foreground;

			console.log(destinationTheme);

			const elements = animation.renderer.elements;

			// Recursive function to traverse shapes
			function processShapes(shapes) {
				shapes.forEach((shape) => {
					// If the shape is a group, recursively process its items
					if (shape.ty === "gr") {
						// console.log("Processing group:", shape.nm);
						processShapes(shape.it); // Process the group's items
					}

					// Handle animated fills
					else if (shape.ty === "fl" && shape.c && shape.c.a === 1) {
						// console.log("Updating animated fill for shape:", shape.nm);
						const keyframes = shape.c.k;

						if (keyframes[0]) keyframes[0].s = startColor; // Start color
						if (keyframes[keyframes.length - 1])
							keyframes[keyframes.length - 1].s = endColor; // End color
					}

					// Handle static fills
					else if (shape.ty === "fl" && shape.c && shape.c.a === 0) {
						// console.log("Updating static fill for shape:", shape.nm);
						shape.c.k = startColor; // Update static color directly
					}

					// Handle strokes
					else if (shape.ty === "st" && shape.c && shape.c.a === 0) {
						// console.log("Updating static stroke for shape:", shape.nm);
						shape.c.k = startColor; // Update static stroke color
					}

					// Log unhandled shapes
					else {
						// console.log("Unhandled shape type or missing properties:", shape);
					}
				});
			}

			// Process each element's shapes
			elements.forEach((element) => {
				if (element.data.ty === 4) {
					// Vector shape layer
					processShapes(element.data.shapes);
				}
			});
		}
	};

	/* CALL FUNCTIONS */
	aethos.functions.nav();
	aethos.functions.buildDestinationNav();
	aethos.functions.hiddenFormFields();
	aethos.functions.handleCMSLoad();
	aethos.functions.handleCMSFilter();
	aethos.functions.hideEmptySections();
	aethos.anim.splitText();
	aethos.anim.splitTextBasic();
	aethos.anim.fadeUp();
	aethos.anim.staggerIn();
	aethos.anim.smoothScroll();
	aethos.anim.filterDrawerOpenClose();
	aethos.anim.HoverTrigger();
	aethos.anim.arch();
	aethos.anim.arch_short();
	aethos.anim.NavImage();
	aethos.anim.loadSliders();
	aethos.anim.navReveal();
	aethos.anim.values();
	aethos.anim.articleSticky();
	aethos.anim.journalSticky();
	aethos.map.init();
	aethos.anim.loadHero();
	aethos.functions.loadVibes();
	aethos.functions.addExperienceFilterLinks();
	aethos.functions.formatDates();
	aethos.functions.dateSuffixes();
	aethos.anim.clubMemberships();
	aethos.anim.faq();
	aethos.anim.benefits();
	aethos.functions.listingLinks();
	aethos.functions.updateSubscribeFormName();
	aethos.functions.loadVideos();
	aethos.anim.carousel();
	aethos.functions.patches();
	aethos.functions.retreatOutline();
	aethos.functions.calc();
	aethos.anim.addClubNavHover();
	aethos.functions.langSwitcherClose();
	aethos.anim.mblLangSlider();
	aethos.functions.formSubmissionStyling();
	aethos.anim.wellTabsUnderline();
	aethos.functions.clubNav();
	// aethos.functions.toggleNormaliseScroll();
	aethos.anim.pageTransition();

	// aethos.anim.loader = function () {
	// 	console.log("Loader function initiated");

	// 	// Only run this function if the pageLoader setting is true and the loader hasn't run before
	// 	// if (
	// 	// 	!aethos.settings.pageLoader ||
	// 	// 	localStorage.getItem("aethos_loader_ran")
	// 	// ) {
	// 	// 	console.log("Loader already ran or pageLoader setting is false");
	// 	// 	return;
	// 	// }

	// 	// console.log("Setting loader as played in local storage");

	// 	// // Mark the loader as "played" in local storage, expiring in 30 days
	// 	// const expirationDate = new Date();
	// 	// expirationDate.setDate(expirationDate.getDate() + 30);
	// 	// localStorage.setItem("aethos_loader_ran", true);
	// 	// localStorage.setItem("aethos_loader_expiration", expirationDate.getTime());
	// 	// console.log("Local storage keys set:", {
	// 	// 	aethos_loader_ran: true,
	// 	// 	aethos_loader_expiration: expirationDate.getTime(),
	// 	// });

	// 	// Get elements
	// 	let header = document.querySelector(".header");
	// 	let loader = document.querySelector(".site-loader");
	// 	console.log("Elements selected:", { header, loader });

	// 	// Load Lottie animation
	// 	let loader_lottie = lottie.loadAnimation({
	// 		container: document.querySelector(".site-loader_lottie"),
	// 		renderer: "svg",
	// 		loop: false,
	// 		autoplay: false,
	// 		path: "https://cdn.prod.website-files.com/668fecec73afd3045d3dc567/66d03670c7268e6c895d7847_Aethos%20Logo%20Lottie%20v2.json",
	// 	});
	// 	console.log("Lottie animation loaded");

	// 	let playhead = { frame: 0 };

	// 	// Set initial states
	// 	console.log("Setting initial states for GSAP animations");
	// 	gsap.set(loader, { display: "flex", autoAlpha: 0.5 });
	// 	// gsap.set(".site-loader_overlay-bottom", { backgroundColor: "black" });
	// 	gsap.set(".site-loader_lottie", { autoAlpha: 1, display: "block" });
	// 	gsap.set(".site-loader_logo", { height: "auto", autoAlpha: 0 });
	// 	gsap.set(".site-loader_img-container", { autoAlpha: 0 });
	// 	gsap.set(".site-loader_img", { scale: 0.75 });
	// 	gsap.set([".header-bar_left", ".header-bar_right"], { y: "200%" });
	// 	// gsap.set(".site-loader_overlay-top", { backgroundColor: "black" });
	// 	gsap.set(".header-bar_middle", { autoAlpha: 0 });
	// 	gsap.set(".site-loader_img-wrap", { width: "50%", height: "75%" });
	// 	gsap.set(".hero-home_content", { autoAlpha: 0, y: "20%" });

	// 	console.log("Initial states set");

	// 	// Create timeline
	// 	console.log("Creating GSAP timeline");
	// 	let tl = gsap.timeline({ paused: true });

	// 	// Play Lottie animation [5s]
	// 	tl.to(playhead, {
	// 		frame: loader_lottie.totalFrames - 1,
	// 		duration: 5,
	// 		ease: "none",
	// 		onUpdate: () => {
	// 			loader_lottie.goToAndStop(playhead.frame, true);
	// 			// console.log("Lottie animation playhead updated:", playhead.frame);
	// 		},
	// 	});

	// 	// Logo height animation, occurs simultaneously with Lottie [5.3s]
	// 	tl.to(".site-loader_logo", { height: "100%", duration: 5 }, 0.3);

	// 	// At 5.3 seconds: lottie fades out, logo fades in, overlay colors change
	// 	tl.to(
	// 		".site-loader_lottie",
	// 		{ autoAlpha: 0, duration: 1.25, ease: "power4.inOut" },
	// 		5.3
	// 	);
	// 	tl.to(
	// 		".site-loader_logo",
	// 		{ autoAlpha: 1, duration: 1.25, ease: "power4.inOut" },
	// 		5.3
	// 	);
	// 	tl.to(
	// 		".site-loader_overlay-bottom",
	// 		{ backgroundColor: "black", duration: 1.25, ease: "power4.inOut" },
	// 		5.3
	// 	);
	// 	tl.to(
	// 		".site-loader_overlay-top",
	// 		{ backgroundColor: "transparent", duration: 1.25, ease: "power4.inOut" },
	// 		5.3
	// 	);

	// 	// At 5.55s: Show image container [1s ease in]
	// 	tl.to(
	// 		".site-loader_img-container",
	// 		{ autoAlpha: 1, duration: 1, ease: "power4.in" },
	// 		5.55
	// 	);

	// 	// At 6.55s: Scale image to 1, adjust logo, move header bars, adjust image wrap [various durations]
	// 	tl.to(
	// 		".site-loader_img",
	// 		{ scale: 1, duration: 1.5, ease: "power4.inOut" },
	// 		6.55
	// 	);
	// 	tl.to(
	// 		".site-loader_logo",
	// 		{ height: "auto", duration: 1.5, ease: "power4.inOut" },
	// 		6.55
	// 	);
	// 	tl.to(
	// 		".header-bar_left",
	// 		{ y: "0%", duration: 0.4, ease: "power4.inOut" },
	// 		6.55
	// 	);
	// 	tl.to(
	// 		".header-bar_right",
	// 		{ y: "0%", duration: 0.4, ease: "power4.inOut" },
	// 		6.55
	// 	);
	// 	tl.to(
	// 		".site-loader_img-wrap",
	// 		{ width: "100%", height: "100%", duration: 0.5, ease: "linear" },
	// 		6.55
	// 	);

	// 	// At 8.8s: Show hero-home content [0.4s ioq]
	// 	tl.to(
	// 		".hero-home_content",
	// 		{ autoAlpha: 1, y: "0%", duration: 0.4, ease: "power4.inOut" },
	// 		8.8
	// 	);

	// 	// At 9.2s: Show header middle bar and hide loader
	// 	tl.to(
	// 		".header-bar_middle",
	// 		{ autoAlpha: 1, display: "flex", duration: 0 },
	// 		9.2
	// 	);
	// 	tl.to(loader, { autoAlpha: 0, display: "none", duration: 0 }, 9.2);

	// 	console.log("Timeline animations created and playing");

	// 	// Disable scrolling
	// 	if (aethos.smoother) {
	// 		aethos.smoother.paused(true);
	// 	}

	// 	// Play the timeline
	// 	tl.play();

	// 	console.log("Timeline started playing");
	// 	console.log("Loader function completed");

	// 	// enable scrolling
	// 	if (aethos.smoother) {
	// 		aethos.smoother.paused(false);
	// 	}
	// };

	// // Check and remove expired local storage entry for loader animation
	// aethos.helpers.clearExpiredLoader = function () {
	// 	console.log("Checking for expired loader local storage entry");
	// 	const expiration = localStorage.getItem("aethos_loader_expiration");
	// 	if (expiration && new Date().getTime() > expiration) {
	// 		console.log("Loader local storage expired, clearing keys");
	// 		localStorage.removeItem("aethos_loader_ran");
	// 		localStorage.removeItem("aethos_loader_expiration");
	// 	} else {
	// 		console.log("Loader local storage is still valid");
	// 	}
	// };

	// // Call clearExpiredLoader when the page loads
	// aethos.helpers.clearExpiredLoader();
	// aethos.anim.loader();
}
