// loosely based on: https://gist.github.com/Contra/2709462
if (!window.XMLHttpRequest) { // shim XMLHttpRequest
	window.XMLHttpRequest = (function () {
		var ax = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"];
		for (var i = 0, l = ax.length; i < l; i++) {
			try {
				new ActiveXObject(ax[i]);
				return new Function("return new ActiveXObject(" + ax[i] + ")");
			}
			catch (error) { }
		}
	})();
}

var $ = function (selector) {
	return ($.proxy || document).querySelectorAll(selector);
};
$.proxy = null;

var render = (function () {
	var templates = {};

	var currentTemplate = null;

	var rendered = false, currentCallback;
	function checkReady() {
		if ((currentTemplate in templates) && ($.proxy !== null)) {
			document.body.innerHTML = templates[currentTemplate]();
			rendered = true;
			$.proxy = null;
			proxy.innerHTML = "";
			if (currentCallback) { currentCallback(); }
		}
	}

	var proxy = document.createElement("PROXY");
	function render(url, callback, loaded) {
		currentCallback = callback;
		rendered = false;

		if (!loaded) {
			var page = new XMLHttpRequest();
			page.onreadystatechange = function () {
				if (page.readyState === 4) {
					var HTML = page.responseText;
					var findLanding = /<script src="landing\.js" type="text\/javascript">([\W\w]*?)<\/script>/;


					var found = findLanding.exec(HTML);
					if (!found) { throw "Invalid content file"; }
					eval(found[1]);

					proxy.innerHTML = page.responseText.substring(found.index + found[0].length);
					$.proxy = proxy;

					getTemplate(template);

					checkReady();
				}
			};
			page.open("GET", url, true);
			page.send();
		}
		else {
			var content = document.head.innerHTML.match(/<!--[\W\w]*?-->/)[0];
			proxy.innerHTML = content.substring(4, content.length - 3);
			$.proxy = proxy;
			checkReady();

			eval(document.head.firstChild.innerHTML);
			getTemplate(template);
		}
	}
	
	var findDyn = /<!--([\W\w]*?)-->|"|\r?\n/g;
	function replaceDyn(match, dynamic) {
		if (dynamic) { return "\" + " + dynamic + " + \""; }
		else {
			switch (match) {
				case "\"": return "\\\"";
				default: return "\\n";
			}
		}
	}

	function getTemplate(template) {
		if (rendered) { return; }

		currentTemplate = template;

		if (template in templates) {
			checkReady();
		}
		else {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					templates[template] = new Function("return \"" + xhr.responseText.replace(findDyn, replaceDyn) + "\";");
					checkReady();
				}
			};
			xhr.open("GET", template, true);
			xhr.send();
		}
	}

	return render;
})();

var addScript = (function () {
	var codes = [];
	var added = 0, adding = 0;
	function loaded(index, code) {
		if (index != added) {
			codes[index - added - 1] = code;
		}
		else {
			added++;

			while (codes[0]) {
				code += ";\n\n" + codes.shift();
				added++;
			}

			var script = document.head.appendChild(document.createElement("SCRIPT"));
			script.type = "text/javascript";
			script.innerHTML = code;
		}
	}

	return function addScript(url) {
		var index = adding++;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (url === "listen.js") {
					setTimeout(function () { loaded(index, xhr.responseText); }, 500);
				}
				else {
					loaded(index, xhr.responseText);
				}
			}
		};
		xhr.open("GET", url, true);
		xhr.send();
	};
})();

document.write(
	'<meta charset="utf-8" />' +
	'<meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
	'<meta name="viewport" content="width=device-width, initial-scale=1" />' +
	'<!--'
);

window.onload = function () {
	window.onload = null;

	addScript("listen.js");
	addScript("loaded.js");

	render(window.location.href, null, true);
};
