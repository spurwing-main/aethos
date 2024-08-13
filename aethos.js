function aethos_main() {
	/**/

	aethos.anim = {};
	aethos.helpers = {};
	aethos.splides = {};

	/* sitewide custom code goes here */
	/**/

	aethos.anim.smoothScroll = function () {
		gsap.registerPlugin(ScrollSmoother);

		ScrollSmoother.create({
			smooth: 1,
			effects: true,
			content: "#smooth-content",
			wrapper: "#smooth-wrapper",
		});
	};

	aethos.anim.arch = function () {
		let trigger =
			document.querySelector(
				".c-intro-home"
			); /* TO DO - SUPPORT MULTIPLE INSTANCES */
		let selector = gsap.utils.selector(trigger);
		let img_wrap = selector(".intro-home_img-wrap");
		let arch_path = document.querySelector("#shape-arch path");
		let arch_path_bg = document.querySelector("#shape-arch-bg path");

		let tl_arch = gsap.timeline({
			scrollTrigger: {
				trigger: trigger,
				start: "top 30%",
				end: "top 10%",
				scrub: 0,
			},
		});

		tl_arch.from(img_wrap, {
			y: "10%",
			ease: "linear",
		});

		// move clip path up - it is in turn clipped by parent wrapper so arch is shorter at start
		tl_arch.from(
			arch_path,
			{
				attr: {
					d: "M0.001,0.559 c0,-0.198,0.219,-0.359,0.489,-0.359 h0.023 c0.27,0,0.489,0.161,0.489,0.359 v0.441 H0.001 v-0.441",
				},
				// y: 0.5,
				ease: "linear",
			},
			"-+25%" //start this anim 75% of way through previous step
		);
		tl_arch.from(
			arch_path_bg,
			{
				attr: {
					d: "M0.001,0.559 c0,-0.198,0.219,-0.359,0.489,-0.359 h0.023 c0.27,0,0.489,0.161,0.489,0.359 v0.441 H0.001 v-0.441",
				},
				// y: 0.5,
				ease: "linear",
			},
			"-+25%" //start this anim 75% of way through previous step
		);

		tl_arch.from(
			arch_path,
			{
				scale: 0.86,
				transformOrigin: "bottom left",
				ease: "linear",
			},
			"-+25%" //start this anim 75% of way through previous step
		);
	};

	aethos.anim.headerLogo = function () {
		/* on page load, if we are on homepage
		header inner starts out hidden
		big logo starts out visible
		on scroll (100vh?), big logo reduces in size until its size of small logo
		then big logo disappears and header inner appears
		anim doesn't repeat on scroll back
		it does scrub before finishing though

		- home hero needs to be 200vh tall [x]
		- add attr to page so we know we are on home [x]
		- add 100dvh trigger element [x]


		.page-wrap[data-page="home"]
		.hero-home-trigger

		*/
		// gsap.set(".header-bar_big-logo-wrap", { display: "block" });
		// gsap.to(".header-bar_big-logo-wrap", {
		// 	scrollTrigger: {
		// 		trigger: ".hero-home-trigger",
		// 		scrub: true,
		// 		start: "top top",
		// 		end: "bottom top",
		// 	},
		// 	scale: 0,

		// 	transformOrigin: "center top",
		// 	ease: "none",
		// });

		/* if on homepage */
		if (!document.querySelector('.page-wrap[data-page="home"]')) {
			return;
		}

		/* set start size of logo */
		const window_w = window.innerWidth;
		const header_logo_wrap = document.querySelector(".header-bar_logo-wrap");
		const scaled_size = window_w - 64;
		const orig_size = header_logo_wrap.offsetWidth;
		const scale = scaled_size / orig_size;

		gsap.set([".header-bar_left", ".header-bar_right"], {
			opacity: 0,
		});

		gsap.from(header_logo_wrap, {
			scrollTrigger: {
				trigger: ".hero-home-trigger",
				scrub: true,
				start: "top top",
				end: "bottom top",
				once: true, //ScrollTrigger will kill() itself as soon as the end position is reached once
				onLeave: () => {
					gsap.to([".header-bar_left", ".header-bar_right"], {
						opacity: 1,
					});
				},
			},
			scale: scale,

			transformOrigin: "center top",
			ease: "none",
		});
	};

	(function updateCopyrightYear() {
		const year = new Date().getFullYear().toString();
		document
			.querySelectorAll('[copyright="year"]')
			.forEach((el) => (el.textContent = year));
	})();

	/* filter draw open/close */
	(function filterDrawerOpenClose() {
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
	})();

	/* add an active class on hover to any items with .hover-trigger set */
	/* we can then use CSS to target other items */
	(function HoverTrigger() {
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
	})();

	/* nav image change on hover */

	(function NavImage() {
		const nav_link_triggers = document.querySelectorAll(
			".nav-link[data-link-id]"
		);
		const nav_link_imgs = document.querySelectorAll(
			".nav_img-wrap[data-link-id]"
		);

		nav_link_triggers.forEach((link) => {
			link.addEventListener("mouseover", () => {
				const linkId = link.getAttribute("data-link-id");

				nav_link_imgs.forEach((img) => {
					if (img.getAttribute("data-link-id") === linkId) {
						img.style.opacity = 1;
					} else {
						img.style.opacity = 0;
					}
				});
			});

			link.addEventListener("mouseout", () => {
				const linkId = link.getAttribute("data-link-id");

				nav_link_imgs.forEach((img) => {
					if (img.getAttribute("data-link-id") === linkId) {
						img.style.opacity = 0;
					}
				});
			});
		});
	})();

	/* progress bar */
	aethos.helpers.splide_progress = function (splide_instance) {
		let bar = splide_instance.root.querySelector(".carousel_progress-bar");
		// Updates the bar width whenever the carousel loads and updates:
		splide_instance.on("ready active", function () {
			let end = splide_instance.Components.Controller.getEnd() + 1;
			let rate = Math.min((splide_instance.index + 1) / end, 1);
			bar.style.width = String(100 * rate) + "%";
		});
	};

	aethos.anim.splitText = function () {
		// return;
		let typeSplit;
		let linesClass = "anim-split_line"; // class to add to lines
		let maskClass = "anim-split_line-mask"; // class to add to masks
		// Split the text up
		function runSplit() {
			typeSplit = new SplitText(".anim-split", {
				types: "lines, words",
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

		gsap.registerPlugin(ScrollTrigger);

		function createAnimation() {
			$("." + linesClass).each(function (index) {
				let tl = gsap.timeline({
					scrollTrigger: {
						trigger: $(this),
						// trigger element - viewport
						start: "top center",
						end: "bottom center",
						scrub: 1,
					},
				});
				tl.to($(this).find("." + maskClass), {
					width: "0%",
					duration: 1,
				});
			});
		}
	};

	aethos.anim.splitText();
	// aethos.anim.headerLogo();
	aethos.anim.smoothScroll();

	aethos.anim.arch();

	loadSliders();

	function loadSliders() {
		/* splide defaults */
		Splide.defaults = {
			perMove: 1,
			gap: "0rem",
			arrows: false,
			pagination: false,
			focus: 0,
			speed: 600,
			dragAngleThreshold: 60,
			autoWidth: false,
			rewind: false,
			rewindSpeed: 400,
			waitForTransition: false,
			updateOnMove: true,
			trimSpace: "move",
			type: "loop",
			drag: true,
			snap: true,
			autoWidth: false,
			autoplay: false,
		};

		/* get and launch all chosen splide instances */
		function initializeSplide({
			selector,
			options,
			useExtensions = false,
			useProgressBar = false,
		}) {
			let targets = document.querySelectorAll(selector);
			let splides = [];

			targets.forEach((target) => {
				/* new splide instance */
				let splide = new Splide(target, options);

				// Apply progress bar if enabled
				if (useProgressBar) {
					aethos.helpers.splide_progress(splide);
				}

				// Mount splide instance with or without extensions
				if (useExtensions) {
					splide.mount(window.splide.Extensions);
				} else {
					splide.mount();
				}

				splides.push(splide);
			});

			/* return all created splide instances */
			return splides;
		}

		/* declare slider selectors, options and any callback functions */
		const sliders = [
			{
				selector: ".carousel",
				options: {
					type: "loop",
					perPage: 3,
					autoplay: false,
					autoScroll: {
						autoStart: false,
					},
					breakpoints: {
						767: { perPage: 1 },
						991: { perPage: 2 },
					},
				},
				useExtensions: false,
				useProgressBar: true,
			},
		];

		/* loop through and initialize each slider */
		sliders.forEach(initializeSplide);
	}
	/**/
	// window.fsAttributes = window.fsAttributes || [];
	// window.fsAttributes.push([
	// 	"cmsfilter",
	// 	(filterInstances) => {
	// 		console.log("cmsfilter Successfully loaded!");

	// 		// The callback passes a `filterInstances` array with all the `CMSFilters` instances on the page.
	// 		const [filterInstance] = filterInstances;

	// 		// The `renderitems` event runs whenever the list renders items after filtering.
	// 		filterInstance.listInstance.on("renderitems", (renderedItems) => {
	// 			console.log(renderedItems);
	// 		});
	// 		// setTimeout(addFilterClear, 3000);
	// 	},
	// ]);

	// function addFilterClear() {
	// 	console.log("fire");
	// 	const filterButtons = document.querySelectorAll(
	// 		'[fs-cmsfilter-field="location"]'
	// 	);
	// 	const resetLink = document.querySelector('[fs-cmsfilter-element="clear"]');
	// 	filterButtons.forEach((filterButton) => {
	// 		filterButton.addEventListener("click", () => {
	// 			resetLink.click();
	// 		});
	// 	});
	// }
}
