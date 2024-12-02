function main() {
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

		ScrollSmoother.create({
			smooth: 1,
			effects: true,
			content: "#smooth-content",
			wrapper: "#smooth-wrapper",
			// normalizeScroll: true,
			onUpdate: () => {},
			onRefresh: () => {
				// Ensure the scroll trigger is refreshed once the smooth scroll has recalculated the height
				ScrollTrigger.refresh();
			},
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
				}
			}
			if (aethos.settings.theme == "club") {
				if (window.innerWidth <= aethos.breakpoints.tab) {
					document.body.classList.remove(aethos.helpers.clubNavClass);
					document.body.classList.remove(aethos.helpers.globalNavClass);
				}
			}
		}

		// Check for nav buttons before adding event listeners
		const navBtn = document.querySelector(".nav-btn");
		// const destNavBtn = document.querySelector(".dest-nav-btn");

		if (navBtn) {
			navBtn.addEventListener("click", () => {
				document.body.classList.toggle(aethos.helpers.globalNavClass);
				ScrollTrigger.refresh();
			});
		}

		// if (destNavBtn)
		// 	destNavBtn.addEventListener("click", () => toggleNavClass(destNavClass)); // we move this later since the dest nav is added dynamically

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
			targets.forEach((target) => {
				let splide = new Splide(target, options);

				if (useProgressBar) {
					let progressWrapper = target.querySelector(".progress");
					let bar = target.querySelector(".progress_bar");

					// Update progress bar position on carousel move
					splide.on("mounted dragged", function () {
						updateProgressBar();
					});

					// Function to update the progress bar
					function updateProgressBar() {
						if (!bar) {
							return;
						}
						// Set bar width relative to slide count
						let count = splide.Components.Controller.getEnd() + 1;
						bar.style.width = `${100 / count}%`;

						// Move bar based on scroll position
						const { Layout, Move, Direction } = splide.Components;
						const position = Direction.orient(Move.getPosition());
						const base = Layout.sliderSize() - Layout.listSize();

						// Calculate the scroll rate (progress)
						let rate = position / base;

						// Ensure the rate is clamped between 0 and 1 to avoid overshooting
						rate = Math.min(Math.max(rate, 0), 1);

						// Calculate the maximum movement in the x-direction for the progress bar
						const maxX = (count - 1) * 100; // The bar can move up to (N-1) * 100%

						// Use GSAP to animate the 'x' transform of the progress bar
						gsap.to(bar, {
							duration: 0.3, // Animation duration
							x: `${rate * maxX}%`, // Move the bar between 0% and (N-1) * 100%
							ease: "power2.out", // Easing function for smoother transitions
						});
					}

					// // Click event to move carousel based on click position on the progress bar
					// progressWrapper.addEventListener("click", function (e) {
					// 	let rect = progressWrapper.getBoundingClientRect();
					// 	let clickPos = (e.clientX - rect.left) / rect.width;
					// 	let targetSlide = Math.floor(clickPos * splide.length);
					// 	splide.go(targetSlide);
					// });

					// // Draggable progress bar
					// let isDragging = false;

					// progressWrapper.addEventListener("mousedown", function (e) {
					// 	isDragging = true;
					// });

					// document.addEventListener("mouseup", function () {
					// 	if (isDragging) {
					// 		isDragging = false;

					// 		// Snap to the closest slide when dragging ends
					// 		let slideCount = splide.Components.Controller.getEnd() + 1;
					// 		let rate = parseFloat(bar.style.left) / 100;
					// 		let targetSlide = Math.round(rate * slideCount);
					// 		splide.go(targetSlide); // Moves to the corresponding slide
					// 	}
					// });

					// document.addEventListener("mousemove", function (e) {
					// 	if (isDragging) {
					// 		let rect = progressWrapper.getBoundingClientRect();
					// 		let dragPos = (e.clientX - rect.left) / rect.width;

					// 		// Ensure drag position is within [0, 1]
					// 		dragPos = Math.max(0, Math.min(1, dragPos));

					// 		// Calculate slideCount and maxX movement for the bar
					// 		let slideCount = splide.Components.Controller.getEnd() + 1;
					// 		let maxX = (slideCount - 1) * 100;

					// 		// Use GSAP to animate the 'x' transform of the progress bar during dragging
					// 		gsap.to(bar, {
					// 			duration: 0.1, // Quick animation during dragging
					// 			x: `${dragPos * maxX}%`, // Set the 'x' transform relative to the progress wrapper
					// 			ease: "none", // Linear easing for direct dragging
					// 		});

					// 		// Update carousel position based on the drag position
					// 		let targetPos = dragPos * splide.Components.Controller.getEnd();
					// 		splide.Components.Move.move(targetPos);
					// 	}
					// });
				}

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
			const section_bg_color = getComputedStyle(
				document.documentElement
			).getPropertyValue("--color--sand--light");

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
			gsap.set(vimeoContainer, { opacity: 0 }); // hide container at first
			if (!vimeoContainer) return;

			const vimeoId = section.getAttribute("aethos-vimeo-id");
			if (!vimeoId) return;

			const imgs = section.querySelectorAll(".img-cover"); // Fallback/thumbnail images

			let player; // Declare the player variable here to access it across different ScrollTrigger events

			// Use ScrollTrigger to initialize the video loading
			ScrollTrigger.create({
				trigger: section,
				start: "top 90%", // Trigger when the section is 80% in the viewport
				end: "bottom 10%", // Trigger ends when the bottom of the section reaches 20% of the viewport
				onEnter: () => {
					player = initVimeo(vimeoContainer, vimeoId, imgs);
				},
				onLeave: () => {
					if (player) {
						player.pause().catch(function (error) {
							console.error(`Error pausing video ${vimeoId}:`, error);
						});
					}
				},
				onEnterBack: () => {
					if (player) {
						player.play().catch(function (error) {
							console.error(`Error resuming video ${vimeoId}:`, error);
						});
					}
				},
				onLeaveBack: () => {
					if (player) {
						player.pause().catch(function (error) {
							console.error(`Error pausing video ${vimeoId}:`, error);
						});
					}
				},
			});
		});

		function initVimeo(vimeoContainer, vimeoId, imgs) {
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

			const player = new Vimeo.Player(vimeoContainer, options);

			player.on("loaded", function () {
				// Attempt to play the video
				player.play().catch(function (error) {
					console.error(`Error playing video ${vimeoId}:`, error);
				});

				// Transition from image to video
				gsap.to(imgs, { opacity: 0, duration: 0.5 });
				gsap.to(vimeoContainer, { opacity: 1, duration: 1.5 });
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

	/* underline effect on hover for tabs */
	aethos.anim.wellTabsUnderline = function () {
		const tabMenu = document.querySelector(".well-tabs_menu");
		if (!tabMenu) {
			return;
		}
		const tabs = tabMenu.querySelectorAll(".well-tabs_link");
		const dropdownToggleLabel = document.querySelector(
			".well-tabs_dd-toggle .label-heading"
		);

		function updateUnderline() {
			// Find the currently active tab
			const activeTab = tabMenu.querySelector(".well-tabs_link.is-active");
			if (!activeTab) return;

			// Recalculate underline position and width
			const menuRect = tabMenu.getBoundingClientRect();
			const activeTabRect = activeTab.getBoundingClientRect();
			const offsetX = activeTabRect.left - menuRect.left;

			tabMenu.style.setProperty(
				"--tabs-underline-width",
				`${activeTabRect.width}px`
			);
			tabMenu.style.setProperty("--tabs-underline-offset-x", `${offsetX}px`);
		}

		tabs.forEach((tab) => {
			tab.addEventListener("click", (event) => {
				event.preventDefault();

				// Ensure we are working with the `.well-tabs_link` element
				const clickedTab = event.target.closest(".well-tabs_link");
				if (!clickedTab) return;

				// Update underline position and width
				tabs.forEach((t) => t.classList.remove("is-active"));
				clickedTab.classList.add("is-active");
				updateUnderline();

				// Update dropdown toggle label with clicked tab text
				const clickedTabLabel =
					clickedTab.querySelector(".label-heading").textContent;
				if (dropdownToggleLabel) {
					dropdownToggleLabel.textContent = clickedTabLabel;
				}
			});
		});

		// Initialize the underline position and dropdown toggle label for the default active tab
		updateUnderline();
		const activeTab =
			tabMenu.querySelector(".well-tabs_link.is-active") || tabs[0];
		if (dropdownToggleLabel) {
			const initialTabLabel =
				activeTab.querySelector(".label-heading").textContent;
			dropdownToggleLabel.textContent = initialTabLabel;
		}

		// Update underline position and width on window resize
		window.addEventListener("resize", updateUnderline);
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
		let smoother = null;

		// Check if any navigation menu is open
		const isNavOpen = () =>
			document.body.classList.contains("nav-open") ||
			document.body.classList.contains("dest-nav-open") ||
			document.body.classList.contains("club-nav-open");

		// Initialize smooth scroll
		const initSmoothScroll = () => {
			if (!smoother) {
				smoother = ScrollSmoother.create({
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
			if (smoother) {
				smoother.kill();
				smoother = null;
				console.log("Smooth Scroll disabled.");
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
	// aethos.anim.smoothScroll();
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
	aethos.functions.toggleNormaliseScroll();
}
