// Create a global object to store component data
const aethos = {};
document.addEventListener("DOMContentLoaded", () => {
	// This runs on initial load

	const aethos_VERS = "3eac64ab53a0cf99c6a7c2024f9aa95d93d814db"; //github commit id
	const aethos_scr = "aethos.js"; // script name
	const aethos_dev = `http://localhost:5500/${aethos_scr}`; // local location
	const aethos_live = aethos_VERS
		? `https://cdn.jsdelivr.net/gh/spurwing-main/aethos@${aethos_VERS}/${aethos_scr}`
		: `https://cdn.jsdelivr.net/gh/spurwing-main/aethos/${aethos_scr}`; // live location - omit version if not defined

	function loadCustomScripts() {
		const aethos_js = document.createElement("script");

		/* first check localStorage for an env variable with a fallback value of 'live' */
		const aethos_ENV = localStorage.getItem("aethos_ENV") || "live";
		/* load either dev or live version of script */
		aethos_js.src = aethos_ENV === "dev" ? aethos_dev : aethos_live;

		aethos_js.onload = function () {
			console.log(`aethos.js loaded from ${aethos_ENV} source`);
			// run scripts
			gsap.registerPlugin(SplitText, ScrollSmoother);
			aethos_main();
		};

		document.head.appendChild(aethos_js);

		/* update and show dev mode banner */
		if (aethos_ENV === "dev") {
			const devBanner = document.querySelector(".dev-banner");
			if (devBanner) {
				document.querySelector(".dev-banner").style.display = "block"; // show dev mode banner
				document.querySelector(".dev-banner").textContent = "dev mode";
			}
		}
	}

	// Load custom scripts initially
	loadCustomScripts();
});
