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

eval(document.head.firstChild.innerHTML);

var templates = {};
templates.create = (function () {
	var find=/<!--([\W\w]*?)-->|"|\r?\n/g;
	function replace(match, dynamic) {
		if (dynamic) { return "\" + " + dynamic + " + \""; }
		else {
			switch (match) {
				case "\"": return "\\\"";
				default: return "\\n";
			}
		}
	}

	return function (source) {
		return new Function("return \"" + source.replace(find, replace) + "\";");
	};
})();
templates.render = function (name) {
	templates.current = name;

	if (name in templates) {
		ready();
	}
	else {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				templates[name] = templates.create(xhr.responseText);
				ready();
			}
		};
		xhr.open("GET", name, true);
		xhr.send();
	}
};
templates.need = function (name) {
	
};

function addScript(url) {
	var script = document.createElement("SCRIPT");
	script.src = url;
	script.type = "text/javascript";
	document.head.appendChild(script);
}

document.write(
	'<meta charset="utf-8" />' +
	'<meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
	'<meta name="viewport" content="width=device-width, initial-scale=1" />' +
	'<!--'
);

templates.render(template);

var ready = (function () {
	var count = 0;
	return function () {
		if (++count >= 2) {
			var proxy = $.proxy = document.createElement("DIV");
			proxy.id = "proxy-" + ("" + Math.random()).substring(2);

			var content = document.head.innerHTML.match(/<!--[\W\w]*?-->/)[0];
			proxy.innerHTML = content.substring(4, content.length - 3);

			ready = function () {
				document.body.innerHTML = templates[templates.current]();
			};
			ready();
		}
	}
})();

var $ = function (selector) {
	return ($.proxy || document).querySelectorAll(selector);
};
$.proxy = null;

window.onload = function () {
	ready();
	window.onload = null;

	addScript("listen.js");
	addScript("loaded.js");
};
