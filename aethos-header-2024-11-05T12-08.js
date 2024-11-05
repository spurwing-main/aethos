<script>
  // Set up aethos config
  aethos.config = {
    ...aethos.config, // Preserve existing config properties if already defined
    scriptVers: "7f47314a93b1d7155e0bcd2f311dbafdf002d5e9", // GitHub commit id
    scriptName: "aethos.js", // Script name
    get devPath() {
      return `http://localhost:5500/${this.scriptName}`; // Local script path
    },
    get livePath() {
      return `https://cdn.jsdelivr.net/gh/spurwing-main/aethos@${this.scriptVers}/${this.scriptName}`; // Live path
    },
    get ENV() {
      return localStorage.getItem("aethos_ENV") || "live"; // Checks localStorage for aethos_ENV variable (default is 'live')
    },
    debug: true, // Turns on console logging etc
    swup: false, // Turn on page transitions
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

  // Function to refresh sticky elements
  ethos.helpers.refreshSticky = function(bool) {

    // hard refresh - refresh all scroll triggers
    if(bool) {
      ScrollTrigger.refresh(true);
      aethos.log("Hard refresh sticky");
    }
    else {
      aethos.log("Soft refresh sticky");
    }
    // call sticky functions again to pick up new items
    aethos.anim.journalSticky();
  }

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

</script>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    // Hidden form fields
    const userLanguage = navigator.language || navigator.userLanguage;
    const languageFields = document.querySelectorAll('input[name="USERLANGUAGE"]');

    languageFields.forEach(field => {
      field.value = userLanguage.substring(0, 2); // Optionally, only use the language code (e.g., 'en')
    });

    // Clear select dropdown when clicking 'All' or similar
    function clearSelect(identifier, value="all") {
      const selectElement = document.querySelector(`select[fs-cmsfilter-field='${identifier}']`);
      const clearElement = document.querySelector(`[fs-cmsfilter-clear='${identifier}']`);

      if (selectElement && clearElement) {
        // Check the initial value
        if (selectElement.value.toLowerCase() === value.toLowerCase()) {
          clearElement.click();
          selectElement.value = value;
        }

        // Add event listener to handle changes
        selectElement.addEventListener("change", (event) => {
          if (event.target.value.toLowerCase() === value.toLowerCase()) {
            clearElement.click();
            selectElement.value = value;
          }
        });
      }
    }



    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
      "cmsfilter",
      (filterInstances) => {
        console.log("cmsfilter Successfully loaded!");

        // The callback passes a `filterInstances` array with all the `CMSFilters` instances on the page.
        const [filterInstance] = filterInstances;
        if(filterInstances) {console.log("test 1")}
        // The `renderitems` event runs whenever the list renders items after filtering.
        filterInstance.listInstance.on("renderitems", (renderedItems) => {
          console.log(renderedItems);
          refreshSticky(true); // hard refresh

        });

        clearSelect("destination", "all");
      },
    ]);

    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
      'cmsload',
      (listInstances) => {
        console.log('cmsload Successfully loaded!');

        // The callback passes a `listInstances` array with all the `CMSList` instances on the page.
        const [listInstance] = listInstances;
        if(listInstances) {console.log("test 2")}

        // The `renderitems` event runs whenever the list renders items after switching pages.
        listInstance.on('renderitems', (renderedItems) => {
          refreshSticky(); // soft refresh - only process new items
        });
      },
    ]);

    /* dates */
    // "suffixMe" function definition
    function suffixMe(num) {
      // remainder operations dealing with edge case
      const j = num % 10,
            k = num % 100;
      // return respective suffix accordingly
      if (j == 1 && k != 11) {
        return `${num}st`;
      } else if (j == 2 && k != 12) {
        return `${num}nd`;
      } else if (j == 3 && k != 13) {
        return `${num}rd`;
      } else {
        return `${num}th`;
      }
    }

    // create array of numbers
    const numbers = Array.from(document.querySelectorAll("[data-date-suffix='true']"));
    // apply function definition for each number
    numbers.forEach((number) => {
      const suffix = suffixMe(Number(number.textContent));
      // override original number with its newly return suffixed number
      number.textContent = suffix;
    });

  });

  /* patch for nav to allow back button to close Destinations dd correctly */
  /* Based on https://www.sygnal.com/lessons/close-dropdown-menu-on-anchor-link-click */
  $(".nav-dests_back").click(function() {
    aethos.log("dest back btn click")
    $(this).closest(".nav-link_dd-content").removeClass("w--open");
    $(this).closest(".nav-link_dd .w-dropdown-toggle").removeClass("w--open");
  });

  /* patch for date input fields to show date when one is selected instead of placeholder */
  $("input[type='date']").on("input",function(){
    if($(this).val().length>0){
      $(this).removeClass("is-date-placeholder");
    }
    else{
      $(this).addClass("is-date-placeholder");
    }
  });
</script>


<script>
  document.addEventListener('DOMContentLoaded', function () {
    // Function to apply theme based on destination slug in URL
    function applyThemeFromURL() {
      // 1. Get the destination name from the URL
      const urlParts = window.location.pathname.split('/');
      const destinationName = urlParts[urlParts.indexOf('destinations') + 1]; // Assuming the URL has /destinations/<name>/

      if (!destinationName) {
        console.error('Destination name not found in URL.');
        return;
      }

      // 2. Get the hidden .dest-data_item element that has the matching data-dest-slug attribute
      const destinationElement = document.querySelector(`.dest-data_item[data-dest-slug="${destinationName}"]`);

      if (!destinationElement) {
        console.error('Matching destination element not found.');
        return;
      }

      // 3. Get the theme from the data-theme attribute of the destination element
      const theme = destinationElement.getAttribute('data-theme');

      if (!theme) {
        console.error('Theme not found on the destination element.');
        return;
      }

      // 4. Get the .page-wrap element and update its data-theme attribute
      const pageWrap = document.querySelector('.page-wrap');

      if (!pageWrap) {
        console.error('.page-wrap element not found.');
        return;
      }

      pageWrap.setAttribute('data-theme', theme);
    }

    // Call the function to apply the theme
    applyThemeFromURL();
  });

</script>

<script>
/* update destination subscribe form name */
document.addEventListener("DOMContentLoaded", function() {
  // Find all forms with a data-destination attribute
  const forms = document.querySelectorAll('form[data-destination]');

  // Helper function to capitalize the first letter of a word
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  forms.forEach(function(form) {
    let destinationName = form.getAttribute('data-destination');

    // Capitalize the destination name
    destinationName = capitalizeFirstLetter(destinationName);

    // Update data-name attribute in the required format
    form.setAttribute('data-name', `Destination Subscribe - ${destinationName}`);
  });
});

</script>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    $(".u-empty-section").has(".w-dyn-empty").css("display", "none");
  });
</script>