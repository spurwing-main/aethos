function initVimeoVideos(
	videoSelector = ".video",
	vimeoSelector = ".vimeo",
	idAttr = "data-aethos-vimeo-id"
) {
	const videoElements = document.querySelectorAll(videoSelector);
	videoElements.forEach((video) => {
		const vimeoContainer = video.querySelector(vimeoSelector);
		const vimeoId = video.getAttribute(idAttr);
		const player = initVimeo(vimeoContainer, vimeoId);
		toggleVideoElements(video);
	});

	function initVimeo(vimeoContainer, vimeoId) {
		const options = {
			id: vimeoId,
			byline: false,
			title: false,
			muted: true,
			vimeo_logo: false,
			autoplay: true /* play Vimeo once custom play button clicked */,
			speed: false /* disable speed controls to avoid API issues */,
		};

		const player = new Vimeo.Player(vimeoContainer, options);

		player.loadVideo(vimeoId).then(function (id) {
			console.log(`video ${id} has loaded 🥳`);
		});

		player.on("play", (event) => {
			console.log("video is playing ❤️");
		});

		return player;
	}

	function toggleVideoElements(videoElement) {
		const thumbnail = videoElement.querySelector(".video-thumbnail");
		const vimeoElement = videoElement.querySelector(".vimeo");

		// // Hide elements if they exist
		// if (thumbnail) {
		// 	thumbnail.style.display = "none";
		// }

		// // Show Vimeo player if it exists
		// if (vimeoElement) {
		// 	vimeoElement.style.display = "block";
		// } else {
		// 	console.error("Vimeo player element not found.");
		// }
	}
}
