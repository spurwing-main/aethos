function main() {
	/* declare function types */
	aethos.anim = {};
	aethos.helpers = {};
	aethos.splides = {};
	aethos.functions = {};

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

	aethos.anim.navReveal = function () {
		const showAnim = gsap
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
				self.direction === -1 ? showAnim.play() : showAnim.reverse();
			},
		});
	};

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
		function initializeSplide_old({
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

		function initializeSplide({
			selector,
			options,
			useExtensions = false,
			useProgressBar = false,
		}) {
			let targets = document.querySelectorAll(selector);
			let splides = [];

			targets.forEach((target) => {
				// New splide instance
				let splide = new Splide(target, options);

				if (useProgressBar) {
					let progressWrapper = target.querySelector(".progress");
					console.log(target);
					let bar = target.querySelector(".progress_bar");

					// Update progress bar position on carousel move
					splide.on("mounted move", function () {
						updateProgressBar();
					});

					// Function to update the progress bar
					function updateProgressBar() {
						let slideCount = splide.Components.Controller.getEnd() + 1;
						let rate = Math.min(splide.index / slideCount, 1);
						bar.style.width = String(100 / slideCount) + "%";
						bar.style.left = String(100 * rate) + "%";
					}

					// Click event to move carousel based on click position on the progress bar
					progressWrapper.addEventListener("click", function (e) {
						let rect = progressWrapper.getBoundingClientRect();
						let clickPos = (e.clientX - rect.left) / rect.width;
						let targetSlide = Math.floor(clickPos * splide.length);
						splide.go(targetSlide);
					});

					// Draggable progress bar
					let isDragging = false;

					progressWrapper.addEventListener("mousedown", function (e) {
						isDragging = true;
					});

					document.addEventListener("mouseup", function () {
						if (isDragging) {
							isDragging = false;
							// Snap to closest slide when dragging ends
							let slideCount = splide.Components.Controller.getEnd() + 1;
							let rate = parseFloat(bar.style.left) / 100;
							let targetSlide = Math.round(rate * slideCount);
							splide.go(targetSlide);
						}
					});

					document.addEventListener("mousemove", function (e) {
						if (isDragging) {
							let rect = progressWrapper.getBoundingClientRect();
							let dragPos = (e.clientX - rect.left) / rect.width;
							dragPos = Math.max(0, Math.min(1, dragPos)); // Ensure it's within [0, 1]
							let slideCount = splide.Components.Controller.getEnd() + 1;
							bar.style.left = String(100 * dragPos) + "%";
						}
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

	/* sticky images in articles */
	aethos.anim.articleSticky = function () {
		let mm = gsap.matchMedia();
		mm.add("(min-width: 768px)", () => {
			// only make sticky on large screens
			let parents = document.querySelectorAll(".article-grid");

			parents.forEach((parent) => {
				let gsap_section = gsap.utils.selector(parent);
				let child = gsap_section(".article-sticky:not(.is-quote)");
				console.log(parent);
				console.log(child);

				ScrollTrigger.create({
					trigger: parent,
					start: "top 32px",
					end: () => `${parent.offsetHeight - child[0].offsetHeight}px 0px`,
					pin: child,
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
	aethos.anim.map();
}
