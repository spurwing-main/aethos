function aethos_main() {
	/**/

	// Create a global object to store component data
	const aethos = {};
	aethos.anim = {};
	aethos.helpers = {};
	aethos.splides = {};

	/* sitewide custom code goes here */
	/**/

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
				},
				useExtensions: false,
				useProgressBar: true,
			},
		];

		/* loop through and initialize each slider */
		sliders.forEach(initializeSplide);
	}

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
