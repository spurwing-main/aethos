function main() {
	/* set up global aethos obj */
	aethos.anim = {};
	aethos.helpers = {};
	aethos.splides = {};
	aethos.functions = {};
	aethos.settings = {};

	/* load aethos settings */
	aethos.functions.getPageSettings = function () {
		const pageWrap = document.querySelector(".page-wrap");

		if (pageWrap) {
			// Retrieve and store the data-page-bg, data-page, and data-page-loader attributes
			aethos.settings.pageBg = pageWrap.getAttribute("data-page-bg") || null;
			aethos.settings.pageName = pageWrap.getAttribute("data-page") || null;
			aethos.settings.pageLoader =
				pageWrap.getAttribute("data-page-loader") === "true";
			aethos.settings.pageWrap = pageWrap;

			// Log the settings if debug mode is on
			aethos.log(`Page settings loaded: ${JSON.stringify(aethos.settings)}`);
		} else {
			aethos.log("No .page-wrap element found.");
		}
	};
	aethos.functions.getPageSettings();

	/* helper to get a custom prop value */
	aethos.helpers.getProp = function (
		propName,
		element = document.documentElement
	) {
		const value = getComputedStyle(element).getPropertyValue(propName).trim();
		if (!value) {
			console.warn(`CSS property "${propName}" not found on the element.`);
		} else {
			aethos.log(value);
		}
		return value;
	};

	/* register GSAP plugins */
	gsap.registerPlugin(SplitText, ScrollSmoother);

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
		function toggleNavClass() {
			if (document.body.classList.contains("nav-open")) {
				document.body.classList.remove("nav-open");
			} else {
				document.body.classList.add("nav-open");
			}
		}

		document
			.querySelector(".nav-btn")
			.addEventListener("click", toggleNavClass);
	};

	/* nav hide/show */
	aethos.anim.navReveal = function () {
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
		const stagger = 0.2; // optional stagger
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
		/* TO DO - SUPPORT MULTIPLE INSTANCES */
		let trigger = document.querySelector(".anim-arch_trigger"); // the wrapper element
		let arch_path = document.querySelector("#shape-arch path"); // the clip path for the front img
		let arch_path_bg = document.querySelector("#shape-arch-bg path"); // the clip path for the bg img
		let arch_arch = gsap.utils.toArray(".anim-arch_arch"); // the element that clips the imgs into arch shapes
		let arch_img = document.querySelector(".anim-arch_img"); // the front img
		let arch_img_bg = document.querySelector(".anim-arch_img-bg"); // the bg img

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
			console.log(trigger);

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

	/* create sliders */
	aethos.anim.loadSliders = function () {
		/* splide defaults */
		Splide.defaults = {
			perMove: 1,
			gap: "0rem",
			arrows: false,
			pagination: false,
			focus: "center",
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

						// Calculate the maximum left position for the progress bar
						const maxMove = 100 - 100 / count;

						// Adjust the bar's left position based on the clamped rate
						bar.style.left = `${rate * maxMove}%`;
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
					// 		// Snap to closest slide when dragging ends
					// 		let slideCount = splide.Components.Controller.getEnd() + 1;
					// 		let rate = parseFloat(bar.style.left) / 100;
					// 		let targetSlide = Math.round(rate * slideCount);
					// 		splide.go(targetSlide); /* required to disable snapping */
					// 	}
					// });

					// document.addEventListener("mousemove", function (e) {
					// 	if (isDragging) {
					// 		let rect = progressWrapper.getBoundingClientRect();
					// 		let dragPos = (e.clientX - rect.left) / rect.width;
					// 		dragPos = Math.max(0, Math.min(1, dragPos)); // Ensure it's within [0, 1]
					// 		let slideCount = splide.Components.Controller.getEnd() + 1;
					// 		bar.style.left = String(100 * dragPos) + "%";
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
					autoplay: false,
					autoScroll: {
						autoStart: false,
					},
					focus: 0,
					trimSpace: "move",
					flickPower: 400,
					// breakpoints: {
					// 	767: { perPage: 1 },
					// 	991: { perPage: 2 },
					// },
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
		// get all values components on page
		let valuesSections = document.querySelectorAll(".s-values");
		valuesSections.forEach((section) => {
			// assemble the component
			let values = section.querySelectorAll(".values_item");
			values.forEach((value) => {
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

		// gsap.utils.toArray(".values_item-title").forEach(function (a) {
		// 	a.addEventListener("click", function (e) {
		// 		e.preventDefault();
		// 		const id = e.target.getAttribute("href"),
		// 			trigger = ScrollTrigger.getById(id);
		// 		aethos.log(id);
		// 		gsap.to(window, {
		// 			duration: 1,
		// 			scrollTo: trigger ? trigger.start : id,
		// 		});
		// 	});
		// });

		// // Add click events to each title to scroll to the corresponding section
		// Array.from(titles).forEach((title, index) => {
		// 	title.addEventListener("click", () => {
		// 		let scrollToPosition = index * window.innerHeight;
		// 		gsap.to(window, {
		// 			scrollTo: { y: scrollToPosition, autoKill: false },
		// 			duration: 1,
		// 		});
		// 	});
		// });
	};

	/* sticky images and quotes in articles */
	aethos.anim.articleSticky = function () {
		let mm = gsap.matchMedia();
		mm.add("(min-width: 768px)", () => {
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
				});
			});
		});
	};

	/* sticky cards in journal */
	aethos.anim.journalSticky = function () {
		let mm = gsap.matchMedia();
		mm.add("(min-width: 768px)", () => {
			// only make sticky on large screens

			// get sticky cards. We have already done the logic in CSS to identify the ones to be restyled as large, so we hook off a CSS variable rather than doing all this logic again
			let cards = document.querySelectorAll(".journal-card");
			let sticky_cards = []; // cards to make sticky
			cards.forEach((card) => {
				if (
					getComputedStyle(card).getPropertyValue("--c--journal-card--type") ==
						"large" &&
					!card.getAttribute("data-scrollTrigger-processed")
				) {
					sticky_cards.push(card);
					card.setAttribute("data-scrollTrigger-processed", "true"); // tracking if we've already processed this card
				} else {
				}
			});

			sticky_cards.forEach((card) => {
				console.log(card);
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
		});
	};

	/* offices map */
	aethos.anim.map = function () {
		const mapData = {};
		mapData.accessToken =
			"pk.eyJ1Ijoic3B1cndpbmctc3AiLCJhIjoiY20wcGFkaDN5MDNkMTJpcXhldHVlZG9mZyJ9.ZcEDjMqfRf412QgW9OiSCw";
		mapData.mapEl = document.querySelector(".map");
		if (!mapData.mapEl) {
			return;
		}
		mapData.offices = [];

		// Function to add marker pins
		function addMarkers() {
			document.querySelectorAll(".office").forEach(function (officeEl) {
				var office = {}; // Using a different variable name here

				// Fetch office data
				const lat = parseFloat(officeEl.getAttribute("data-lat"));
				const long = parseFloat(officeEl.getAttribute("data-long"));

				if (isNaN(lat) || isNaN(long)) {
					console.error(
						`Invalid lat/long for office: ${officeEl.textContent.trim()}`
					);
					return; // Skip this office if lat/long is not valid
				}

				office.lat = lat;
				office.long = long;

				mapData.offices.push(office);

				// Add marker
				var marker = L.marker([office.lat, office.long]).addTo(map);
			});
		}

		// Initialize the map (without setting view yet)
		var map = L.map(mapData.mapEl, {
			attributionControl: false,
			scrollWheelZoom: false,
		});

		// Add Mapbox tile layer to Leaflet
		L.tileLayer(
			"https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
			{
				id: "spurwing-sp/cm0pfyq2r00je01pb5lf74zb3",
				accessToken: mapData.accessToken,
			}
		).addTo(map);

		// Call the function to add pins for offices and set default view
		addMarkers();
		map.setView([mapData.offices[0].lat, mapData.offices[0].long], 12);

		// Add click event for each office in the list
		document.querySelectorAll(".office").forEach(function (officeEl) {
			officeEl.addEventListener("click", function () {
				var lat = parseFloat(officeEl.getAttribute("data-lat"));
				var long = parseFloat(officeEl.getAttribute("data-long"));

				if (isNaN(lat) || isNaN(long)) {
					console.error(
						`Invalid lat/long for office: ${officeEl.textContent.trim()}`
					);
					return;
				}

				// Pan to the selected office with easing
				map.flyTo([lat, long], 12, {
					animate: true,
					duration: 1.5, // seconds
				});
			});
		});
	};

	aethos.functions.updateCopyrightYear = function () {
		const year = new Date().getFullYear().toString();
		document
			.querySelectorAll('[copyright="year"]')
			.forEach((el) => (el.textContent = year));
	};

	/* load in standard hero sections */
	aethos.anim.loadHero = function () {
		/* get all the animated sections */
		let parents = document.querySelectorAll(".anim-load-hero_parent");
		parents.forEach((parent) => {
			let gsap_section = gsap.utils.selector(parent); // gsap selector
			let content = gsap_section(".anim-load-hero_content"); // content element
			let media = gsap_section(".anim-load-hero_media"); // media element
			let content_bg = gsap_section(".anim-load-hero_content-bg"); // bg element behind content - already exists on page

			/* set section to a darker bg color */
			const section_bg_color = getComputedStyle(
				document.documentElement
			).getPropertyValue("--color--slate--medium");

			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: parent,
					start: "top bottom",
					scrub: false,
				},
			});
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
				parent,
				{
					backgroundColor: section_bg_color,
					duration: 0.6,
					ease: "power2.inOut",
				},
				"<"
			);
		});
	};

	/* call functions */
	aethos.functions.nav();
	aethos.anim.splitText();
	aethos.anim.splitTextBasic();
	aethos.anim.fadeUp();
	aethos.anim.smoothScroll();
	aethos.anim.filterDrawerOpenClose();
	aethos.anim.HoverTrigger();
	aethos.anim.arch();
	aethos.anim.NavImage();
	aethos.anim.loadSliders();
	aethos.anim.navReveal();
	aethos.anim.blockCarousel();
	aethos.anim.values();
	aethos.anim.articleSticky();
	aethos.anim.journalSticky();
	aethos.anim.map();
	aethos.anim.loadHero();

	// Call loader function at an appropriate point (e.g., inside main or Swup transition)
	aethos.anim.loader();
}
