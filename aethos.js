/* sitewide custom code goes here */
function updateCopyrightYear() {
	const year = new Date().getFullYear().toString();
	document
		.querySelectorAll('[copyright="year"]')
		.forEach((el) => (el.textContent = year));
}

function main() {
	/* filter draw open/close */
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

	/* nav image change on hover */
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

	window.fsAttributes = window.fsAttributes || [];
	window.fsAttributes.push([
		"cmsfilter",
		(filterInstances) => {
			console.log("cmsfilter Successfully loaded!");

			// The callback passes a `filterInstances` array with all the `CMSFilters` instances on the page.
			const [filterInstance] = filterInstances;

			// The `renderitems` event runs whenever the list renders items after filtering.
			filterInstance.listInstance.on("renderitems", (renderedItems) => {
				console.log(renderedItems);
			});
			// setTimeout(addFilterClear, 3000);
		},
	]);

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
