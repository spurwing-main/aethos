/* sitewide custom code goes here */
function updateCopyrightYear() {
	const year = new Date().getFullYear().toString();
	document
		.querySelectorAll('[copyright="year"]')
		.forEach((el) => (el.textContent = year));
}
