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

	/* GSAP page transitions NOT COMPLETE */
	aethos.anim.pageTransition = function () {
		return;
		aethos.log("Running page transition setup");
		const links = document.querySelectorAll("a");

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

					// Determine current theme
					const currentTheme = getThemeFromUrl(window.location.pathname);
					// Determine target theme
					const targetTheme = getThemeFromUrl(destinationUrl.pathname);

					// Only play transition if themes are different
					if (currentTheme !== targetTheme) {
						playPageTransition(targetTheme, () => {
							console.log("Navigating to:", destinationUrl.href);
							window.location.assign(destinationUrl.href);
						});
					} else {
						window.location.assign(destinationUrl.href);
					}

					aethos.log("Link update: " + destinationUrl);
				}
			});
		});

		function getThemeFromUrl(pathname) {
			// Match destinations, club, or default/global
			const destinationMatch = pathname.match(/^\/destinations\/([^\/]+)/);
			if (destinationMatch) {
				const slug = destinationMatch[1];
				return aethos.destinations[slug] || "default";
			}

			if (pathname.startsWith("/club")) {
				return "club";
			}

			return "default";
		}

		function playPageTransition(theme, onComplete) {
			// Customize Lottie animation and overlay color per theme
			const transitionEl = document.querySelector(".page-transition");
			const overlay = transitionEl.querySelector(".page-transition_overlay");

			let transition_lottie = lottie.loadAnimation({
				container: transitionEl.querySelector(".page-transition_lottie"),
				renderer: "svg",
				loop: false,
				autoplay: false,
				path: "https://cdn.prod.website-files.com/668fecec73afd3045d3dc567/66d03670c7268e6c895d7847_Aethos%20Logo%20Lottie%20v2.json",
			});

			gsap.set(transitionEl, { display: "flex" });

			// Create timeline
			let tl = gsap.timeline({ paused: true });

			tl.to(overlay, {
				opacity: 1,
				duration: 0.5,
			});

			// Play Lottie animation [5s]
			tl.to(playhead, {
				frame: transition_lottie.totalFrames - 1,
				duration: 5,
				ease: "none",
				onUpdate: () => transition_lottie.goToAndStop(playhead.frame, true),
			});

			// // overlay.style.backgroundColor = overlayColor;
			// gsap.to(overlay, {
			// 	opacity: 1,
			// 	duration: 0.5,
			// 	onComplete: () => {
			// 		// Play Lottie animation
			// 		const lottieInstance = lottie.loadAnimation({
			// 			container: lottieAnimation,
			// 			renderer: "svg",
			// 			loop: false,
			// 			autoplay: true,
			// 			path: lottiePath,
			// 		});

			// 		lottieInstance.addEventListener("complete", () => {
			// 			onComplete;
			// 			// // Fade out overlay after Lottie animation completes
			// 			// gsap.to(overlay, {
			// 			// 	opacity: 0,
			// 			// 	duration: 0.5,
			// 			// 	onComplete: onComplete,
			// 			// });
			// 		});
			// 	},
			// });
		}
	};

	/* set up GSAP smooth scroll */
	aethos.anim.smoothScroll = function () {
		gsap.registerPlugin(ScrollSmoother);

		ScrollSmoother.create({
			smooth: 1,
			effects: true,
			content: "#smooth-content",
			wrapper: "#smooth-wrapper",
			onUpdate: () => {
				// Add logic here if needed to update when smooth scroll occurs
			},
			onRefresh: () => {
				// Ensure the scroll trigger is refreshed once the smooth scroll has recalculated the height
				ScrollTrigger.refresh();
			},
		});
	};

	/* add class to <body> when .nav is open. Used for animating nav burger icon, potentially for handling other elements down the line */
	aethos.functions.nav = function () {
		aethos.helpers.globalNavClass = "nav-open";
		aethos.helpers.destNavClass = "dest-nav-open";

		function handleResize() {
			// Close the menu if the window width drops below the breakpoint
			if (window.innerWidth <= aethos.breakpoints.mbl) {
				document.body.classList.remove(aethos.helpers.globalNavClass);
			}
			if (window.innerWidth <= aethos.breakpoints.tab) {
				document.body.classList.remove(aethos.helpers.destNavClass);
			}
		}

		// Check for nav buttons before adding event listeners
		const navBtn = document.querySelector(".nav-btn");
		// const destNavBtn = document.querySelector(".dest-nav-btn");

		if (navBtn)
			navBtn.addEventListener("click", () =>
				document.body.classList.toggle(aethos.helpers.globalNavClass)
			);
		// if (destNavBtn)
		// 	destNavBtn.addEventListener("click", () => toggleNavClass(destNavClass)); // we move this later since the dest nav is added dynamically

		// Add resize event listener to handle window resizing
		window.addEventListener("resize", handleResize);

		// Initial check in case the page loads in mobile size
		handleResize();
	};

	/* nav hide/show */
	aethos.anim.navReveal = function () {
		// if we are on a non-destination page...
		if (!aethos.settings.destinationSlug) {
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
				// markers: true,
				onUpdate: (self) => {
					self.direction === -1 ? navReveal.play() : navReveal.reverse();
				},
			});
		} else {
			ScrollTrigger.create({
				start: "top -1px",
				end: "max",
				pin: ".dest-header",
				// markers: true,
				// onUpdate: (self) => {
				// 	self.direction === -1 ? navReveal.play() : navReveal.reverse();
				// },
			});
		}
	};

	/* nav logo height anim INCOMPLETE */
	aethos.anim.navHeight = function () {
		const header = document.querySelector(".header");
		const logo = header.querySelector(".header-bar_middle");
		const headerHeight_large = aethos.helpers.getProp("--c--header--h", header);

		// Only run this function if the pageLoader setting is true
		if (!aethos.settings.pageLoader) {
			return;
		}

		ScrollTrigger.create({
			start: "top " + headerHeight_large,
			end: 99999,
			toggleClass: { className: "scrolled", targets: ".site-header" },
		});

		return;

		// aethos.log("Page loader is enabled, running navHeight animation.");

		// Store the initial and smaller navbar heights (CSS variables are used for flexibility)
		// const headerHeight_large = aethos.helpers.getProp("--c--header--h");
		const logoHeight_lg = aethos.helpers.getProp(
			"--c--header--logo-h-lg",
			header
		);
		const logoHeight_sm = aethos.helpers.getProp(
			"--c--header--logo-h-sm",
			header
		);
		// console.log(logoHeight_lg);
		// const smallerHeight = "calc(0.8 * var(--c--header--h))"; // Adjust this multiplier for the reduced height

		// const navHeight = gsap
		// 	.fromTo(
		// 		logo,
		// 		{ height: logoHeight_sm },
		// 		{ height: logoHeight_lg, duration: 0.8, ease: "power2.out" }
		// 	)
		// 	.progress(1);

		// Set up GSAP ScrollTrigger to animate the navbar height
		ScrollTrigger.create({
			trigger: header, // Start reducing the height after scrolling down 10px
			start: "top top+=20",
			markers: true,
			// end: "max", // Keep the effect throughout the scroll
			// onEnter: () => navHeight.reverse(),
			// onEnterBack: () => navHeight.play(),
			onEnter: function () {
				gsap.to(logo, {
					height: logoHeight_sm,
					duration: 0.8,
					ease: "power2.out",
				});
			},
			onEnterBack: function () {
				gsap.to(logo, {
					height: logoHeight_sm,
					duration: 0.8,
					ease: "power2.out",
				});
			},

			// onUpdate: (self) => {
			// 	if (self.direction === 1 && window.scrollY > 10) {
			// 		// Scrolling down: reduce height
			// 		gsap.to(logo, {
			// 			height: logoHeight_sm,
			// 			duration: 0.3,
			// 			ease: "power2.out",
			// 		});
			// 	} else if (self.direction === -1 && window.scrollY <= 10) {
			// 		// Scrolling up: restore initial height
			// 		gsap.to(logo, {
			// 			height: logoHeight_lg,
			// 			duration: 0.3,
			// 			ease: "power2.out",
			// 		});
			// 	}
			// },
		});
	};

	aethos.anim.loader = function () {
		// Only run this function if the pageLoader setting is true and the loader hasn't run before
		if (
			!aethos.settings.pageLoader ||
			localStorage.getItem("aethos_loader_ran")
		) {
			return;
		}

		// Mark the loader as "played" in local storage, expiring in 30 days
		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 30);
		localStorage.setItem("aethos_loader_ran", true);
		localStorage.setItem("aethos_loader_expiration", expirationDate.getTime());

		// Get elements
		let header = document.querySelector(".header");
		let loader = document.querySelector(".site-loader");
		// let gsap_loader = gsap.utils.selector(loader);
		// let gsap_header = gsap.utils.selector(header);

		// Get Lottie
		let loader_lottie = lottie.loadAnimation({
			container: document.querySelector(".site-loader_lottie"),
			renderer: "svg",
			loop: false,
			autoplay: false,
			path: "https://cdn.prod.website-files.com/668fecec73afd3045d3dc567/66d03670c7268e6c895d7847_Aethos%20Logo%20Lottie%20v2.json",
		});

		let playhead = { frame: 0 };

		// Set initial states
		gsap.set(loader, { display: "flex", autoAlpha: 1 });
		gsap.set(".site-loader_overlay-bottom", { backgroundColor: "black" });
		gsap.set(".site-loader_lottie", { autoAlpha: 1, display: "block" });
		gsap.set(".site-loader_logo", { height: "auto", autoAlpha: 0 });
		gsap.set(".site-loader_img-container", { autoAlpha: 0 });
		gsap.set(".site-loader_img", { scale: 0.75 });
		gsap.set([".header-bar_left", ".header-bar_right"], { y: "200%" });
		gsap.set(".site-loader_overlay-top", { backgroundColor: "black" });
		gsap.set(".header-bar_middle", { autoAlpha: 0 });
		gsap.set(".site-loader_img-wrap", { width: "50%", height: "75%" });
		gsap.set(".hero-home_content", { autoAlpha: 0, y: "20%" });

		// Create timeline
		let tl = gsap.timeline({ paused: true });

		// Play Lottie animation [5s]
		tl.to(playhead, {
			frame: loader_lottie.totalFrames - 1,
			duration: 5,
			ease: "none",
			onUpdate: () => loader_lottie.goToAndStop(playhead.frame, true),
		});

		// Logo height animation, occurs simultaneously with Lottie [5.3s]
		tl.to(".site-loader_logo", { height: "100%", duration: 5 }, 0.3);

		// At 5.3 seconds: lottie fades out, logo fades in, overlay colors change
		tl.to(
			".site-loader_lottie",
			{ autoAlpha: 0, duration: 1.25, ease: "power4.inOut" },
			5.3
		);
		tl.to(
			".site-loader_logo",
			{ autoAlpha: 1, duration: 1.25, ease: "power4.inOut" },
			5.3
		);
		tl.to(
			".site-loader_overlay-bottom",
			{ backgroundColor: "black", duration: 1.25, ease: "power4.inOut" },
			5.3
		); // Change to the correct page-bg color later
		tl.to(
			".site-loader_overlay-top",
			{ backgroundColor: "transparent", duration: 1.25, ease: "power4.inOut" },
			5.3
		);

		// At 5.55s: Show image container [1s ease in]
		tl.to(
			".site-loader_img-container",
			{ autoAlpha: 1, duration: 1, ease: "power4.in" },
			5.55
		);

		// At 6.55s: Scale image to 1, adjust logo, move header bars, adjust image wrap [various durations]
		tl.to(
			".site-loader_img",
			{ scale: 1, duration: 1.5, ease: "power4.inOut" },
			6.55
		);
		tl.to(
			".site-loader_logo",
			{ height: "auto", duration: 1.5, ease: "power4.inOut" },
			6.55
		);
		tl.to(
			".header-bar_left",
			{ y: "0%", duration: 0.4, ease: "power4.inOut" },
			6.55
		);
		tl.to(
			".header-bar_right",
			{ y: "0%", duration: 0.4, ease: "power4.inOut" },
			6.55
		);
		tl.to(
			".site-loader_img-wrap",
			{ width: "100%", height: "100%", duration: 0.5, ease: "linear" },
			6.55
		);

		// At 8.8s: Show hero-home content [0.4s ioq]
		tl.to(
			".hero-home_content",
			{ autoAlpha: 1, y: "0%", duration: 0.4, ease: "power4.inOut" },
			8.8
		);

		// At 9.2s: Show header middle bar and hide loader
		tl.to(
			".header-bar_middle",
			{ autoAlpha: 1, display: "flex", duration: 0 },
			9.2
		);
		tl.to(loader, { autoAlpha: 0, display: "none", duration: 0 }, 9.2);

		// Play the timeline
		tl.play();
		aethos.log("loader play");
		tl.pause(4.8);
	};

	// Check and remove expired local storage entry for loader animation
	aethos.helpers.clearExpiredLoader = function () {
		const expiration = localStorage.getItem("aethos_loader_expiration");
		if (expiration && new Date().getTime() > expiration) {
			localStorage.removeItem("aethos_loader_ran");
			localStorage.removeItem("aethos_loader_expiration");
		}
	};

	// Call clearExpiredLoader when the page loads
	aethos.helpers.clearExpiredLoader();

	// /* homepage loader */
	// aethos.anim.loader_v1 = function () {
	// 	// Only run this function if the pageLoader setting is true
	// 	if (!aethos.settings.pageLoader) {
	// 		return;
	// 	}

	// 	/* get els */
	// 	let header = document.querySelector(".header");
	// 	let loader = document.querySelector(".site-loader");
	// 	let gsap_loader = gsap.utils.selector(loader);
	// 	let gsap_header = gsap.utils.selector(header);

	// 	/* get lottie */
	// 	let loader_lottie = lottie.loadAnimation({
	// 		container: loader.querySelector(".site-loader_lottie"),
	// 		renderer: "svg",
	// 		loop: false,
	// 		autoplay: false,
	// 		path: "https://cdn.prod.website-files.com/668fecec73afd3045d3dc567/66d03670c7268e6c895d7847_Aethos%20Logo%20Lottie%20v2.json",
	// 	});
	// 	//   loader_lottie.setSpeed(5);
	// 	let playhead = { frame: 0 };

	// 	/* set initial states */
	// 	gsap.set(loader, { display: flex });
	// 	gsap.set(".site-loader_overlay-bottom", { backgroundColor: "black" });
	// 	gsap.set(".site-loader_lottie", { autoAlpha: 1 });
	// 	gsap.set(loader, { autoAlpha: 1 });
	// 	gsap.set(".site-loader_logo", { height: auto, autoAlpha: 0 });
	// 	gsap.set(".site-loader_img-container", { autoAlpha: 0 });
	// 	gsap.set(".site-loader_img", { scale: 0.75 });
	// 	gsap.set([".header-bar_left", ".header-bar_right"], { y: "200%" });
	// 	gsap.set(".site-loader_overlay-top", { backgroundColor: "black" });
	// 	gsap.set(".header-bar_middle", { autoAlpha: 0 });
	// 	gsap.set(".site-loader_img-wrap ", { width: "50%", height: "75%" });
	// 	gsap.set(".hero-home_content", { autoAlpha: 0, y: "20%" });

	// 	/* create timeline */
	// 	let tl = gsap.timeline({
	// 		paused: true,
	// 	});

	// 	tl.to(playhead, {
	// 		frame: loader_lottie.totalFrames - 1,
	// 		duration: 5,
	// 		ease: "none",
	// 		onUpdate: () => loader_lottie.goToAndStop(playhead.frame, true),
	// 	});

	// 	/*

	// 	Start:

	// 	show loader (flex)
	// 	overlay color .site-loader_overlay-bottom
	// 	start lottie at zero
	// 	lottie 100% opacity
	// 	loader 100% opacity
	// 	.site-loader_logo size height auto, hidden, opacity 0
	// 	.site-loader_img-container hidden, opacity 0
	// 	<clips> TBC
	// 	.site-loader_img scale 0.75
	// 	.header-bar_left, .header-bar_right Y -200%
	// 	.site-loader_overlay-top BG color body
	// 	.header-bar_middle hidden
	// 	.site-loader_img-wrap size W 50% H 75%
	// 	.hero-home_content opacity 0, Y 20px

	// 	0.3s

	// 	lottie play [5s]
	// 	.site-loader_logo size height 100%

	// 	5.3s

	// 	_logo display flex
	// 	_img-container display flex
	// 	lottie opacity 0 [1.25s inoutquart]
	// 	_logo opacity 1 [1.25s inoutquart]
	// 	_overlay-bottom bg color page-bg [1.25s inoutquart]
	// 	_overaly-top bg color transparent [1.25s inoutquart]

	// 	5.55s

	// 	_img-container opacity 1 [1s ease in]

	// 	6.55s

	// 	<clips> TBC
	// 	_img scale 1 [1.5s ioq]
	// 	_logo height auto [1.5s ioq]
	// 	_left move y 0 [0.4 ioq]
	// 	_right move y 0 [0.4 ioq]
	// 	_img-wrap size 100% 100% [0.5 linear]

	// 	8.8s

	// 	hero-home_content opacity 1, move y 0 [0.4 ioq]

	// 	9.2s

	// 	header-bar_middle display flex
	// 	site-loader hide

	// 	*/
	// };

	/* basic slide and fade anim */
	aethos.anim.fadeUp = function () {
		// for elements that are their own trigger
		const self_targets = gsap.utils.toArray(".anim_fade-up_self");
		self_targets.forEach((target) => {
			gsap.set(target, {
				y: 20,
				opacity: 0,
			});
			let tl = gsap.timeline({
				paused: true,
				scrollTrigger: {
					trigger: target,
					start: "top 80%", // start 30% from bottom
					scrub: false,
				},
			});
			tl.to(target, { y: 0, duration: 0.5 });
			tl.to(target, { opacity: 1, duration: 0.8 }, "<"); // opacity anim is slightly longer
		});

		// for elements that have a different trigger
		const triggers = gsap.utils.toArray(".anim_fade-up_trigger");
		// const stagger = 0.2; // optional stagger
		const stagger = 0; // removing stagger for now
		gsap.set(".anim_fade-up_target", {
			y: 20,
			opacity: 0,
		});
		triggers.forEach((trigger) => {
			const targets = gsap.utils.toArray(".anim_fade-up_target", trigger); // targets within this trigger
			let tl = gsap.timeline({
				paused: true,
				scrollTrigger: {
					trigger: trigger,
					start: "top 70%", // start 30% from bottom
					scrub: false,
				},
			});
			// Stagger animation for targets
			tl.to(targets, { y: 0, duration: 0.5, stagger: stagger }); // Adjust stagger duration as needed
			tl.to(targets, { opacity: 1, duration: 0.8, stagger: stagger }, "<"); // opacity anim is slightly longer but starts at same time
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
			console.log(trigger);
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
					this.closest(".grid-header").classList.add("is-open");
				} else {
					this.closest(".grid-header").classList.remove("is-open");
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

	/* show nav images on nav link hover */
	aethos.anim.NavImage = function () {
		const nav_link_triggers = document.querySelectorAll(
			".anim-nav-img_trigger[data-link-id]"
		);
		const nav_link_imgs = document.querySelectorAll(
			".anim-nav-img_target[data-link-id]"
		);

		nav_link_triggers.forEach((link) => {
			link.addEventListener("mouseenter", () => {
				//NB - we use mousenter and leave instead of over and out, because this stops event bubbling, which would fire the Destinations dropdown img when hoving over a single child destination
				const linkId = link.getAttribute("data-link-id");
				aethos.log("nav link trigger: " + linkId);

				nav_link_imgs.forEach((img) => {
					if (img.getAttribute("data-link-id") === linkId) {
						img.classList.add("is-active");
						img.style.opacity = 1;
					} else {
						img.style.opacity = 0;
						img.classList.remove("is-active");
					}
				});
			});

			link.addEventListener("mouseleave", () => {
				const linkId = link.getAttribute("data-link-id");

				nav_link_imgs.forEach((img) => {
					if (img.getAttribute("data-link-id") === linkId) {
						img.style.opacity = 0;
						img.classList.remove("is-active");
					}
				});
			});
		});
	};

	/* animated text effect 1 */
	aethos.anim.splitText = function () {
		let typeSplit;
		let targetClass = "anim-split";
		let linesClass = "anim-split_line"; // class to add to lines
		let maskClass = "anim-split_line-mask"; // class to add to masks

		// Split the text up
		function runSplit() {
			typeSplit = new SplitText("." + targetClass, {
				types: "lines",
				linesClass: linesClass,
			});
			$("." + linesClass).append("<div class='" + maskClass + "'></div>");
			createAnimation();
		}
		runSplit();

		// Update on window resize
		let windowWidth = $(window).innerWidth();
		window.addEventListener("resize", function () {
			if (windowWidth !== $(window).innerWidth()) {
				windowWidth = $(window).innerWidth();
				typeSplit.revert();
				runSplit();
			}
		});

		function createAnimation() {
			const trigger = document.querySelector("." + targetClass);
			const lines = $("." + linesClass);

			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: trigger,
					start: "top 90%",
					end: "bottom 10%",
					scrub: true,
				},
			});

			tl.to(lines.find("." + maskClass), {
				width: "0%",
				duration: 1,
				ease: "power2.out",
				stagger: {
					each: 0.5,
					onComplete: () => {},
				},
			});

			// Ensure that the animation duration matches the scroll distance
			let totalScrollDistance = tl.scrollTrigger.end - tl.scrollTrigger.start;
			tl.totalDuration(totalScrollDistance / 1000); // Adjusting the total duration to match scroll distance
		}
	};

	/* animated text effect 2 */
	aethos.anim.splitTextBasic = function () {
		const targets = document.querySelectorAll(".anim-split-basic");

		function setupSplits() {
			targets.forEach((target) => {
				// Reset if needed
				if (target.anim) {
					target.anim.progress(1).kill();
					target.split.revert();
				}

				target.split = new SplitText(target, {
					type: "lines",
				});

				let stagger = 1 / target.split.lines.length; // make stagger quicker if we have more lines;

				// Set up the anim
				target.anim = gsap.from(target.split.lines, {
					scrollTrigger: {
						trigger: target,
						start: "top 70%",
					},
					duration: 1,
					opacity: 0,
					stagger: stagger,
				});
			});
		}

		ScrollTrigger.addEventListener("refresh", setupSplits);
		setupSplits();
	};

	/* generate a carousel for block (5050) elements */
	aethos.anim.blockCarousel = function () {
		// Loop through all .block elements on the page
		document.querySelectorAll(".block").forEach(function (block) {
			// Check if the block contains a .block_media-list element
			const mediaList = block.querySelector(".block_media-list");
			if (!mediaList) return; // If it doesn't, stop and move on to the next block

			// Get all the .img-wrap elements (slides) within the media list
			const slides = mediaList.querySelectorAll(".img-wrap");
			const slidesCount = slides.length;
			if (slidesCount === 0) return;

			// Pagination set up
			const pagination = block.querySelector(".block_pagination");
			if (!pagination) return;

			pagination.innerHTML = ""; // Clear existing dots and add correct number
			slides.forEach(() => {
				const dot = document.createElement("div");
				dot.classList.add("block_pagination-dot");
				pagination.appendChild(dot);
			});
			const dots = pagination.querySelectorAll(".block_pagination-dot");

			/* for autoplay - currently disabled */
			// const autoplay = block.getAttribute("data-carousel-autoplay") || false; // should we enable autoplay?
			if (true) {
				handleAutoplay();

				function handleAutoplay() {
					const pause =
						parseInt(block.getAttribute("data-carousel-duration")) || 3; // how long img is onscreen - get from attribute
					const transition = 1; // length of fade
					let stagger = pause + transition;
					let repeatDelay = stagger * (slidesCount - 1) + pause;

					// GSAP timeline for fade in/out of slides
					const tl = gsap.timeline({
						repeat: -1,
						// paused: true,
						onUpdate: function () {
							// Update active dot based on the current time of the timeline
							let currentSlide =
								Math.floor(tl.time() / stagger) % slides.length;
							dots.forEach((dot, index) => {
								dot.classList.toggle("is-active", index === currentSlide);
							});
						},
					});

					function init() {
						gsap.set(slides, { autoAlpha: 1 }); // hide all slides
						tl.from(slides, {
							autoAlpha: 0,
							duration: transition,
							opacity: 0,
							ease: "power4.inOut",
							stagger: {
								each: stagger,
								repeat: -1,
								repeatDelay: repeatDelay,
							},
						}).to(
							slides,
							{
								autoAlpha: 0,
								duration: transition,
								opacity: 0,
								ease: "power4.inOut",
								stagger: {
									each: stagger,
									repeat: -1,
									repeatDelay: repeatDelay,
								},
							},
							stagger
						);
					}

					// Start the timeline
					init();
				}
			}

			/* slide transition */
		});
	};

	/* generate a carousel for room cards */
	aethos.anim.roomCardCarousel = function () {
		// Loop through all .room-card elements on the page
		document.querySelectorAll(".room-card").forEach(function (roomCard) {
			// Check if the card contains a media list element
			const mediaList = roomCard.querySelector(".room-card_media-list");

			// If it doesn't, stop and move on to the next one
			if (!mediaList) return;

			// Get all the slides within the media list
			const slides_original = mediaList.querySelectorAll(".img-wrap");

			/* limit to 8 slides */
			let slides = [];
			slides_original.forEach((slide, index) => {
				if (index < 8) {
					slides.push(slide);
				}
			});

			let slidesCount = slides.length;

			// get pagination
			const pagination = roomCard.querySelector(".room-card_pagination");
			const counters = roomCard.querySelector(".room-card_counters");
			let dots, activeCounter;

			// if none or one slide, hide pagination and counters and don't run carousel
			if (slidesCount < 2) {
				if (pagination) {
					pagination.style.display = "none";
				}
				if (counters) {
					counters.style.display = "none";
				}
				return;
			}
			// otherwise run pagination and counter setup
			else {
				if (pagination) {
					dots = setUpPagination(pagination);
				}
				if (counters) {
					activeCounter = setUpCounters(counters, slidesCount);
				}
			}

			// Pagination set up
			function setUpPagination(pagination) {
				pagination.innerHTML = ""; // Clear existing dots and add correct number
				slides.forEach(() => {
					const dot = document.createElement("div");
					dot.classList.add("room-card_pagination-dot");
					pagination.appendChild(dot);
				});
				const dots = pagination.querySelectorAll(".room-card_pagination-dot");
				return dots;
			}

			// Slide counter set up
			function setUpCounters(counters, slidesCount) {
				const totalCounter = counters.querySelector(
					".room-card_counter-item.is-total"
				);
				const activeCounter = counters.querySelector(
					".room-card_counter-item.is-active"
				);
				totalCounter.innerHTML = slidesCount; // update total counter with slide count

				return activeCounter;
			}

			/* for autoplay - currently disabled */
			// const autoplay = roomCard.getAttribute("data-carousel-autoplay") || false; // should we enable autoplay?
			if (true) {
				handleAutoplay();

				function handleAutoplay() {
					const pause =
						parseInt(roomCard.getAttribute("data-carousel-duration")) || 3; // how long img is onscreen - get from attribute
					const transition = 1; // length of fade
					let stagger = pause + transition;
					let repeatDelay = stagger * (slidesCount - 1) + pause;

					// GSAP timeline for fade in/out of slides
					const tl = gsap.timeline({
						repeat: -1,
						// paused: true,
						onUpdate: function () {
							// Update active counter
							let currentSlide =
								Math.floor(tl.time() / stagger) % slides.length;
							activeCounter.innerHTML = currentSlide + 1;
							dots.forEach((dot, index) => {
								dot.classList.toggle("is-active", index === currentSlide);
							});
						},
					});

					function init() {
						gsap.set(slides, { autoAlpha: 1 }); // hide all slides
						tl.from(slides, {
							autoAlpha: 0,
							duration: transition,
							opacity: 0,
							ease: "power4.inOut",
							stagger: {
								each: stagger,
								repeat: -1,
								repeatDelay: repeatDelay,
							},
						}).to(
							slides,
							{
								autoAlpha: 0,
								duration: transition,
								opacity: 0,
								ease: "power4.inOut",
								stagger: {
									each: stagger,
									repeat: -1,
									repeatDelay: repeatDelay,
								},
							},
							stagger
						);
					}

					// Start the timeline
					init();
				}
			}

			/* slide transition */
		});
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
						//markers: true,
					},
				});

				// Set up scroll triggers for each value
				values.forEach((value, index) => {
					let title = titles[index];
					let body = bodies[index];
					let image = images[index];

					// add a scrolltrigger for each image that toggles an active class on/off the corresponding title and body elements
					ScrollTrigger.create({
						trigger: image,
						start: "top 70%",
						end: "bottom 70%",
						toggleClass: { targets: [title, body], className: "is-active" },
						scrub: true,
					});
					// }
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
					markers: true,
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

		// Add markers and tooltips
		destinations.forEach((destEl) => {
			const destination = {};
			destination.lat = parseFloat(destEl.getAttribute("aethos-dest-lat"));
			destination.long = parseFloat(destEl.getAttribute("aethos-dest-long"));
			destination.name = destEl.getAttribute("aethos-dest-name");
			destination.address = destEl.getAttribute("aethos-dest-address");
			destination.imgSrc = destEl.getAttribute("aethos-dest-img");
			destination.theme = destEl.getAttribute("aethos-dest-theme");
			destination.themeColor =
				aethos.themes[destination.theme.toLowerCase()]?.dark || "#000"; // Default to black if theme is undefined

			if (!destination.lat || !destination.long) {
				return;
			}

			// Create and add custom circle marker
			destination.marker = L.circleMarker([destination.lat, destination.long], {
				radius: 8,
				color: destination.themeColor,
				fillColor: destination.themeColor,
				fillOpacity: 1,
			}).addTo(markerLayer);

			// Use the createPopupContent function to generate the HTML for each pop-up
			if (!aethos.settings.destinationSlug) {
				// only if we're not on a destination page
				destination.popupContent = createPopupContent({
					imageUrl: destination.imgSrc,
					address: destination.address,
					name: destination.name,
					linkUrl: "/destinations/" + destination.name + "/contact",
				});

				// Bind the pop-up to the marker
				destination.marker.bindPopup(destination.popupContent, {
					maxWidth: 300,
				});
			}

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
		aethos.map.map.fitBounds(markerLayer.getBounds());

		// if a destination page, zoom out a lot
		if (aethos.settings.destinationSlug) {
			aethos.map.map.setZoom(10);
		}

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
				console.log("do full animation");
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
				button.href = `/destination-subpages/all-experiences/${destinationSlug}?category=${experienceCategory}`;
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
							aethos.error(`Error pausing video ${vimeoId}:`, error);
						});
					}
				},
				onEnterBack: () => {
					if (player) {
						player.play().catch(function (error) {
							aethos.error(`Error resuming video ${vimeoId}:`, error);
						});
					}
				},
				onLeaveBack: () => {
					if (player) {
						player.pause().catch(function (error) {
							aethos.error(`Error pausing video ${vimeoId}:`, error);
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
					aethos.error(`Error playing video ${vimeoId}:`, error);
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
				console.log(bottomContainer);

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
					aethos.log(
						`Creating child container for primary item with ID: ${primary.id}`
					);
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
						aethos.log(
							`Appending secondary item to primary item with ID: ${primary.id}`
						);
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
					aethos.log(
						`Child container for primary item with ID: ${primary.id} added to .dest-nav_bottom`
					);
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

		function addNavigationHover() {
			const menus = document.querySelectorAll(".dest-nav_top");

			menus.forEach((menu) => {
				menu.addEventListener("mouseover", (event) => {
					// Check if screen width is 992px or above
					if (
						window.matchMedia(`(min-width: ${aethos.breakpoints.tab + 1}px)`)
							.matches
					) {
						if (event.target.classList.contains("link-cover")) {
							const menuRect = menu.getBoundingClientRect();
							const targetRect = event.target.getBoundingClientRect();

							// Calculate the offset relative to the menu
							const offsetX = targetRect.left - menuRect.left;

							console.log(event.target);
							console.log(menu);
							console.log(menuRect);
							console.log(targetRect);
							console.log(offsetX);

							// Set underline width and position properties
							menu.style.setProperty(
								"--dest-nav-underline-width",
								`${event.target.offsetWidth}px`
							);

							menu.style.setProperty(
								"--dest-nav-underline-offset-x",
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
						menu.style.setProperty("--dest-nav-underline-width", "0");
					}
				});
			});
		}

		function showSubnavOnHover_legacy() {
			const primaryEls = document.querySelectorAll(".dest-nav_item");
			const subnavWrapper = document.querySelector(".dest-nav_bottom");

			let primaryItems = [];

			primaryEls.forEach((primaryEl) => {
				let item = {};
				item.el = primaryEl;
				item.hasChildren = primaryEl.hasAttribute("aethos-nav-children");
				item.primaryId = primaryEl.getAttribute("aethos-nav-id");

				// Find the corresponding sub-navigation container if it exists
				item.subnav = subnavWrapper.querySelector(
					`.dest-nav_child-list[aethos-nav-id="${item.primaryId}"]`
				);

				// gsap
				// .matchMedia()
				// .add(`(min-width: ${aethos.breakpoints.tab + 1}px)`, () => {

				function toggleTimeline(item) {
					item.isHovered ? item.tl.play() : item.tl.reverse();
				}

				function openSubmenu(item) {
					item.isHovered = true;
					item.el.setAttribute("aethos-subnav-status", "open");
					toggleTimeline(item);
				}

				function closeSubmenu(item) {
					item.isHovered = false;
					item.el.setAttribute("aethos-subnav-status", "closed");
					toggleTimeline(item);
				}

				if (item.subnav) {
					item.tl = setupSubnavTimeline(item);
					item.isHovered = false;
					item.el.setAttribute("aethos-subnav-status", "closed");

					item.el.addEventListener("mouseenter", () => openSubmenu(item));
					item.el.addEventListener("mouseleave", () => closeSubmenu(item));
					item.subnav.addEventListener("mouseenter", () => openSubmenu(item));
					item.subnav.addEventListener("mouseleave", () => closeSubmenu(item));

					// // Cleanup function for when the media query condition changes
					// return () => {
					// 	primaryItem.removeEventListener("mouseenter", openSubmenu);
					// 	primaryItem.removeEventListener("mouseleave", closeSubmenu);
					// 	subnav.removeEventListener("mouseenter", openSubmenu);
					// 	subnav.removeEventListener("mouseleave", closeSubmenu);
					// };
				} else {
					// If the primary item has no children, close any open subnavs on hover
					item.el.addEventListener("mouseenter", () => {
						const openPrimaries = primaryItems.filter((item) => item.isHovered);

						openPrimaries.forEach((item) => {
							closeSubmenu(item);
						});

						// if (openSubnav) {
						// 	gsap.to(openSubnav, {
						// 		autoAlpha: 0,
						// 		duration: 0.2,
						// 	});
						// }
					});
				}
				// });

				// gsap
				// 	.matchMedia()
				// 	.add(`(max-width: ${aethos.breakpoints.tab}px)`, () => {
				// 		if (hasChildren && subnav) {
				// 			const tl = setupSubnavTimeline();

				// 			let isOpen = false;

				// 			primaryItem.addEventListener("click", () => {
				// 				isOpen = !isOpen;
				// 				isOpen ? tl.play() : tl.reverse();
				// 			});

				// 			// Back button closes subnav
				// 			const backBtn = document.querySelector(".dest-nav_back");
				// 			if (backBtn) {
				// 				backBtn.addEventListener("click", () => {
				// 					gsap.set(subnavWrapper, { display: "none" });
				// 					isOpen = false;
				// 					tl.reverse();
				// 				});
				// 			}

				// 			// Cleanup function for when the media query condition changes
				// 			return () => {
				// 				primaryItem.removeEventListener("click", onClick);
				// 				if (backBtn) {
				// 					backBtn.removeEventListener("click", onClick);
				// 				}
				// 			};
				// 		}
				// 	});

				function setupSubnavTimeline(item) {
					// Ensure subnav starts hidden
					gsap.set(subnavWrapper, {
						autoAlpha: 0,
						height: 0,
					});
					gsap.set(item.subnav.querySelectorAll(".dest-nav_link"), {
						autoAlpha: 0,
					});
					gsap.set(item.subnav, {
						autoAlpha: 0,
					});

					return gsap
						.timeline({ paused: true })
						.to(subnavWrapper, {
							autoAlpha: 1,
							height: "auto",
							duration: 0.2,
						})
						.to(
							item.subnav,
							{
								autoAlpha: 1,
								duration: 0.15,
							},
							"-=0.1"
						)
						.to(
							item.subnav.querySelectorAll(".dest-nav_link"),
							{
								autoAlpha: 1,
								duration: 0.15,
								stagger: 0.075,
							},
							"-=0.1"
						);
				}
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

			// Now add the animations
			addNavigationHover();
			showSubnavOnHover();
			document.querySelector(".dest-nav").classList.add(".is-ready");
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

	/* load CMS carousels */
	aethos.functions.loadCMSCarousels = function () {
		document
			.querySelectorAll("[aethos-cms-carousel='enabled']") // get sections that support carousels
			.forEach((carouselSection) => {
				const slug = carouselSection.getAttribute("aethos-cms-carousel-slug");
				const path = carouselSection.getAttribute("aethos-cms-carousel-path");
				const maxSlides =
					parseInt(carouselSection.getAttribute("aethos-cms-carousel-max")) ||
					8;

				const carousel = carouselSection.querySelector(".cms-carousel");

				if (carousel) {
					if (slug && path) {
						// Load carousel content from another page if slug and path are provided
						ScrollTrigger.create({
							trigger: carouselSection,
							start: "top 10%",
							onEnter: () => {
								const fetchUrl = `${path}/${slug}`;

								fetch(fetchUrl)
									.then((response) => {
										if (response.ok) return response.text();
										throw new Error("Network response was not ok.");
									})
									.then((html) => {
										const parser = new DOMParser();
										const doc = parser.parseFromString(html, "text/html");

										let carouselInner = doc.querySelector(
											".page-resources .cms-carousel_inner"
										);

										// console.log(carouselInner);

										if (carouselInner) {
											carousel.innerHTML = ""; // remove any existing content
											carouselInner = carousel.appendChild(carouselInner);
											carouselInner
												.querySelectorAll("script[type='x-wf-template']")
												.forEach((script) => script.remove());

											setupCarousel(carouselInner);
										}
									})
									.catch((error) => {
										console.error("Error fetching the carousel:", error);
									});
							},
							once: true,
						});
					} else {
						// If slug is empty, use the existing carousel content
						const carouselInner = carousel.querySelector(".cms-carousel_inner");
						if (carouselInner) {
							setupCarousel(carouselInner);
						}
					}
				}

				function setupCarousel(carouselInner) {
					const slides = Array.from(
						carouselInner.querySelectorAll(".cms-carousel_list-item")
					);
					slides.slice(maxSlides).forEach((slide) => slide.remove());

					const slideCount = Math.min(slides.length, maxSlides);

					// Retrieve pagination and counters
					const pagination = carouselSection.querySelector(
						".room-card_pagination"
					);
					const counters = carouselSection.querySelector(".room-card_counters");
					let dots, activeCounter;

					// Skip Splide initialization for single-slide carousels
					if (slideCount < 2) {
						hidePagination(pagination, counters);
						return;
					}

					// Initialize pagination and counters if they exist
					if (pagination) dots = setUpPagination(pagination, slideCount);
					if (counters) activeCounter = setUpCounters(counters, slideCount);

					const splideEl = carouselInner.classList.contains("splide")
						? carouselInner
						: carouselInner.querySelector(".splide");

					if (splideEl) {
						const splideInstance = new Splide(splideEl, {
							type: "loop",
							perPage: 1,
							perMove: 1,
							autoplay: false,
							pagination: false,
							arrows: false,
							drag: true,
						}).mount();

						splideInstance.on("move", (newIndex) => {
							if (activeCounter) activeCounter.innerHTML = newIndex + 1;
							dots.forEach((dot, index) => {
								dot.classList.toggle("is-active", index === newIndex);
							});
						});

						aethos.log("Carousel loaded");
					}
				}

				function setUpPagination(pagination, slideCount) {
					pagination.innerHTML = "";
					const dots = [];
					for (let i = 0; i < slideCount; i++) {
						const dot = document.createElement("div");
						dot.classList.add("room-card_pagination-dot");
						pagination.appendChild(dot);
						dots.push(dot);
					}
					return dots;
				}

				function setUpCounters(counters, slideCount) {
					const totalCounter = counters.querySelector(
						".room-card_counter-item.is-total"
					);
					const activeCounter = counters.querySelector(
						".room-card_counter-item.is-active"
					);
					if (totalCounter) totalCounter.innerHTML = slideCount;
					return activeCounter;
				}

				function hidePagination(pagination, counters) {
					if (pagination) pagination.style.display = "none";
					if (counters) counters.style.display = "none";
				}
			});
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

	// // Clear select dropdown when clicking 'All' or similar
	// aethos.functions.clearSelect = function () {
	// 	function clearSelect(identifier, value = "all") {
	// 		const selectElement = document.querySelector(
	// 			`select[fs-cmsfilter-field='${identifier}']`
	// 		);
	// 		const clearElement = document.querySelector(
	// 			`[fs-cmsfilter-clear='${identifier}']`
	// 		);

	// 		if (selectElement && clearElement) {
	// 			// Check the initial value
	// 			if (selectElement.value.toLowerCase() === value.toLowerCase()) {
	// 				clearElement.click();
	// 				selectElement.value = value;
	// 			}

	// 			// Add event listener to handle changes
	// 			selectElement.addEventListener("change", (event) => {
	// 				if (event.target.value.toLowerCase() === value.toLowerCase()) {
	// 					clearElement.click();
	// 					selectElement.value = value;
	// 				}
	// 			});
	// 		}
	// 	}
	// };

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

	/* CALL FUNCTIONS */
	// aethos.anim.pageTransition();

	aethos.functions.nav();
	aethos.functions.buildDestinationNav();

	aethos.functions.hiddenFormFields();
	// aethos.functions.clearSelect();

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
	aethos.anim.blockCarousel();
	aethos.anim.roomCardCarousel();
	aethos.anim.values();
	aethos.anim.articleSticky();
	aethos.anim.journalSticky();
	aethos.map.init();
	aethos.anim.loadHero();
	aethos.functions.loadVibes();
	aethos.functions.addExperienceFilterLinks();
	aethos.functions.formatDates();
	aethos.functions.dateSuffixes();

	aethos.functions.updateSubscribeFormName();

	// Call loader function at an appropriate point (e.g., inside main or Swup transition)
	aethos.anim.loader();

	aethos.functions.loadVideos();

	aethos.functions.loadCMSCarousels();

	aethos.functions.patches();

	aethos.functions.retreatOutline();
}
