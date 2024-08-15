function main() {
	aethos.anim = {};
	aethos.helpers = {};
	aethos.splides = {};
	aethos.functions = {};

	aethos.anim.smoothScroll = function () {
		gsap.registerPlugin(ScrollSmoother);

		ScrollSmoother.create({
			smooth: 1,
			effects: true,
			content: "#smooth-content",
			wrapper: "#smooth-wrapper",
		});
	};

	aethos.anim.navReveal = function () {
		const showAnim = gsap
			.to(".header-bar", {
				paused: true,
				duration: 0.2,
				yPercent: 100,
			})
			.reverse();

		const pinHead = gsap.timeline({
			scrollTrigger: {
				trigger: ".header-bar",
				start: "bottom top",
				end: "max",
				pin: ".header-bar",
				pinSpacing: false,
				scrub: true,
				onUpdate: (self) => showAnim.reversed(self.direction > 0),
				onLeaveBack: (self) => showAnim.reverse(), // Reverse on scroll back all the way
				markers: false,
			},
		});
	};

	aethos.anim.navGrow = function () {
		return;
		gsap.from(".header-bar_middle", {
			scrollTrigger: {
				trigger: ".header-bar_middle",
				toggleActions: "play complete reverse reset",
			},
			duration: 10,
			delay: 0.2,
			height: "7rem",
		});

		// const showAnim = gsap.from(".header-bar_middle", {
		// 	paused: true,
		// 	duration: 0.2,
		// 	height: "7rem",
		// });
		// // .reverse();

		// const pinHead = gsap.timeline({
		// 	scrollTrigger: {
		// 		trigger: ".header-bar",
		// 		start: "bottom top",
		// 		// end: "max",
		// 		// pin: ".header-bar",
		// 		// pinSpacing: false,
		// 		// scrub: true,
		// 		// onUpdate: (self) => showAnim.reversed(self.direction > 0),
		// 		// onLeaveBack: (self) => showAnim.reverse(), // Reverse on scroll back all the way
		// 		markers: false,
		// 	},
		// });
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
				// end: "top 10%",
				// scrub: 0,
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

	aethos.functions.updateCopyrightYear = function () {
		const year = new Date().getFullYear().toString();
		document
			.querySelectorAll('[copyright="year"]')
			.forEach((el) => (el.textContent = year));
	};

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

	aethos.anim.NavImage = function () {
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
						start: "top 90%",
						// end: "bottom center",
						// scrub: 1,
					},
				});
				tl.to($(this).find("." + maskClass), {
					width: "0%",
					duration: 3,
				});
			});
		}
	};

	aethos.anim.loadSliders = function () {
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
			type: "slide",
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
					splide.on("mounted move", function () {
						// Calculate the width of the bar based on the number of slides
						let slideCount = splide.Components.Controller.getEnd() + 1;
						let bar = splide.root.querySelector(".progress_bar");
						let rate = Math.min(splide.index / slideCount, 1);
						bar.style.width = String(100 / slideCount) + "%";
						bar.style.left = String(100 * rate) + "%";
						aethos.log("slide count: " + slideCount);
						aethos.log("slide rate: " + rate);
						aethos.log("slide index: " + splide.index);
					});
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
					type: "slide",
					autoWidth: true,
					autoplay: false,
					autoScroll: {
						autoStart: false,
					},
					focus: 0,
					trimSpace: false,
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

	aethos.anim.splitText();
	aethos.anim.smoothScroll();
	// aethos.functions.updateCopyrightYear();
	aethos.anim.filterDrawerOpenClose();
	aethos.anim.HoverTrigger();
	aethos.anim.arch();
	aethos.anim.NavImage();
	aethos.anim.loadSliders();
	// aethos.anim.navReveal();
	aethos.anim.navGrow();
}
