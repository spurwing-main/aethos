function showSubnavOnHover() {
	const primaryItems = document.querySelectorAll(
		".dest-nav_item[aethos-nav-children='true']" // get primary items with children
	);

	primaryItems.forEach((primaryItem) => {
		const primaryId = primaryItem.getAttribute("aethos-nav-id");

		// Find the corresponding sub-navigation container
		const subnav = document.querySelector(
			`.dest-nav_bottom .dest-nav_child-list[aethos-nav-id="${primaryId}"]`
		);

		const subnav_wrapper = document.querySelector(".dest-nav_bottom");

		if (subnav) {
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
				if (e.target != subnav) {
					isHovered = false;
					toggleTimeline();
				}
			});

			subnav.addEventListener("mouseenter", () => {
				isHovered = true;
				toggleTimeline();
			});

			subnav.addEventListener("mouseleave", () => {
				isHovered = false;
				toggleTimeline();
			});

			function setupSubnavTimeline() {
				gsap.set(subnav, { overflow: "hidden" });

				var tl = gsap
					.timeline({
						paused: true,
						reversed: true,
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
		}
	});
}
