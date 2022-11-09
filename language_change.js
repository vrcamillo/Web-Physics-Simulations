function set_language(language) {
	let tags = document.querySelectorAll("[lang]");
	for (let i = 0; i < tags.length; i += 1) {
		if (tags[i].lang != language) tags[i].style.display = 'none';
	}
}