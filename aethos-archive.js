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
