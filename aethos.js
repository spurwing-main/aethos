function main() {
	aethos.log("Running latest version");
	aethos.settings.dev = aethos.settings.dev || {};

	// Function to get URL parameters
	function getParam(name) {
		const params = new URLSearchParams(window.location.search);
		return params.get(name);
	}

	// Update settings based on parameters, default to true
	aethos.settings.dev.splide = getParam("splide") !== "off";
	aethos.settings.dev.smooth = getParam("smooth") !== "off";
	aethos.settings.dev.headerReveal = getParam("headerReveal") !== "off";
	aethos.settings.dev.all = getParam("all") !== "off";
	aethos.log("Updated aethos.settings.dev:", aethos.settings.dev);

	/******/
	/***  INITIAL SET UP - SETTINGS AND LINKS ***/
	/******/

	// Get themes
	(function getThemes() {
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
	(function loadSettings() {
		const pageWrap = document.querySelector(".page-wrap");

		if (pageWrap) {
			aethos.settings.pageWrap = pageWrap;
			aethos.settings.pageBg = pageWrap.getAttribute("aethos-page-bg") || "";
			aethos.settings.pageName =
				pageWrap.getAttribute("aethos-page-name") || "";
			aethos.settings.siteLoader =
				pageWrap.getAttribute("aethos-site-loader") || "";
			aethos.settings.destinationSlug =
				pageWrap.getAttribute("aethos-destination-slug") || "";
			aethos.settings.destinationStatus =
				pageWrap.getAttribute("aethos-destination-status") || "";
			const themeAttribute = pageWrap.getAttribute("aethos-theme");
			aethos.settings.theme = themeAttribute
				? themeAttribute.toLowerCase()
				: "";

			// Log settings without circular references
			const loggableSettings = { ...aethos.settings };
			delete loggableSettings.pageWrap;
			aethos.log(`Page settings loaded: ${JSON.stringify(loggableSettings)}`);
		} else {
			aethos.log("No .page-wrap element found.");
		}
	})();

	/* load destination data */
	(function loadDestinationData() {
		const destinations = document.querySelectorAll(".dest-data_item");

		destinations.forEach((item) => {
			const slug = item.getAttribute("aethos-destination-slug");
			const theme = item.getAttribute("aethos-theme");
			const name = item.getAttribute("aethos-destination-name") || slug;
			const status = item.getAttribute("aethos-status") || "active";
			const instagram = item.getAttribute("aethos-destination-ig");
			const facebook = item.getAttribute("aethos-destination-fb");
			const mewsId = item.getAttribute("aethos-destination-mews-id");
			const cityId = item.getAttribute("aethos-destination-city-id");

			aethos.destinations[slug] = {
				name: name,
				slug: slug,
				theme: theme,
				status: status,
				instagram: instagram,
				facebook: facebook,
				mewsId: mewsId,
				cityId: cityId,
			};

			if (slug == aethos.settings.destinationSlug) {
				aethos.settings.destinationName = name;
				aethos.settings.destinationTheme = theme;
				aethos.settings.destinationStatus = status;
				aethos.settings.destinationInstagram = instagram;
				aethos.settings.destinationFacebook = facebook;
				aethos.settings.destinationMewsId = mewsId;
				aethos.settings.destinationCityId = cityId;
			}
		});

		aethos.log("Destination data loaded");
	})();

	/* load destination data if we have a destination param - e.g. on a listing page */
	(function loadDestinationDataFromParam() {
		const destinationParam = getParam("dest");
		// if we don't have a destination slug in settings but we have a destination param, use the param to get the destination data
		if (!aethos.settings.destinationSlug && destinationParam) {
			const destination = aethos.destinations[destinationParam];
			if (destination) {
				aethos.settings.destinationSlug = destination.slug;
				aethos.settings.destinationName = destination.name;
				aethos.settings.destinationTheme = destination.theme;
				aethos.settings.destinationStatus = destination.status;
				aethos.settings.destinationInstagram = destination.instagram;
				aethos.settings.destinationFacebook = destination.facebook;
				aethos.settings.destinationMewsId = destination.mewsId;
				aethos.settings.destinationCityId = destination.cityId;
				aethos.log("Destination data loaded from destination param");
			}
		}
	})();

	/* redirect if destination is coming soon */
	(function checkIfComingSoon() {
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

	/* update any relative destination links - links of the form ./something on a destination page will be updated to /destinations/destination-name/something */
	(function updateRelativeLinks() {
		if (!aethos || !aethos.settings) {
			console.warn(
				"Aethos settings not found. Skipping relative links update."
			);
			return;
		}

		const destinationSlug = aethos.settings.destinationSlug;

		if (!destinationSlug) {
			aethos.log(
				"Destination slug not found. Assuming this is not a destination page. Skipping relative links update."
			);
			return;
		}

		const relativeLinks = document.querySelectorAll(
			'a[aethos-relative-link][href^="./"], a[aethos-relative-link][href^="http://./"]'
		);

		if (relativeLinks.length === 0) {
			aethos.log(
				"No links with aethos-relative-link attribute and './' or 'http://./' href found."
			);
			return;
		}

		relativeLinks.forEach((link) => {
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
	})();

	// Open all external links in a new tab
	// NB we need to do this after updateRelativeLinks() because we need to have processed relative links first
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

	/******/
	/*** HELPER FUNCTIONS ***/
	/******/

	/* helper to get a custom prop value */
	aethos.helpers.getProp = function (
		propName,
		element = document.documentElement
	) {
		const value = getComputedStyle(element).getPropertyValue(propName).trim();
		if (!value) {
			console.warn(`CSS property "${propName}" not found on the element.`);
			return "";
		} else {
			return value;
		}
	};

	/* pause smooth scroll if exists */
	aethos.helpers.pauseScroll = function (paused = true) {
		if (aethos.smoother) {
			aethos.smoother.paused(paused);
			aethos.log(`Smooth scroll has been ${paused ? "paused" : "resumed"}.`);
		}
	};

	/******/
	/*** GSAP INIT ***/
	/******/

	/* register GSAP plugins */
	gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother, ScrollToPlugin);

	/* hide empty target warnings */
	gsap.config({ nullTargetWarn: false });

	// gsap.registerPlugin(GSDevTools);
	// gsap.registerPlugin(Flip);

	/* set up GSAP smooth scroll */
	aethos.anim.smoothScroll = function () {
		if (!aethos.settings.dev.smooth) {
			return;
		}

		let mm = gsap.matchMedia();

		// add a media query. When it matches, the associated function will run
		mm.add("(min-width: 768px)", () => {
			aethos.smoother = ScrollSmoother.create({
				smooth: 1,
				effects: true,
				content: "#smooth-content",
				wrapper: "#smooth-wrapper",
				normalizeScroll: {
					allowNestedScroll: true,
				},
				onUpdate: () => {},
				onRefresh: () => {
					// Ensure the scroll trigger is refreshed once the smooth scroll has recalculated the height
					ScrollTrigger.refresh();
				},
			});
			// kill smoother on mobile
			return () => {
				if (aethos.smoother) {
					aethos.smoother.kill();
				}
			};
		});
	};

	/******/
	/***  FUNCTIONS - TRANSITIONS & LOADER ***/
	/******/

	/* Page transitions */
	aethos.anim.pageTransition = function () {
		// clear localstorage - we use this to track whether we show second half of transition on a page load
		localStorage.setItem("aethos_transition", "false");

		aethos.transition = {};
		aethos.log("Running page transition setup");

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
				aethos.log("Prefetching: " + href);
			}
		}

		function prerenderLink(href) {
			if (!prefetchedLinks.has(href)) {
				const link = document.createElement("link");
				link.setAttribute("rel", "prerender");
				link.setAttribute("href", href);
				document.head.appendChild(link);
				prefetchedLinks.add(href);
				aethos.log("Prerendering: " + href);
			}
		}

		// Set up link event listeners
		document.addEventListener("click", function (e) {
			const link = e.target.closest("a");

			if (!link) return; // Ignore clicks not on <a> elements

			// Exclude links that are descendants of a `.pagination` element
			if (link.closest(".pagination")) {
				aethos.log("Link inside .pagination element. Skipping.");
				return;
			}

			// Exclude links that are descendants of a `.filters` element
			if (link.closest(".filters")) {
				aethos.log("Link inside .filters element. Skipping.");
				return;
			}

			const destinationHref = link.getAttribute("href");
			const destinationUrl = link.href ? new URL(link.href) : null;

			// Ignore links with empty href or href="#"
			if (!destinationHref || destinationHref === "#") {
				return;
			}

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
				const currentDestination = aethos.settings.destinationSlug || "default"; // Track current destination

				const { targetTheme, targetDestination } =
					getThemeAndDestinationFromUrl(
						destinationUrl.pathname,
						new URLSearchParams(destinationUrl.search)
					);

				aethos.log(
					`Going from theme: ${currentTheme}, destination: ${currentDestination} -> theme: ${targetTheme}, destination: ${targetDestination}`
				);

				// Skip transition if both destinations are unknown AND themes are the same
				if (
					currentDestination === "default" &&
					targetDestination === "default" &&
					currentTheme === targetTheme
				) {
					aethos.log(
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
						aethos.log("Navigating with transition:", destinationUrl.href);
						localStorage.setItem("aethos_transition", "true");
						setTimeout(() => {
							window.location.assign(destinationUrl.href);
						}, 0);
					});
				} else {
					aethos.log("Navigating without transition:", destinationUrl.href);
					localStorage.setItem("aethos_transition", "false");
					setTimeout(() => {
						window.location.assign(destinationUrl.href);
					}, 0);
				}
			}
		});

		function getThemeAndDestinationFromUrl(pathname, searchParams) {
			// Check for /club or /clubs at the start of the URL
			if (pathname.startsWith("/club") || pathname.startsWith("/clubs")) {
				return { targetTheme: "club", targetDestination: "default" };
			}

			// Check for /destinations/.../club
			const clubInDestinationsMatch = pathname.match(
				/^\/destinations\/[^\/]+\/club/
			);
			if (clubInDestinationsMatch) {
				return { targetTheme: "club", targetDestination: "default" };
			}

			// Check for /hotels/x or /destinations/x
			const hotelMatch = pathname.match(/^\/destinations\/([^\/]+)/);
			if (hotelMatch) {
				const slug = hotelMatch[1]; // Extract the destination slug
				if (!aethos.destinations?.[slug]) {
					return { targetTheme: "default", targetDestination: "default" };
				}
				const theme = aethos.destinations[slug].theme || "default";
				return { targetTheme: theme.toLowerCase(), targetDestination: slug };
			}

			// Check for URLs of the form /destination-SOMETHING/destination-name
			const destinationMatch = pathname.match(
				/^\/destination-[^\/]+\/([^\/]+)/
			);
			if (destinationMatch) {
				const slug = destinationMatch[1]; // Extract the destination name
				if (!aethos.destinations?.[slug]) {
					return { targetTheme: "default", targetDestination: "default" };
				}
				const theme = aethos.destinations[slug].theme || "default";
				return { targetTheme: theme.toLowerCase(), targetDestination: slug };
			}

			// Check for listing links with destination stored in search parameters
			if (searchParams) {
				const dest = searchParams.get("dest");
				if (dest) {
					if (!aethos.destinations?.[dest]) {
						return { targetTheme: "default", targetDestination: "default" };
					}
					const theme = aethos.destinations[dest].theme || "default";
					return { targetTheme: theme.toLowerCase(), targetDestination: dest };
				}
			}

			// Default theme and destination
			return { targetTheme: "default", targetDestination: "default" };
		}

		function playPageTransition(theme1, theme2, onComplete) {
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

			// Once colors are updated, start the animation
			startLottieAnimation(theme1, theme2, onComplete);
		}

		function startLottieAnimation(theme1, theme2, onComplete) {
			// Display the transition overlay
			gsap.set(aethos.transition.element, { display: "flex" });

			// Disable scrolling
			aethos.helpers.pauseScroll(true);

			// Fade in transition element using CSS animations
			aethos.transition.element.classList.remove("fade-out");
			aethos.transition.element.classList.add("fade-in");

			// Create the GSAP timeline for the transition
			let tl = gsap.timeline({
				paused: true,
				delay: 0,
				onComplete: () => {
					aethos.log("Transition complete.");
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
					onStart: () => aethos.log("Lottie animation started."),
					onComplete: () => aethos.log("Lottie animation completed."),
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

			const elements = animation.renderer.elements;

			// Recursive function to traverse shapes
			function processShapes(shapes) {
				shapes.forEach((shape) => {
					// If the shape is a group, recursively process its items
					if (shape.ty === "gr") {
						processShapes(shape.it); // Process the group's items
					}

					// Handle animated fills
					else if (shape.ty === "fl" && shape.c && shape.c.a === 1) {
						const keyframes = shape.c.k;

						if (keyframes[0]) keyframes[0].s = startColor; // Start color
						if (keyframes[keyframes.length - 1])
							keyframes[keyframes.length - 1].s = endColor; // End color
					}

					// Handle static fills
					else if (shape.ty === "fl" && shape.c && shape.c.a === 0) {
						shape.c.k = startColor; // Update static color directly
					}

					// Handle strokes
					else if (shape.ty === "st" && shape.c && shape.c.a === 0) {
						shape.c.k = startColor; // Update static stroke color
					}

					// Log unhandled shapes
					else {
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

	/* site loader */
	aethos.anim.loader = function () {
		// Check if loader is enabled, if this is the user's first visit in 30 days,
		// or if a specific URL parameter forces the loader.
		const urlParams = new URLSearchParams(window.location.search);
		const forceLoader = urlParams.has("forceLoader");
		const suppressLoader = urlParams.has("suppressLoader");

		let loader = document.querySelector(".site-loader");
		if (!loader) {
			return;
		}

		// Check last visit time (30-minute window)
		function hasRecentVisit() {
			const lastVisit = localStorage.getItem("aethos_last_visit");
			if (!lastVisit) return false;
			return Date.now() - parseInt(lastVisit, 10) < 30 * 60 * 1000; // 30 minutes in ms
		}

		if (
			!forceLoader &&
			(suppressLoader ||
				aethos.settings.siteLoader !== "enabled" ||
				hasRecentVisit())
		) {
			aethos.log("Page loader not running");
			// Store current visit time
			localStorage.setItem("aethos_last_visit", Date.now().toString());
			gsap.to(loader, { autoAlpha: 0, duration: 0.4, delay: 0.2 });
			// var tl_hide = gsap.timeline();
			// tl_hide.to(loader, { autoAlpha: 0, duration: 0.3 });
			// tl_hide.set(loader, { display: "none" });
			return;
		}

		aethos.log("Page loader running");

		// Store current visit time
		localStorage.setItem("aethos_last_visit", Date.now().toString());

		requestAnimationFrame(() => {
			// Disable scrolling
			aethos.helpers.pauseScroll(true);
		});

		let header = document.querySelector(".header");
		let lottie_container = document.querySelector(".site-loader_lottie");
		let pageBg = aethos.helpers.getProp("--color--page-bg");
		let header_logo_wrap = header?.querySelector(".header-bar_logo-wrap");
		let header_logo = header?.querySelector(".header-bar_middle svg.logo");
		let header_bar_inner = header?.querySelector(".header-bar_inner");

		// Check if any required element is missing
		if (
			!header ||
			!loader ||
			!lottie_container ||
			!header_logo_wrap ||
			!header_logo
		) {
			console.warn("One or more required elements are missing. Exiting...");
			return; // Exit early
		}

		// get height of header logo
		let logo_h = aethos.helpers.getProp("--c--header--logo-h");

		// apply a tiny tweak to this to try to get Lottie logo to line up with header logo
		let logo_marginTop = "0.1rem";
		let adjusted_logo_h = "2.13rem";
		if (window.innerWidth < 768) {
			adjusted_logo_h = "1.563rem";
			adjusted_logo_h = header_bar_inner.offsetHeight + "px";
		}

		let loader_lottie = lottie.loadAnimation({
			container: lottie_container,
			renderer: "svg",
			loop: false,
			autoplay: false,
			path: "https://cdn.prod.website-files.com/668fecec73afd3045d3dc567/67a389b78b1e2fe99b624193_aethoslogo_Siteloader_v4.json",
		});

		gsap.set(loader, { display: "flex" }); // show loader
		gsap.set(".header-bar", { y: "-100%" }); // hide header buttons offscreen at first
		gsap.set(".site-loader_lottie-spacer", { height: 0 }); // this is spacer that pushes logo up. At first it occupies no space, then later we will animate its height to push logo up
		gsap.set(".section-hero-home", { autoAlpha: 0 }); // hide hero at first
		gsap.set(".hero-home_content", { autoAlpha: 0 }); // hide hero content at first
		gsap.set(".hero-home_media-wrap", { scale: 0.75 }); // hero img starts off smaller
		gsap.set(header_logo, { opacity: 0 }); // hide actual header logo at first

		// when lottie loads
		loader_lottie.addEventListener("DOMLoaded", () => {
			// Calculate clip block sizes
			let lottie_rect = lottie_container.getBoundingClientRect();
			const logoRatio = 0.3; // ratio of h to w of logo, used for setting image crop sizes
			let lottie_w = lottie_rect.height / logoRatio;
			let screen_w = window.innerWidth;
			let clip_w = (50 * (screen_w - lottie_w + 0.2 * lottie_w)) / screen_w;
			gsap.set(".site-loader_img-clip.left, .site-loader_img-clip.right", {
				width: clip_w + "%",
			});

			gsap.set(".site-loader_img-clip", { display: "block" }); // show blocks that clip hero image

			let tl = gsap.timeline({ paused: true, onComplete: loaderEnds });

			let playhead = { frame: 0 };

			// play lottie
			tl.to(playhead, {
				frame: loader_lottie.totalFrames - 1,
				duration: 3.5,
				ease: "none",
				onUpdate: () => {
					loader_lottie.goToAndStop(playhead.frame, true);
				},
			});

			// change bg color
			tl.to(loader, { backgroundColor: "transparent", duration: 1 }, 3);

			// show hero (only img is visible at first)
			tl.to(
				".section-hero-home",
				{ autoAlpha: 1, duration: 1, ease: "power4.in" },
				3
			);

			// Scale image up
			tl.to(
				".hero-home_media-wrap",
				{ scale: 1, duration: 1.5, ease: "power4.inOut" },
				3.75
			);

			// shrink the clip elements. top clip stays bigger to allow for larger logo
			tl.to(
				".site-loader_img-clip.left, .site-loader_img-clip.right",
				{ scaleX: 0, duration: 1.5, ease: "power4.inOut" },
				4.05
			);
			tl.to(
				".site-loader_img-clip.bottom",
				{ scaleY: 0, duration: 1.5, ease: "power4.inOut" },
				4.05
			);
			tl.to(
				".site-loader_img-clip.top",
				{ height: "4.5rem", duration: 1.5, ease: "power4.inOut" },
				4.05
			);

			// delete clip elements to avoid weirdness on resize
			tl.call(removeElement(".site-loader_img-clip.left"));
			tl.call(removeElement(".site-loader_img-clip.right"));
			tl.call(removeElement(".site-loader_img-clip.bottom"));

			// scale up the lottie spacer to force lottie up to header position
			tl.to(
				".site-loader_lottie-spacer",
				{ height: "100%", duration: 2, ease: "power4.inOut" },
				4.05
			);

			// show content
			tl.to(
				".hero-home_content",
				{ autoAlpha: 1, duration: 1.5, ease: "power4.inOut" },
				4.5
			);

			// bring in header buttons
			tl.to(".header-bar", { y: 0, duration: 1.5, ease: "power4.inOut" }, 5);

			// get rid of extra space at top
			tl.to(
				".site-loader_img-clip.top",
				{
					height: 0,
					duration: 1.5,
					ease: "power4.inOut",
				},
				"<"
			);

			// shrink lottie to match real logo
			tl.to(
				lottie_container,
				{
					height: adjusted_logo_h,
					marginTop: logo_marginTop,
					duration: 1.5,
					ease: "power4.inOut",
				},
				"<"
			);

			// delete clip elements to avoid weirdness on resize
			tl.call(removeElement(".site-loader_img-clip.top"));

			// Play the timeline
			tl.play();
		});

		function removeElement(element) {
			if (typeof element === "string") {
				element = document.querySelector(element);
			}
			return function () {
				if (element) {
					element.parentNode.removeChild(element);
				}
			};
		}

		// enable scrolling
		function loaderEnds() {
			//move lottie to header and hide original logo
			header_logo_wrap.prepend(lottie_container);
			// header_logo.style.display = "none";
			// gsap.set(header_logo, { opacity: 1 }); // show actual header logo
			gsap.set(loader, { display: "none" }); // hide loader

			// resume scroll
			requestAnimationFrame(() => {
				// Disable scrolling
				aethos.helpers.pauseScroll(false);
			});
		}
	};

	/* site loader */
	aethos.anim.loader_v2 = function () {
		// Check if loader is enabled, if this is the user's first visit in 30 days,
		// or if a specific URL parameter forces the loader.
		const urlParams = new URLSearchParams(window.location.search);
		const forceLoader = urlParams.has("forceLoader");
		const suppressLoader = urlParams.has("suppressLoader");

		let loader = document.querySelector(".site-loader");
		if (!loader) {
			return;
		}

		// Check last visit time (30-minute window)
		function hasRecentVisit() {
			const lastVisit = localStorage.getItem("aethos_last_visit");
			if (!lastVisit) return false;
			return Date.now() - parseInt(lastVisit, 10) < 30 * 60 * 1000; // 30 minutes in ms
		}

		if (
			!forceLoader &&
			(suppressLoader ||
				aethos.settings.siteLoader !== "enabled" ||
				hasRecentVisit())
		) {
			aethos.log("Page loader not running");
			// Store current visit time
			localStorage.setItem("aethos_last_visit", Date.now().toString());
			gsap.to(loader, { autoAlpha: 0, duration: 0.4, delay: 0.2 });
			// var tl_hide = gsap.timeline();
			// tl_hide.to(loader, { autoAlpha: 0, duration: 0.3 });
			// tl_hide.set(loader, { display: "none" });
			return;
		}

		aethos.log("Page loader running");

		// Store current visit time
		localStorage.setItem("aethos_last_visit", Date.now().toString());

		requestAnimationFrame(() => {
			// Disable scrolling
			aethos.helpers.pauseScroll(true);
		});

		let header = document.querySelector(".header");
		let lottie_container = document.querySelector(".site-loader_lottie");
		let pageBg = aethos.helpers.getProp("--color--page-bg");
		let header_logo_wrap = header?.querySelector(".header-bar_logo-wrap");
		let header_logo = header?.querySelector(".header-bar_middle svg.logo");

		// Check if any required element is missing
		if (
			!header ||
			!loader ||
			!lottie_container ||
			!header_logo_wrap ||
			!header_logo
		) {
			console.warn("One or more required elements are missing. Exiting...");
			return; // Exit early
		}

		// get height of header logo
		let logo_h = aethos.helpers.getProp("--c--header--logo-h");

		// apply a tiny tweak to this to try to get Lottie logo to line up with header logo
		let logo_marginTop = "0.1rem";
		let adjusted_logo_h = "2.13rem";
		if (window.innerWidth < 768) {
			adjusted_logo_h = "1.563rem";
		}

		let loader_lottie = lottie.loadAnimation({
			container: lottie_container,
			renderer: "svg",
			loop: false,
			autoplay: false,
			path: "https://cdn.prod.website-files.com/668fecec73afd3045d3dc567/67a389b78b1e2fe99b624193_aethoslogo_Siteloader_v4.json",
		});

		gsap.set(loader, { display: "flex" }); // show loader
		gsap.set([".header-bar_left", ".header-bar_right"], { y: "-200%" }); // hide header buttons offscreen at first
		gsap.set(".site-loader_lottie-spacer", { height: 0 }); // this is spacer that pushes logo up. At first it occupies no space, then later we will animate its height to push logo up
		gsap.set(".section-hero-home", { autoAlpha: 0 }); // hide hero at first
		gsap.set(".hero-home_content", { autoAlpha: 0 }); // hide hero content at first
		gsap.set(".hero-home_media-wrap", { scale: 0.75 }); // hero img starts off smaller
		gsap.set(header_logo, { opacity: 0 }); // hide actual header logo at first

		// when lottie loads
		loader_lottie.addEventListener("DOMLoaded", () => {
			// Calculate clip block sizes
			let lottie_rect = lottie_container.getBoundingClientRect();
			const logoRatio = 0.3; // ratio of h to w of logo, used for setting image crop sizes
			let lottie_w = lottie_rect.height / logoRatio;
			let screen_w = window.innerWidth;
			let clip_w = (50 * (screen_w - lottie_w + 0.2 * lottie_w)) / screen_w;
			gsap.set(".site-loader_img-clip.left, .site-loader_img-clip.right", {
				width: clip_w + "%",
			});

			gsap.set(".site-loader_img-clip", { display: "block" }); // show blocks that clip hero image

			let tl = gsap.timeline({ paused: true, onComplete: loaderEnds });

			let playhead = { frame: 0 };

			// play lottie
			tl.to(playhead, {
				frame: loader_lottie.totalFrames - 1,
				duration: 3.5,
				ease: "none",
				onUpdate: () => {
					loader_lottie.goToAndStop(playhead.frame, true);
				},
			});

			// change bg color
			tl.to(loader, { backgroundColor: "transparent", duration: 1 }, 3);

			// show hero (only img is visible at first)
			tl.to(
				".section-hero-home",
				{ autoAlpha: 1, duration: 1, ease: "power4.in" },
				3
			);

			// Scale image up
			tl.to(
				".hero-home_media-wrap",
				{ scale: 1, duration: 1.5, ease: "power4.inOut" },
				3.75
			);

			// shrink the clip elements. top clip stays bigger to allow for larger logo
			tl.to(
				".site-loader_img-clip.left, .site-loader_img-clip.right",
				{ scaleX: 0, duration: 1.5, ease: "power4.inOut" },
				4.05
			);
			tl.to(
				".site-loader_img-clip.bottom",
				{ scaleY: 0, duration: 1.5, ease: "power4.inOut" },
				4.05
			);
			tl.to(
				".site-loader_img-clip.top",
				{ height: "4.5rem", duration: 1.5, ease: "power4.inOut" },
				4.05
			);

			// delete clip elements to avoid weirdness on resize
			tl.call(removeElement(".site-loader_img-clip.left"));
			tl.call(removeElement(".site-loader_img-clip.right"));
			tl.call(removeElement(".site-loader_img-clip.bottom"));

			// scale up the lottie spacer to force lottie up to header position
			tl.to(
				".site-loader_lottie-spacer",
				{ height: "100%", duration: 2, ease: "power4.inOut" },
				4.05
			);

			tl.add(() => {
				const state = Flip.getState(lottie_container);
				header_logo_wrap.prepend(lottie_container);
				Flip.from(state, {
					duration: 2,
					ease: "power4.inOut",
				});
			}, 4.05);

			// show content
			tl.to(
				".hero-home_content",
				{ autoAlpha: 1, duration: 1.5, ease: "power4.inOut" },
				4.5
			);

			// bring in header buttons
			tl.to(
				[".header-bar_left", ".header-bar_right"],
				{ y: 0, duration: 1.5, ease: "power4.inOut" },
				5
			);

			// get rid of extra space at top
			tl.to(
				".site-loader_img-clip.top",
				{
					height: 0,
					duration: 1.5,
					ease: "power4.inOut",
				},
				"<"
			);

			// gsap.set(lottie_container, { transformOrigin: "top center" });

			//shrink lottie to match real logo
			// tl.to(
			// 	lottie_container,
			// 	{
			// 		height: adjusted_logo_h,
			// 		duration: 1.5,
			// 		ease: "power4.inOut",
			// 	},
			// 	"<"
			// );

			// delete clip elements to avoid weirdness on resize
			tl.call(removeElement(".site-loader_img-clip.top"));

			// Play the timeline
			tl.play();
			// GSDevTools.create(tl);
		});

		function removeElement(element) {
			if (typeof element === "string") {
				element = document.querySelector(element);
			}
			return function () {
				if (element) {
					element.parentNode.removeChild(element);
				}
			};
		}

		// enable scrolling
		function loaderEnds() {
			//move lottie to header and hide original logo
			// header_logo_wrap.prepend(lottie_container);
			// header_logo.style.display = "none";
			// gsap.set(header_logo, { opacity: 1 }); // show actual header logo
			gsap.set(loader, { display: "none" }); // hide loader
			// gsap.set(lottie_container, { display: "none" }); // hide loader

			// resume scroll
			requestAnimationFrame(() => {
				// Disable scrolling
				aethos.helpers.pauseScroll(false);
			});
		}
	};

	/******/
	/***  FUNCTIONS - NAV ***/
	/******/

	// nav open/close animations
	// replaces WF animation
	aethos.functions.nav = function () {
		// nav button
		const navBtn = document.querySelector(".nav-btn");
		if (!navBtn) return;

		// Elements - main nav
		const global_elements = {
			nav: document.querySelector(".nav"),
			bg: document.querySelector(".nav_bg"),
			bar: document.querySelector(".header-bar"),
			overlay: document.querySelector(".nav_links-overlay"),
			content1: document.querySelector(".nav_grid"),
			content2: document.querySelector(".nav_grid-secondary"),
			textSelector: ".nav-btn_text",
			barColor_closed: aethos.helpers.getProp("--color--page-bg"),
			barColor_open: aethos.helpers.getProp("--color--cream--light"),
		};

		// Elements - dest nav
		const dest_elements = {
			nav: document.querySelector(".dest-nav"),
			bg: document.querySelector(".dest-nav_bg"),
			bar: document.querySelector(".header-bar"),
			overlay: null,
			content1: document.querySelector(".dest-nav_content"),
			content2: null,
			textSelector: ".nav-btn_text",
			barColor_closed: aethos.helpers.getProp("--color--page-bg"),
			barColor_open: aethos.helpers.getProp("--color--cream--light"),
		};

		// Classes
		const classes = {
			global: aethos.helpers.globalNavClass || "nav-open",
			dest: aethos.helpers.destNavClass || "dest-nav-open",
			club: aethos.helpers.clubNavClass || "club-nav-open",
		};

		// GSAP timeline defaults
		const tlDefaults = { duration: 0.6, ease: "power4.inOut" };

		// Initialize timelines with defaults
		// GSAP Timelines
		const timelines = {
			open: gsap.timeline({ paused: true, defaults: tlDefaults }),
			close: gsap.timeline({ paused: true, defaults: tlDefaults }),
			burger: gsap.timeline({ paused: true, defaults: tlDefaults }),
		};
		aethos.nav.timelines = timelines; // For debugging

		// Initial state setup
		function setInitialStates(els) {
			aethos.log("Setting initial nav states");
			gsap.set([els.nav, els.content1, els.overlay], { display: "none" });
			gsap.set(els.bar, { backgroundColor: els.barColor_closed });
			gsap.set(els.bg, { display: "none", scaleY: 0, opacity: 0 });
			gsap.set(els.content2, { opacity: 0 });
			gsap.set(els.overlay, { y: 0 });
			gsap.set(els.textSelector, { y: 0 });
		}
		setInitialStates(global_elements);

		// Open nav animation
		function animateOpenNav(tl, els, barColor_open) {
			tl.clear();
			tl.set([els.nav, els.bg, els.overlay], { display: "block" })
				.to(els.textSelector, { y: "-100%" }, 0)
				.to(els.bg, { scaleY: 1, opacity: 1 }, 0)
				.to(els.bar, { backgroundColor: barColor_open }, 0)
				.to(els.overlay, { y: "-200%", duration: 2, ease: "none" }, 0.6)
				.to(
					els.content2,
					{ opacity: 1, duration: 1.2, ease: "power3.inOut" },
					0.6
				)
				.set(els.content1, { display: "grid" }, 0.6);
		}

		// Close nav animation
		function animateCloseNav(tl, els, barColor_closed) {
			tl.clear();
			tl.to(els.overlay, { y: 0, duration: 0.75, ease: "none" }, 0)
				.to(els.content2, { opacity: 0 }, 0)
				.to(els.textSelector, { y: 0 }, 0)
				.to(els.bg, { scaleY: 0, duration: 0.8 }, 0.75)
				.set(els.content1, { display: "none" }, 0.75)
				.to(els.bg, { opacity: 0, duration: 0.8 }, 1.05)
				.to(
					els.bar,
					{
						backgroundColor: barColor_closed,
						duration: 0.8,
						ease: "power4.out",
					},
					1.05
				)
				.set([els.nav, els.bg], { display: "none" }, 1.85);
		}

		// Initialize animations
		animateOpenNav(
			aethos.nav.timelines.open,
			global_elements,
			global_elements.barColor_open
		);
		animateCloseNav(
			aethos.nav.timelines.close,
			global_elements,
			global_elements.barColor_closed
		);

		// burger timeline - this was just a CSS animation but this fails for some reason on Masterbrand pages
		function setUpBurgerTimeline() {
			aethos.nav.timelines.burger.to(
				".nav-btn_icon-wrap > svg path:nth-child(1)",
				{
					rotate: 45,
					y: 7,
					duration: 0.4,
					ease: "easeInOut",
				},
				0
			);

			aethos.nav.timelines.burger.to(
				".nav-btn_icon-wrap > svg path:nth-child(2)",
				{
					opacity: 0,
					duration: 0.2,
					ease: "easeInOut",
				},
				0
			); // Fade out slightly earlier

			aethos.nav.timelines.burger.to(
				".nav-btn_icon-wrap > svg path:nth-child(3)",
				{
					rotate: -45,
					y: -7,
					duration: 0.4,
					ease: "easeInOut",
				},
				0
			);
		}
		setUpBurgerTimeline();

		// Track nav state
		aethos.nav.isNavOpen = aethos.nav.isNavOpen || false;

		// Close nav
		aethos.nav.close = function () {
			aethos.log("close nav");
			// Play close animation
			aethos.nav.timelines.close.play(0);
			// remove class
			// aethos.nav.timelines.burger.reverse();
			document.body.classList.remove(classes.global);
			// enable scroll
			ScrollTrigger.refresh();
			aethos.helpers.pauseScroll(false);
			// update
			aethos.nav.isNavOpen = false;
			aethos.nav.forceShowHeader(false);
		};

		// Open nav
		aethos.nav.open = function () {
			aethos.log("open nav");
			// force open header
			aethos.nav.forceShowHeader(true);
			// Play open animation
			aethos.nav.timelines.open.play(0);
			// add class
			// aethos.nav.timelines.burger.play(0);
			document.body.classList.add(classes.global);
			// disable scroll
			ScrollTrigger.refresh();
			aethos.helpers.pauseScroll(true);
			// update
			aethos.nav.isNavOpen = true;
		};

		// Toggle nav
		aethos.nav.toggleNav = function () {
			aethos.log("isNavOpen: " + aethos.nav.isNavOpen);

			// if an animation is running, pause it
			if (aethos.nav.timelines.close.isActive()) {
				aethos.nav.timelines.close.pause();
			}
			if (aethos.nav.timelines.open.isActive()) {
				aethos.nav.timelines.open.pause();
			}

			// open or close nav
			if (aethos.nav.isNavOpen) {
				aethos.nav.close();
			} else {
				aethos.nav.open();
			}
		};

		// force close - used after back button
		aethos.nav.forceClose = function () {
			aethos.log("force close nav");
			// pause open if running
			if (aethos.nav.timelines.open.isActive()) {
				aethos.nav.timelines.open.pause();
			}
			// run close immediately
			aethos.nav.timelines.close.progress(1);
			// reset everything back to initial state in case browser preserves some inline styles
			setInitialStates(global_elements);
			// remove class
			document.body.classList.remove(classes.global);
			// update bool
			aethos.nav.isNavOpen = false;
			// turn on scroll
			aethos.helpers.pauseScroll(false);
		};

		// Remove existing event listener, if any
		navBtn.removeEventListener("click", aethos.nav.toggleNav);

		// Add event listener
		navBtn.addEventListener("click", aethos.nav.toggleNav);

		// close nav when window resized to mbl
		function handleResize(width) {
			// for default theme - mbl and smaller
			if (aethos.settings.theme == "default" || !aethos.settings.theme) {
				if (width <= aethos.breakpoints.mbl) {
					aethos.nav.close();
				}
			}
			// dest - remove dest nav class on tab and smaller on close
			if (
				aethos.settings.theme &&
				aethos.settings.theme !== "default" &&
				aethos.settings.theme !== "club"
			) {
				if (width <= aethos.breakpoints.tab) {
					document.body.classList.remove(classes.dest);
					document.body.classList.remove(classes.global);
				}
			}
			// club
			if (aethos.settings.theme == "club") {
				if (width <= aethos.breakpoints.tab) {
					document.body.classList.remove(classes.club);
					document.body.classList.remove(classes.global);
				}
			}
		}

		// Add resize event listener to handle window resizing - for width only
		var prevWidth = window.innerWidth;
		window.addEventListener("resize", function () {
			var width = window.innerWidth;
			if (width !== prevWidth) {
				prevWidth = width;
				handleResize(width);
			}
		});

		// Initial check in case the page loads in mobile size
		// currently disabled as this breaks back button/force close for some reason
		// handleResize();
	};

	/* Header hide/show */
	aethos.anim.headerReveal = function () {
		if (!aethos.settings.dev.headerReveal) {
			return;
		}

		aethos.nav.headerForcedShown = false;
		const hideThreshold = 100; // Distance to scroll before hiding is allowed
		const showThreshold = 50; // Distance from the top where the header is always shown

		// if we are on a non-destination page...

		// if (!aethos.settings.theme || aethos.settings.theme == "default") {

		// EDIT - we no longer handle different themes differently - we just hide/show all
		aethos.nav.headerRevealAnim = gsap
			.from(".headers", {
				yPercent: -100,
				paused: true,
				duration: 0.5,
			})
			.progress(1);

		let lastScrollY = window.scrollY;
		let scrollBuffer = 0;

		aethos.headerScrollTrigger = ScrollTrigger.create({
			start: "top -1px",
			end: "max",
			pin: ".site-header",
			pinSpacing: false,
			onUpdate: (self) => {
				// prevent header from hiding if it was forced to show
				if (aethos.nav.headerForcedShown) {
					return;
				}

				const currentScrollY = window.scrollY;
				const deltaY = currentScrollY - lastScrollY;

				if (currentScrollY <= showThreshold) {
					// **Always show header near top**
					aethos.nav.headerRevealAnim.play();
					scrollBuffer = 0;
				} else if (deltaY > 0 && currentScrollY > hideThreshold) {
					// **Only hide after scrolling past hideThreshold**
					aethos.nav.headerRevealAnim.reverse();
					scrollBuffer = 0;
				} else if (deltaY < 0) {
					// **Reveal header when scrolling up**
					scrollBuffer -= deltaY;
					if (scrollBuffer >= 50) {
						aethos.nav.headerRevealAnim.play();
						scrollBuffer = 0;
					}
				}

				lastScrollY = currentScrollY; // Update last scroll position
			},
		});
		// } else if (aethos.settings.theme == "club") {
		// 	aethos.headerScrollTrigger = ScrollTrigger.create({
		// 		start: "top -1px",
		// 		end: "max",
		// 		pin: ".club-header",
		// 	});
		// } else {
		// 	let mm = gsap.matchMedia();

		// 	aethos.headerScrollTrigger = ScrollTrigger.create({
		// 		start: "top -1px",
		// 		end: "max",
		// 		pin: ".dest-header",
		// 	});

		// 	// mm.add(`(max-width: ${aethos.breakpoints.mbl}px)`, () => {
		// 	// 	console.log("test");
		// 	// 	aethos.nav.headerRevealAnim = gsap
		// 	// 		.from(".header-bar", {
		// 	// 			yPercent: -100,
		// 	// 			paused: true,
		// 	// 			duration: 0.5,
		// 	// 		})
		// 	// 		.progress(1);

		// 	// 	let lastScrollY = window.scrollY;
		// 	// 	const scrollThreshold = 50;
		// 	// 	let scrollBuffer = 0;

		// 	// 	aethos.headerScrollTrigger2 = ScrollTrigger.create({
		// 	// 		start: "top -1px",
		// 	// 		end: "max",
		// 	// 		onUpdate: (self) => {
		// 	// 			if (aethos.nav.headerForcedShown) {
		// 	// 				return;
		// 	// 			}

		// 	// 			const currentScrollY = window.scrollY;
		// 	// 			const deltaY = currentScrollY - lastScrollY;

		// 	// 			if (deltaY > 0) {
		// 	// 				aethos.nav.headerRevealAnim.reverse();
		// 	// 				scrollBuffer = 0;
		// 	// 			} else if (deltaY < 0) {
		// 	// 				scrollBuffer -= deltaY;
		// 	// 				if (scrollBuffer >= scrollThreshold) {
		// 	// 					aethos.nav.headerRevealAnim.play();
		// 	// 					scrollBuffer = 0;
		// 	// 				}
		// 	// 			}

		// 	// 			lastScrollY = currentScrollY;
		// 	// 		},
		// 	// 	});
		// 	// });
		// }
	};

	// function to force show header
	aethos.nav.forceShowHeader = function (bool) {
		if (bool) {
			aethos.log("force show header ON");
			aethos.nav.headerForcedShown = true;
			// Ensure animation exists before playing
			if (aethos.nav.headerRevealAnim) {
				gsap.set(".header-bar", { clearProps: "transform" });
				ScrollTrigger.refresh();
			}
		} else {
			aethos.log("force show header OFF");
			aethos.nav.headerForcedShown = false;
			if (aethos.nav.headerRevealAnim) {
				gsap.set(".header-bar", { clearProps: "transform" });
				ScrollTrigger.refresh();
			}
		}
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
		if (navLinkImgDefault) {
			navLinkImgDefault.classList.add("is-active");
		}

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

	// Fetch the destination-specific nav
	aethos.functions.buildDestinationNav = async function () {
		// only run if this is a destination page
		if (!aethos.settings.destinationSlug) {
			return;
		}

		// set some constants
		const topMenu_selector = ".dest-nav_top";
		const bottomMenu_selector = ".dest-nav_bottom";
		const topMenu_underlineWidthProp = "--dest-nav-underline-width";
		const topMenu_underlineOffsetProp = "--dest-nav-underline-offset-x";
		const bottomMenu_underlineWidthProp = "--dest-nav-underline-width-bot";
		const bottomMenu_underlineOffsetProp = "--dest-nav-underline-offset-x-bot";
		const topMenu_listSelector = ".dest-nav_list"; // selector for the list of links in top
		const bottomMenu_listSelector = ".dest-nav_child-list"; // selector for the list of links in bottom
		const topLinkMatchString =
			":not(.w-condition-invisible) > .link-cover:not(.w-condition-invisible):not(.dest-nav_brand-link):not([href='']):not(.is-child)"; //Exclude invisible links and brand link, and empty hrefs, and child links
		const bottomLinkMatchString =
			":not(.w-condition-invisible) > .link-cover:not(.w-condition-invisible):not(.dest-nav_brand-link):not([href=''])"; // Exclude invisible links, brand link, and empty hrefs

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
					let navElement = document.querySelector(".site-header .dest-nav");

					if (navElement) {
						aethos.log(
							"Navigation already exists on the page. Skipping fetch.",
							"info"
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

					// run our links function again to ensure any new links in the nav have the right params for page transitions
					aethos.functions.listingLinks();

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

		function setupUnderlines() {
			const menu_top = document.querySelector(topMenu_selector); // top menu
			const menus_bottom = Array.from(
				document.querySelectorAll(bottomMenu_selector)
			).filter((menu) => menu.querySelector(".dest-nav_item")); // all bottom menus that actually have links in
			const currentPath = window.location.pathname; // current page path
			let topActiveLink; // active link in top menu

			// Find the active link in the top menu
			const links_top = Array.from(
				menu_top.querySelectorAll(topLinkMatchString)
			);
			topActiveLink = getActiveLink(links_top, currentPath);
			if (topActiveLink) {
				topActiveLink.classList.add("active");
				menuUnderline(
					menu_top,
					topActiveLink,
					topMenu_underlineWidthProp,
					topMenu_underlineOffsetProp,
					topMenu_listSelector,
					false
				);
			} else {
				// set offset to a reasonable starting pos
				hoverFallback(menu_top, topMenu_underlineOffsetProp);
			}

			// look for active links in bottom menu
			menus_bottom.forEach((menu) => {
				let links = Array.from(menu.querySelectorAll(bottomLinkMatchString));
				let activeLink = getActiveLink(links, currentPath);

				// if there is an active link in this bottom menu...
				if (activeLink) {
					activeLink.classList.add("active");

					// temporarily show bottom menu so we can add underline correctly
					gsap.set(menu, { display: "grid", autoAlpha: 1 });

					menuUnderline(
						menu,
						activeLink,
						bottomMenu_underlineWidthProp,
						bottomMenu_underlineOffsetProp,
						bottomMenu_listSelector,
						false
					);

					// rehide bottom menu
					gsap.set(menu, { display: "none", autoAlpha: 0 });

					// Also update the parent active link for the top menu, if available.
					const parentData = getParent(menu);
					if (parentData && parentData.link) {
						topActiveLink = parentData.link;
						topActiveLink.classList.add("active");
						menuUnderline(
							menu_top,
							topActiveLink,
							topMenu_underlineWidthProp,
							topMenu_underlineOffsetProp,
							topMenu_listSelector,
							false
						);
					}
				}
				// if not, set fallback
				else {
					hoverFallback(menu, bottomMenu_underlineOffsetProp);
				}

				// **Add event listeners for this bottom menu using its own active link**
				addUnderlineEventListeners(menu, activeLink, "bottom", getParent(menu));

				// }
			});

			// now add underline hover behaviour
			addUnderlineEventListeners(menu_top, topActiveLink, "top");
		}

		function getParent(link_or_menu) {
			let parentItem = link_or_menu.closest(
				".dest-nav_item[aethos-nav-children='true']"
			);
			if (!parentItem) {
				return;
			}
			let parentMenu = parentItem.closest(topMenu_selector); // should be same as menu_top
			if (!parentMenu) {
				return;
			}
			let parentLink = parentItem.querySelector(topLinkMatchString);
			let parent = { link: parentLink, menu: parentMenu };
			return parent;
		}

		function addUnderlineEventListeners(
			menu,
			activeLink,
			type,
			parent = false
		) {
			let underlineWidthProp, underlineOffsetProp, listClass;

			if (type === "top") {
				underlineWidthProp = topMenu_underlineWidthProp;
				underlineOffsetProp = topMenu_underlineOffsetProp;
				listClass = topMenu_listSelector;
			} else {
				underlineWidthProp = bottomMenu_underlineWidthProp;
				underlineOffsetProp = bottomMenu_underlineOffsetProp;
				listClass = bottomMenu_listSelector;
			}
			menu.addEventListener("mouseover", (event) => {
				// Only handle events on elements with the class 'link-cover'
				// and for the parent's menu, ignore child items.
				if (
					event.target.classList.contains("link-cover") &&
					!(type === "top" && event.target.classList.contains("is-child"))
				) {
					menuUnderline(
						menu,
						event.target,
						underlineWidthProp,
						underlineOffsetProp
					);
				}

				// if we are hovering over a bottom menu, trigger the parent item hover
				if (type === "bottom" && parent && parent.link) {
					menuUnderline(
						parent.menu,
						parent.link,
						topMenu_underlineWidthProp,
						topMenu_underlineOffsetProp
					);
				}
			});

			menu.addEventListener("mouseleave", () => {
				if (activeLink) {
					menuUnderline(
						menu,
						activeLink,
						underlineWidthProp,
						underlineOffsetProp
					);
				} else {
					menu.style.setProperty(underlineWidthProp, "0");
				}
			});

			// on window resize, update the underline position
			window.addEventListener("resize", () => {
				if (activeLink) {
					menuUnderline(
						menu,
						activeLink,
						underlineWidthProp,
						underlineOffsetProp,
						listClass,
						false
					);
				}
			});
		}

		function hoverFallback(menu, prop) {
			menu.style.setProperty(prop, `${window.innerWidth * 0.5}px`);
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
								gsap.set(subnav_wrapper, { autoAlpha: 0 });
							},
						})
						.set(subnav_wrapper, { display: "grid", autoAlpha: 1 })
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
							aethos.log("setting up subnav hover");
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
								aethos.log("turning off subnav hover");
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
							return () => {};
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

			setupUnderlines();

			showSubnavOnHover();

			document.querySelector(".dest-nav").classList.add("is-ready");
			aethos.log("Destination nav setup complete");
		} catch (error) {
			console.error("Error setting up the destination navigation:", error);
		}
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

	/******/
	/*** ANIMATION FUNCTIONS - GENERAL ***/
	/******/

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
		// Get all arch triggers on the page
		let arch_triggers = document.querySelectorAll(".anim-arch_trigger");

		arch_triggers.forEach((trigger) => {
			// Get the clip paths and related elements
			let arch_path = document.querySelector("#shape-arch path");
			let arch_path_bg = document.querySelector("#shape-arch-bg path");
			let arch_arch = trigger.querySelectorAll(".anim-arch_arch");
			let arch_logo = trigger.querySelector(".contact-hero_media-logo");

			if (
				!arch_path ||
				!arch_path_bg ||
				arch_arch.length === 0 ||
				(!arch_logo && trigger.querySelector(".contact-hero_media-logo"))
			) {
				return;
			}

			gsap.set(arch_path, {
				transformOrigin: "bottom left",
			});

			let newPath_start =
				"M 0 0.36 C 0 0.16 0.22 0 0.5 0 H 0.5 C 0.78 0 1 0.16 1 0.36 V 1 H 0 V 0.36";
			let newPath_end =
				"M 0 0.56 C 0 0.36 0.22 0.2 0.5 0.2 H 0.5 C 0.78 0.2 1 0.36 1 0.56 V 0.8 H 0 V 0.56";

			gsap.set([arch_path_bg, arch_path], {
				attr: { d: newPath_start },
			});

			// Create the timeline
			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: trigger,
					start: "20% 95%",
				},
			});

			let timeScale = 0.75;
			if (aethos.settings.pageName === "contact") {
				timeScale = 1.5;
			}
			tl.timeScale(timeScale);

			// Animations
			tl.from(arch_arch, {
				y: "90%",
				duration: 1.75,
				ease: "power1.inOut",
			});

			let y = 0.2;
			tl.from(
				[arch_path, arch_path_bg],
				{
					attr: {
						d: newPath_end,
					},
					y: y,
					duration: 1.5,
					ease: "power1.inOut",
				},
				"<+=0.4"
			);

			tl.from(
				arch_path,
				{
					scale: 0.9,
					duration: 1,
					ease: "power1.inOut",
				},
				"<+=0.4"
			);

			if (arch_logo) {
				tl.from(
					arch_logo,
					{
						opacity: 0,
						duration: 1,
						ease: "power1.inOut",
					},
					"<+=0.4"
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

	/* animated text effect 1 */
	aethos.anim.splitText = function () {
		let typeSplit;
		const targetClass = "anim-split";
		const linesClass = "anim-split_line";
		const maskClass = "anim-split_line-mask";

		function runSplit() {
			// only run on desktop
			if (window.innerWidth < 768) {
				if (typeSplit) typeSplit.revert(); // Ensure no instance remains
				return;
			}

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
				if (typeSplit) {
					typeSplit.revert();
				}
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
				arrows: true,
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
		// loads carousel elements from Components Block template page to (1) get around nesting limits and (2) improve performance
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

	aethos.anim.loadSliders = function () {
		if (!aethos.settings.dev.splide) {
			return;
		}

		/* Global Splide instances array */
		aethos.splides = [];

		/* Splide defaults */
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
			trimSpace: "move",
			type: "slide",
			drag: "free",
			snap: false,
			autoplay: false,
		};

		/* Helper: Check if an element is in the viewport */
		function isElementInViewport(el) {
			const rect = el.getBoundingClientRect();
			return (
				rect.top < window.innerHeight &&
				rect.bottom > 0 &&
				rect.left < window.innerWidth &&
				rect.right > 0
			);
		}

		/* Initialize Splide sliders */
		function initializeSplide({
			selector,
			options,
			useExtensions = false,
			useProgressBar = false,
		}) {
			const targets = document.querySelectorAll(selector);

			targets.forEach((target) => {
				const track = target.querySelector(".splide__track");
				const list = target.querySelector(".splide__list");
				const slides = target.querySelectorAll(".splide__slide");

				// Check if the required elements are present
				if (!track || !list || slides.length === 0) {
					console.warn(`Incomplete Splide structure for target:`, target);
					return; // Skip this target if any required element is missing
				}

				const splide = new Splide(target, options);

				// Progress Bar Logic
				let progressWrapper = target.querySelector(".progress");
				let bar = target.querySelector(".progress_bar");
				let observer;

				const updateProgressBar = () => {
					if (!list || !bar || !progressWrapper) return;

					const { Layout, Move, Direction, Slides } = splide.Components;
					const position = Direction.orient(Move.getPosition());
					const base = Layout.sliderSize();
					const containerW = target.getBoundingClientRect().width;
					const adjustedBase = base - containerW;

					const rate = position / adjustedBase;
					const maxTranslateX = progressWrapper.offsetWidth - bar.offsetWidth;
					const translateX = rate * maxTranslateX;

					bar.style.transform = `translateX(${translateX}px)`;
				};

				const enableProgressBar = () => {
					if (!list || !bar || !progressWrapper) return;

					let lastTransform = "";
					observer = new MutationObserver(() => {
						const currentTransform = list.style.transform;
						if (currentTransform !== lastTransform) {
							lastTransform = currentTransform;
							updateProgressBar();
						}
					});

					observer.observe(list, {
						attributes: true,
						attributeFilter: ["style"],
					});

					splide.on("mounted move", updateProgressBar);
				};

				const disableProgressBar = () => {
					if (observer) observer.disconnect();
					if (bar) bar.style.transform = "";
				};

				const handleResize = () => {
					if (window.innerWidth <= aethos.breakpoints.mbl) {
						disableProgressBar();
					} else if (useProgressBar) {
						enableProgressBar();
					}
				};

				// Initial progress bar setup
				if (useProgressBar) enableProgressBar();

				window.addEventListener("resize", handleResize);
				splide.on("destroy", () => {
					window.removeEventListener("resize", handleResize);
					disableProgressBar();
				});

				// Disable dragging while scrolling
				let isScrolling = false;
				window.addEventListener("scroll", () => {
					if (!isScrolling) {
						isScrolling = true;
						requestAnimationFrame(() => {
							if (isElementInViewport(target)) {
								splide.options.drag = false;
							}
							isScrolling = false;
						});
					}
				});

				window.addEventListener("scrollend", () => {
					if (isElementInViewport(target)) {
						splide.options.drag = "free";
					}
				});

				// Fix mobile drag triggering clicks
				target.addEventListener("click", (e) => {
					if (splide.Components.Drag.isDragging()) {
						e.preventDefault();
						e.stopImmediatePropagation();
					}
				});

				// Mount the Splide instance
				if (useExtensions) {
					splide.mount(window.splide.Extensions);
				} else {
					splide.mount();
				}

				// Store instance in global array
				aethos.splides.push(splide);
			});
		}

		/* Declare sliders with selectors and options */
		const sliders = [
			{
				selector: ".carousel",
				options: {
					type: "slide",
					autoWidth: true,
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
					focus: 0,
					trimSpace: "move",
					arrows: false,
				},
				useExtensions: false,
				useProgressBar: true,
			},
		];

		/* Loop through and initialize sliders */
		sliders.forEach(initializeSplide);
	};

	/* About page Values section */
	aethos.anim.values = function () {
		// only run for larger screen
		let mm = gsap.matchMedia();

		// get all values components on page
		let valuesSections = document.querySelectorAll(".values_inner");
		valuesSections.forEach((section) => {
			// dsk list
			let list_dsk = section.querySelector(".values_dsk .values_list");
			// mbl list
			let list_mbl = section.querySelector(".values_mbl .values_list");

			// assemble the component
			let values = list_dsk.querySelectorAll(".values_item");
			if (values.length != 0) {
				values.forEach((value) => {
					// clone the value
					let value_clone = value.cloneNode(true);
					// move clone to mbl list - this is the list we show on mbl only
					list_mbl.append(value_clone);

					// move the title, body and img to the respective lists
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
			}

			// only run for larger screen
			mm.add(`(min-width: ${aethos.breakpoints.mbl + 1}px)`, () => {
				// get elements to animate within this component
				let gsap_section = gsap.utils.selector(section);
				let titles = gsap_section(".values_item-title");
				let bodies = gsap_section(".values_item-body");
				let images = gsap_section(".values_item-img");

				// resize last img so we can fine control end of pinning.
				// We set last img to be the same height as the RHS content so the section unsticks when top of img is at same height as top of content.
				const values_pin = section.querySelector(".values_pin");
				const values_pin_top = section.querySelector(".values_pin-top");
				const values_pin_bottom = section.querySelector(".values_pin-bottom");

				function setLastImgHeight() {
					var h =
						gsap.getProperty(values_pin, "height") -
						gsap.getProperty(values_pin, "padding-top") -
						gsap.getProperty(values_pin, "padding-bottom");
					gsap.set(images[images.length - 1], {
						height: h,
					});
				}

				setLastImgHeight();

				// Track whether triggers have already been created
				let scrollTriggersCreated = false;

				// Check if the content is too tall for the viewport
				const checkContentHeight = () => {
					// Calculate the height of the pinned content and the viewport
					let pinHeight =
						values_pin_top.offsetHeight + values_pin_bottom.offsetHeight + 100;
					let viewportHeight = window.innerHeight;

					if (pinHeight > viewportHeight) {
						if (scrollTriggersCreated) {
							// Content too tall: kill scroll triggers and add class
							ScrollTrigger.getAll().forEach((trigger) => {
								if (
									trigger.trigger === section ||
									section.contains(trigger.trigger)
								) {
									trigger.kill();
								}
							});
							scrollTriggersCreated = false;
						}
						section.classList.add("is-short");
						gsap.set(images[images.length - 1], { clearProps: "height" }); // reset height of last image
					} else {
						// Normal behavior: remove the class and set up scroll triggers
						section.classList.remove("is-short");

						if (!scrollTriggersCreated) {
							scrollTriggersCreated = true;

							setLastImgHeight(); // reset height again

							// Set the parent component to be pinned
							gsap.to(section, {
								scrollTrigger: {
									trigger: section, // trigger is the whole section
									id: "values",
									start: "top top",
									end: "bottom bottom",
									pin: ".values_pin", // we want to pin the RHS of the section - ie make it sticky
									pinSpacing: false,
								},
							});

							// Set up scroll triggers for each value
							values.forEach((value, index) => {
								let title = titles[index];
								let body = bodies[index];
								let image = images[index];

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
									id: "values-img-" + index,
									trigger: image,
									start: start,
									end: end,
									toggleClass: {
										targets: [title, body],
										className: "is-active",
									},
									scrub: true,
									markers: markers,
								});
							});
						}
					}
				};

				// Call on load and resize events
				checkContentHeight();
				window.addEventListener("resize", checkContentHeight);

				// Account for the height of the header
				const header = document.querySelector(".header");
				const headerOffset = () => {
					if (header) {
						return header.offsetHeight + 32; // Add extra spacing if needed
					} else {
						return 32; // Default offset if header is not present
					}
				};

				/* Click to scroll to each item */
				titles.forEach((title, index) => {
					title.addEventListener("click", (event) => {
						event.preventDefault(); // Prevent default anchor behavior
						let targetImage = images[index]; // Find the corresponding image
						gsap.to(window, {
							scrollTo: {
								y: targetImage,
								offsetY: headerOffset(), // Use the dynamic offset value
							},
							duration: 1,
							ease: "power2.inOut",
						});
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
				if (!child) {
					return;
				}
				if (!child[0]) {
					return;
				}
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
			.querySelectorAll(".u-current-year")
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
			// const type = target.getAttribute("aethos-item-type");
			let sourcePath = "/listings/" + slug;

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

	/* Add direct links to experience filters */
	aethos.functions.addExperienceFilterLinks = function () {
		const blocks = document.querySelectorAll("[aethos-experience-category]");

		blocks.forEach((block) => {
			// Get the filter slug(s) and destination slug
			let experienceCategories = block.getAttribute(
				"aethos-experience-category"
			);
			const destinationSlug = block.getAttribute("aethos-destination-slug");

			// Check if the filter slug or destination slug are missing or empty
			if (!experienceCategories || !destinationSlug) {
				console.warn("Missing filter or destination slug for block:", block);
				return; // Skip this block if either attribute is missing
			}

			// Find the button within the block
			const button = block.querySelector(".button .button_link");
			if (!button) {
				console.warn("No button found in block:", block);
				return; // Skip if no button is found
			}

			// Process categories - split by comma, trim, and limit to 3 categories
			let categoriesArray = experienceCategories
				.split(",")
				.map((cat) => cat.trim())
				.slice(0, 3);

			// Encode each category for URL and join with commas
			const encodedCategories = categoriesArray
				.map((cat) => encodeURIComponent(cat))
				.join("%2C");

			// Set the button href with the correct link
			try {
				button.href = `/destinations/${destinationSlug}/all-experiences?category=${encodedCategories}`;
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
			vimeoInnerContainer.classList.add("video-cover");
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
			.querySelectorAll("a[aethos-destination-slug]") // Select all links with the attribute
			.forEach((link) => {
				const destinationSlug = link.getAttribute("aethos-destination-slug");
				if (destinationSlug) {
					const currentHref = link.getAttribute("href");

					// Ignore external links
					if (
						!currentHref.startsWith("/") &&
						!currentHref.startsWith(window.location.origin)
					) {
						return;
					}

					// Extract the last segment of the URL
					const slug = currentHref.split("/").pop();

					// Check if the link is for experiences, happenings, or wellness
					if (currentHref.startsWith("/listings/")) {
						const updatedHref = `/listing?slug=${slug}&dest=${destinationSlug}`;
						link.setAttribute("href", updatedHref);
					} else {
						// For other links, append the destination parameter
						const updatedHref = new URL(currentHref, window.location.origin);
						updatedHref.searchParams.set("dest", destinationSlug);
						link.setAttribute(
							"href",
							updatedHref.pathname + updatedHref.search
						);
					}
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

		// /* current destination */
		// /* EDIT - this is now set manually in component overrides so we can control on a page by page basis, e.g. setting a destination on club pages */
		// /* EDIT 2 - we were not manually setting this for footer forms, and there's no easy for a client to do this for static destination forms, so we are reverting to auto-setting this for empty fields */
		const destinationFields = document.querySelectorAll(
			'input[name="PAGEDESTINATION"]'
		);

		// if we know the current destination
		if (aethos.settings.destinationSlug) {
			destinationFields.forEach((field) => {
				if (field.value == "") {
					field.value = aethos.settings.destinationSlug;
				}
			});
		}
	};

	// modal close button
	aethos.functions.modalClose = function (closeClass) {
		const closeButtons = document.querySelectorAll(closeClass);

		closeButtons.forEach((button) => {
			const closeHandler = function () {
				let currentElement = button;

				// Traverse up the DOM to find the nearest .w-dropdown element
				while (
					currentElement &&
					!currentElement.classList.contains("w-dropdown")
				) {
					currentElement = currentElement.parentElement;
				}

				if (currentElement) {
					// Trigger the Webflow 'w-close' event on the dropdown
					currentElement.dispatchEvent(new Event("w-close", { bubbles: true }));
				}
			};

			// Attach both click and touchstart events
			button.addEventListener("click", closeHandler);
			button.addEventListener("touchstart", closeHandler, { passive: true });
		});
	};

	// disable scroll when booking modal is open
	aethos.functions.observeBookingToggle = function () {
		const targetElement = document.querySelector(".booking_dd-toggle");

		if (!targetElement) return;

		const observer = new MutationObserver((mutationsList) => {
			mutationsList.forEach((mutation) => {
				if (mutation.attributeName === "class") {
					const isOpen = targetElement.classList.contains("w--open");

					if (window.innerWidth > 767) {
						// Pause GSAP Smooth Scroll on Desktop
						aethos.helpers.pauseScroll(isOpen);
					} else {
						// Disable Scrolling on Mobile
						document.body.style.overflow = isOpen ? "hidden" : "";
						document.body.style.touchAction = isOpen ? "none" : "";
					}
				}
			});
		});

		observer.observe(targetElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
	};

	// Update elements with a certain attribute to the current language code on Weglot language change
	aethos.functions.langUpdate = function () {
		// Check if Weglot is defined
		if (!Weglot) {
			console.warn("Weglot is not available.");
			return;
		}

		// Get all elements with the attribute
		const currentLangEls = document.querySelectorAll(
			"[aethos-lang-current='true']"
		);

		// Listen for the Weglot language change event
		Weglot.on("languageChanged", function (newLang, prevLang) {
			aethos.log("The language on the page just changed to (code): " + newLang);

			// Update all elements with the attribute to the new language code
			currentLangEls.forEach((el) => {
				el.textContent = newLang;
			});
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
			number.setAttribute("data-date-suffix", "false");
		});
	};

	/* handle destination subscribe form names */
	/* no longer using this as we capture destination in a hidden field */
	// aethos.functions.updateSubscribeFormName = function () {
	// 	return;
	// 	// Find all forms with a data-destination attribute
	// 	const forms = document.querySelectorAll("form[data-destination]");

	// 	// Helper function to capitalize the first letter of a word
	// 	function capitalizeFirstLetter(string) {
	// 		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	// 	}

	// 	forms.forEach(function (form) {
	// 		let destinationName = form.getAttribute("data-destination");

	// 		// Capitalize the destination name
	// 		destinationName = capitalizeFirstLetter(destinationName);

	// 		// Update data-name attribute in the required format
	// 		form.setAttribute(
	// 			"data-name",
	// 			`Destination Subscribe - ${destinationName}`
	// 		);
	// 	});
	// };

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

		// add placeholders to date fields
		const dateFields = document.querySelectorAll(
			".proposal-form_field.is-date-placeholder"
		);

		dateFields.forEach((dateField) => {
			// Initialize placeholder
			const placeholder = dateField.dataset.placeholder;
			if (!dateField.value) {
				dateField.type = "text";
				dateField.placeholder = placeholder;
			}

			// Handle focus: Show the date picker
			dateField.addEventListener("focus", () => {
				if (dateField.type !== "date") {
					dateField.type = "date"; // Change type to "date"
					setTimeout(() => {
						dateField.showPicker(); // Trigger the picker after a brief delay
					}, 10); // Short timeout to ensure Safari processes the type change
				}
			});

			// Handle blur: Restore placeholder if no value is entered
			dateField.addEventListener("blur", () => {
				if (!dateField.value) {
					dateField.type = "text";
					dateField.placeholder = placeholder;
				}
			});
		});

		// convert any capitalised block IDs to lowercase - since we are using the Heading field of destination blocks to power section IDs
		document.querySelectorAll(".s-dest-block[id]").forEach((el) => {
			let originalId = el.id;
			let snakeCaseId = originalId
				.replace(/\s+/g, "_") // Replace spaces with underscores
				.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) // Convert capitals to _lowercase
				.replace(/^_/, ""); // Remove leading underscore if necessary

			if (originalId !== snakeCaseId) {
				el.id = snakeCaseId;
			}
		});
	};

	/* club - memberships */
	aethos.anim.clubMemberships = function () {
		//only animate on tablet and above
		let mm = gsap.matchMedia();
		// get all sections on page
		let sections = document.querySelectorAll(".c-memberships");

		const clubNavTop = document.querySelector(".club-nav_top");

		sections.forEach((section) => {
			// get sticky image container
			const imgContainer = section.querySelector(".memberships_img-sticky");
			const header = section.querySelector(".memberships_header");
			const sectionParent = section.closest(".s-memberships");
			const paddingBottom = gsap.getProperty(sectionParent, "paddingBottom");

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
				// account for height of club nav
				const updateStart = (includeExtra = true) => {
					if (clubNavTop) {
						const clubNavHeight = clubNavTop.offsetHeight || 0; // Get the height of `.club-nav_top`
						return `top ${clubNavHeight + (includeExtra ? 32 : 0)}px`; // Add 32px if includeExtra is true
					} else {
						return `top ${includeExtra ? 32 : 0}px`;
					}
				};

				// make image wrap sticky
				ScrollTrigger.create({
					trigger: section,
					start: () => updateStart(true), // Include the extra 32px
					end: () =>
						`${
							section.offsetHeight - imgContainer.offsetHeight - paddingBottom
						}px 0px`,
					pin: imgContainer,
					invalidateOnRefresh: true,
					pinSpacing: false,
				});

				// make header sticky
				ScrollTrigger.create({
					trigger: section,
					start: () => updateStart(false), // Only account for the nav height
					end: () =>
						`${section.offsetHeight - imgContainer.offsetHeight}px 0px`,
					pin: header,
					invalidateOnRefresh: true,
					pinSpacing: false,
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
								onComplete: () => {
									ScrollTrigger.refresh();
								},
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
							onComplete: () => {
								ScrollTrigger.refresh();
							},
							// onComplete: () => faq.classList.remove("is-active"),
						});
						faq.classList.remove("is-active", "is-open");
					} else {
						// Add active classes
						faq.classList.add("is-open");

						// Open content using GSAP
						const contentHeight = content.scrollHeight; // Get natural height
						gsap.fromTo(
							content,
							{ height: 0 },
							{
								height: contentHeight,
								duration: 0.6,
								ease: "power4.inOut",
								onComplete: () => {
									ScrollTrigger.refresh();
								},
							}
						);

						// gsap.fromTo(
						// 	content,
						// 	{ height: 0 },
						// 	{
						// 		height: "auto",
						// 		duration: 0.6,
						// 		ease: "power4.inOut",
						// 		onComplete: () => {
						// 			ScrollTrigger.refresh();
						// 		},
						// 	}
						// );
					}
				});
			});

			// on resize, update height of open items
			window.addEventListener("resize", () => {
				document
					.querySelectorAll(".faq-item.is-open .faq_content")
					.forEach((content) => {
						content.style.height = "auto";
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

		// fade in success message on footer forms
		gsap.set(".footer-form_success-content", { opacity: 0 });

		forms.forEach((form) => {
			form.addEventListener("submit", () => {
				// Add the '.is-submitted' class to the form
				form.classList.add("is-submitted");

				if (form.classList.contains("footer-form")) {
					setTimeout(() => {
						gsap.set(".footer-form_success-content", { opacity: "1" });
					}, 1500); // large delay before fading in content to let WF forms do their thing
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
					gsap.fromTo(
						partnerClubsRadioFieldset,
						{
							display: "none",
							opacity: 0,
						},
						{
							display: "block",
							opacity: 1,
						}
					);
					// partnerClubsRadioFieldset.style.display = "block";
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
	/* simplified version of the destination nav hover code */
	aethos.anim.addClubNavHover = function () {
		const menus = document.querySelectorAll(".club-nav");
		const underlineWidthProp = "--club-nav-underline-width";
		const underlineOffsetProp = "--club-nav-underline-offset-x";
		const listClass = ".club-nav_list";

		menus.forEach((menu) => {
			// Find the active link and set the underline position initially
			const links = Array.from(menu.querySelectorAll(".club-nav_item a"));
			const currentPath = window.location.pathname;
			let activeLink = getActiveLink(links, currentPath);

			if (activeLink) {
				activeLink.classList.add("active");
			}

			// Set underline for the active link
			if (activeLink) {
				menuUnderline(
					menu,
					activeLink,
					underlineWidthProp,
					underlineOffsetProp,
					listClass,
					false // no transition for active link initially
				);
			} else {
				// set offset to a reasonable starting pos
				menu.style.setProperty(
					underlineOffsetProp,
					`${window.innerWidth * 0.5}px`
				);
			}

			menu.addEventListener("mouseover", (event) => {
				if (event.target.classList.contains("club-nav_link-text")) {
					// trigger hover on this item
					menuUnderline(
						menu,
						event.target,
						underlineWidthProp,
						underlineOffsetProp
					);
				}
			});

			menu.addEventListener("mouseleave", () => {
				if (activeLink) {
					menuUnderline(
						menu,
						activeLink,
						underlineWidthProp,
						underlineOffsetProp
					);
				} else {
					menu.style.setProperty(underlineWidthProp, "0");
				}
			});

			// on window resize, update the underline position
			window.addEventListener("resize", () => {
				if (activeLink) {
					menuUnderline(
						menu,
						activeLink,
						underlineWidthProp,
						underlineOffsetProp,
						listClass,
						false
					);
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

	// Debounce utility function
	function debounce(func, wait) {
		let timeout;
		return function (...args) {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
		};
	}
	// Function to observe changes in the .nav_bg element
	aethos.functions.observeNavGridChanges = function () {
		if (!window.matchMedia("(max-width: 767px)").matches) return;

		const navGrid = document.querySelector(".nav_bg");

		if (!navGrid) {
			console.error(".nav_bg element not found");
			return;
		}

		// Create a MutationObserver instance with a debounced callback
		const observer = new MutationObserver(
			debounce(() => {
				requestAnimationFrame(() => {
					aethos.log("Refreshing ScrollTrigger");
					ScrollTrigger.refresh();
				});
			}, 500) // Adjust the debounce delay as necessary
		);

		// Function to enable or disable the observer based on viewport size
		const handleViewportChange = (e) => {
			if (e.matches) {
				// Mobile view (<= 767px)
				observer.observe(navGrid, {
					attributes: true,
					attributeFilter: ["style"],
				});
				aethos.log("MutationObserver enabled for .nav_bg on mobile.");
			} else {
				// Disable observer on larger screens
				observer.disconnect();
				aethos.log("MutationObserver disconnected on desktop.");
			}
		};

		// Set up matchMedia for viewport changes
		const mediaQuery = window.matchMedia("(max-width: 767px)");
		mediaQuery.addEventListener("change", handleViewportChange);

		// Initialize observer on load if already in mobile view
		handleViewportChange(mediaQuery);
	};

	aethos.functions.updateDestinationSocials = function () {
		var social_menu = document.querySelector(".footer_menu.is-socials");

		// check menu exists
		if (!social_menu) {
			return;
		}

		// check dest has socials
		if (
			!aethos.settings.destinationFacebook &&
			!aethos.settings.destinationInstagram
		) {
			return;
		}

		// remove existing items
		var existingItems = social_menu.querySelectorAll(".footer_link");
		var existingParent;
		existingItems.forEach((item) => {
			existingParent = item.parentElement; // get parent, so we know where to put new items
			item.remove();
		});

		// add new items
		function createSocialLink(href, text) {
			var link = document.createElement("a");
			link.classList.add("footer_link");
			link.href = href;
			link.textContent = text;
			link.target = "_blank";
			link.rel = "noopener";
			return link;
		}

		if (aethos.settings.destinationFacebook) {
			var fbLink = createSocialLink(
				aethos.settings.destinationFacebook,
				"Facebook"
			);
			existingParent.appendChild(fbLink);
		}

		if (aethos.settings.destinationInstagram) {
			var igLink = createSocialLink(
				aethos.settings.destinationInstagram,
				"Instagram"
			);
			existingParent.appendChild(igLink);
		}
	};

	function getActiveLink(links, currentPath) {
		if (!links || !currentPath) return;

		// Helper to normalize a path by removing a trailing slash (unless the path is just "/")
		function normalizePath(path) {
			if (!path) return path;
			return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
		}

		const normalizedCurrentPath = normalizePath(currentPath);

		return links.find((link) => {
			let linkPath;
			try {
				linkPath = new URL(link.href, window.location.origin).pathname;
			} catch (error) {
				// If the URL is invalid or relative, skip it.
				return false;
			}

			let normalizedLinkPath = normalizePath(linkPath);

			// --- Case 1: Legacy "pretty URL" conversion ---
			// If the link uses the legacy pattern (e.g. "/destination-retreats/ericeira")
			// convert it to the pretty URL equivalent ("/destinations/ericeira/retreats")
			if (normalizedLinkPath.startsWith("/destination-")) {
				// Split the path parts (ignoring empty strings)
				const parts = normalizedLinkPath.split("/").filter(Boolean);
				if (parts.length >= 2) {
					// Extract the subpage from the first part.
					// e.g. "destination-retreats" becomes "retreats"
					const legacyPart = parts[0];
					const subpage = legacyPart.substring("destination-".length);
					const destination = parts[1];
					// Include any additional segments if present.
					const extra = parts.slice(2).join("/");
					normalizedLinkPath = normalizePath(
						`/destinations/${destination}/${subpage}${extra ? "/" + extra : ""}`
					);
				}
			}

			// --- Case 2: Room page special handling ---
			// If the current page is a room ("/rooms/xxx"), then we want the "Stay" menu link,
			// which is of the form "/destinations/yyy/stay", to be considered active.
			if (normalizedCurrentPath.startsWith("/rooms/")) {
				// Use a regex to check if the link's path matches "/destinations/<destination>/stay"
				if (/^\/destinations\/[^\/]+\/stay\/?$/.test(normalizedLinkPath)) {
					return true;
				}
			}

			// --- Default: Direct path comparison ---
			return normalizedLinkPath === normalizedCurrentPath;
		});
	}

	function menuUnderline(
		menu,
		target,
		underlineWidthProp,
		underlineOffsetProp,
		listClass = "", // class of the list element, needed to disable transitioning
		withTransition = true // if false, we don't transition
	) {
		const menuRect = menu.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		// Calculate the offset relative to the menu
		const offsetX = targetRect.left - menuRect.left;

		// if we are NOT transitioning, disable transition
		// https://medium.com/building-blocks/how-to-skip-css-transitions-with-jquery-e0155d06e82e
		if (!withTransition) {
			const list = menu.querySelector(listClass);
			if (list) {
				list.classList.add("no-transition");
				update();
				list.offsetHeight; // trigger reflow
				list.classList.remove("no-transition");
			} else {
				console.warn("listClass element not found in", menu);
			}
		} else {
			update();
		}

		function update() {
			// Set underline width and position properties
			menu.style.setProperty(underlineWidthProp, `${target.offsetWidth}px`);
			menu.style.setProperty(underlineOffsetProp, `${offsetX}px`);
		}
	}

	aethos.functions.adjustDestinationGridHeight = function () {
		function adjustHeight() {
			const grid = document.querySelector(".c-destinations-grid");
			if (!grid) return; // Exit if element is not found
			aethos.log("Adjusting grid height");
			// Check if the grid content overflows
			if (grid.scrollHeight > grid.clientHeight) {
				grid.style.minHeight = `${grid.scrollHeight}px`; // Set minHeight dynamically
			}
		}

		adjustHeight();

		window.addEventListener("resize", adjustHeight);
	};

	aethos.functions.mews = function () {
		// If on a destination-specific page, open Mews for that destination
		if (aethos.settings.destinationMewsId) {
			aethos.log(
				"Setting up Mews for destination",
				aethos.settings.destinationMewsId
			);
			Mews.Distributor({
				configurationIds: [aethos.settings.destinationMewsId],
				openElements: ".reservenow",
			});
		} else {
			aethos.log("Setting up Mews for all destinations");
			// On the masterbrand page, listen for clicks on hotels in the booking modal
			document.querySelectorAll(".booking_link").forEach((el) => {
				el.addEventListener("click", function () {
					const mewsId = this.getAttribute("aethos-destination-mews-id");

					// Only proceed if a valid mewsId is found
					if (mewsId) {
						Mews.Distributor(
							{
								configurationIds: [mewsId],
							},
							function (distributor) {
								distributor.open();
							}
						);
					}
				});
			});
		}
	};

	/******/
	/*** CALL FUNCTIONS ***/
	/******/

	if (!aethos.settings.dev.all) {
		return;
	}

	aethos.anim.smoothScroll();
	aethos.anim.loader();
	aethos.functions.nav();
	aethos.functions.buildDestinationNav();
	aethos.functions.hiddenFormFields();
	aethos.functions.handleCMSLoad();
	aethos.functions.handleCMSFilter();
	aethos.functions.hideEmptySections();
	aethos.functions.updateDestinationSocials();
	aethos.anim.splitText();
	aethos.anim.splitTextBasic();
	aethos.anim.fadeUp();
	aethos.anim.staggerIn();
	aethos.functions.langUpdate();
	aethos.anim.filterDrawerOpenClose();
	aethos.anim.HoverTrigger();
	aethos.anim.arch();
	aethos.anim.arch_short();
	aethos.anim.NavImage();
	aethos.anim.loadSliders();
	aethos.anim.headerReveal();
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
	aethos.functions.loadVideos();
	aethos.anim.carousel();
	aethos.functions.patches();
	aethos.functions.retreatOutline();
	aethos.functions.calc();
	aethos.anim.addClubNavHover();
	aethos.functions.modalClose(".lang-switcher_close");
	aethos.functions.modalClose(".booking_close");
	aethos.anim.mblLangSlider();
	aethos.functions.formSubmissionStyling();
	aethos.anim.wellTabsUnderline();
	aethos.functions.clubNav();
	aethos.anim.pageTransition();
	aethos.functions.updateCopyrightYear();
	aethos.functions.observeNavGridChanges();
	aethos.functions.observeBookingToggle();
	aethos.functions.mews();
	aethos.aethosScriptsLoaded = true; // Confirms external script executed
}
