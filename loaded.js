var gotoUrl = (function () {
	var gotoUrl;

	function getPage(url) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {

			}
		};
	}

	if (history.pushState && ("onpopstate" in window)) {
		gotoUrl = function (url) {
			if (gotoUrl.loading) {
				console.log("Aborting loading " + url + "; already loading " + window.location.href);
				return;
			}

			if (url !== window.location.href) {
				history.pushState(null, "Dynamic Site", url);
			}

			gotoUrl.loading = true;
			render(url, function () {
				gotoUrl.loading = false;
			});
		};

		window.onpopstate = function (e) {
			console.log(e);
			gotoUrl(window.location.href);
		};
	}
	else {
		gotoUrl = function (url) {
			window.location.href = url;
		};
	}

	gotoUrl.loading = false;
	return gotoUrl;
})();


listen(window, "click", function (e) {
	if (e.target.tagName === "A") {
		console.log("handling " + e.target.href);
		e.preventDefault();
		gotoUrl(e.target.href);
	}
});
