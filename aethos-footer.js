// Set up global aethos object
const aethos = {
	config: {
		scriptVers: "3eac64ab53a0cf99c6a7c2024f9aa95d93d814db", // github commit id. Updated manually on each release
		scriptName: "aethos.js", // script name
		get devPath() {
			return `http://localhost:5500/${this.scriptName}`; // local script path
		},
		get livePath() {
			return `https://cdn.jsdelivr.net/gh/spurwing-main/aethos@${this.scriptVers}/${this.scriptName}`; // live path
		},
		get ENV() {
			return localStorage.getItem("aethos_ENV") || "live"; // checks localStorage for aethos_ENV variable (default is 'live')
		},
		debug: true, // turns on console logging etc
		swup: false, // turn on page transitions
	},
};

/* helper function for logging */
aethos.log = function (str) {
	// if debug turned off, exit
	if (!aethos.config.debug) return;

	// if a message exists, log it, otherwise just log the global element
	if (str)
		console.log("%c[aethos] " + str, "color: #648b8b"); // style console log
	else console.log(aethos);
};

// array of third party scripts to load
aethos.scriptsExt = [
	"https://cdn.jsdelivr.net/npm/@finsweet/attributes-cmsfilter@1/cmsfilter.js",
	//"https://cdn.jsdelivr.net/npm/@finsweet/attributes-scrolldisable@1/scrolldisable.js"
];

document.addEventListener("DOMContentLoaded", () => {
	// This runs on initial load only

	// Load custom scripts at start of session
	loadCustomScripts();
	loadExtScripts();

	// Initialize Swup
	if (aethos.config.swup) {
		const swup_options = {
			containers: ["main"],
			plugins: [
				new SwupScriptsPlugin({
					optin: true, // we're using the scripts plugin ONLY for third party scripts in embed elements
				}),
			],
		};
		aethos.swup = new Swup(swup_options);
	}

	// Function to load all custom scripts
	function loadCustomScripts() {
		aethos.config.scriptEl = document.createElement("script");
		// load either dev or live version, depending on ENV
		aethos.config.scriptEl.src =
			aethos.config.ENV === "dev"
				? aethos.config.devPath
				: aethos.config.livePath;
		aethos.config.scriptEl.onload = function () {
			aethos.log(`Site code loaded from ${aethos.config.ENV} source`);
			main();
		};
		document.head.appendChild(aethos.config.scriptEl);

		/* update and show dev mode banner */
		if (aethos.config.ENV === "dev") {
			const devBanner = document.querySelector(".dev-banner");
			if (devBanner) {
				devBanner.style.display = "block"; // show dev mode banner
				devBanner.textContent = "dev mode";
			}
		}
	}

	// Function to load external scripts
	function loadExtScripts() {
		for (var i = 0; i < aethos.scriptsExt.length; i++) {
			var scriptEl = document.createElement("script");
			scriptEl.src = aethos.scriptsExt[i];
			document.head.appendChild(scriptEl);
			scriptEl.onload = function () {
				aethos.log("External script loaded: " + scriptEl.src);
			};
		}
	}

	// function to restart videos on page
	function loadVideoElements() {
		const videos = document.querySelectorAll("video");
		videos.forEach((video) => {
			video.load();
		});
	}

	// Function to restart Webflow
	function restartWebflow() {
		aethos.log("restart WF");
		window.Webflow.destroy();
		window.Webflow.ready();
		window.Webflow.require("ix2")?.init();
		document.dispatchEvent(new Event("readystatechange"));
	}

	// Handle page transitions if enabled
	if (aethos.config.swup) {
		// Event before page transition starts
		aethos.swup.hooks.on("visit:start", async (visit) => {
			aethos.log("Swup visit:start");

			// reset scroll
			aethos.scrollDisabler.kill();
		});

		// Event after new content has been replaced
		aethos.swup.hooks.on("content:replace", (visit) => {
			aethos.log("Swup content:replace");

			// get id of new page and add to existing <html>. This is need to restart WF anims properly
			const newWfPageId =
				visit.to.document?.documentElement.getAttribute("data-wf-page");
			if (newWfPageId)
				document.documentElement.setAttribute("data-wf-page", newWfPageId);

			// restart WF
			restartWebflow();
		});

		// Event after new page loaded
		aethos.swup.hooks.on("page:view", () => {
			aethos.log("Swup page:view");

			/* load scripts */
			loadCustomScripts();
			loadExtScripts();
			loadVideoElements();
			// aethos.startLenis(); // restart Lenis
			// aethos.scrollDisabler.init(); // reinit scroll disabler

			aethos.log(
				`Site code reloaded from ${aethos.config.ENV} source by swup.js`
			);
		});
	}
});
