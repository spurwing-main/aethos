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
	return;
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
