var listen = (function () {
	var listen;

	if (window.addEventListener) {
		listen = function (element, event, listener, capture) {
			return element.addEventListener(event, listener, capture);
		};
		listen.remove = function (element, event, listener, capture) {
			return element.removeEventListener(event, listener, capture);
		};
	}
	else if (window.attachEvent) {
		listen = function (element, event, listener, capture) {
			return element.attachEvent("on" + event, listener, capture);
		};
		listen.remove = function (element, event, listener, capture) {
			return element.detachEvent(event, listener, capture);
		};
	}
	else {
		console.warn("Browser does not support events.");
		listen = function () { };
		listen.remove = listen;
	}

	return listen;
})();

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

var Ajax = (function () {
	function Ajax(url, callback, context) {
		return full(url, null, null, null, null, null, null, null, null, null, callback, context);
	}
	Ajax.get = function (url, callback, context) {
		return full(url, "GET", null, null, null, null, null, null, null, null,callback, context);
	};
	Ajax.post = function (url, data, callback, context) {
		return full(url, "POST", null, null, data, null, null, null, null, null,callback, context);
	};
	Ajax.full = full;

	function full(url, method, mime, type, data, headers, username, password, withCred, timeout, callback, context) {
		var xhr = new XMLHttpRequest();

		if (mime) { xhr.overrideMimeType(mime); }

		if (headers) {
			for (var name in headers) {
				if (headers.hasOwnProperty(name)) {
					xhr.setRequestHeader(name, headers[name]);
				}
			}
		}

		if (callback) {
			if (type) { xhr.responseType = type || ""; }

			xhr.onreadystatechange = function () {
				callback.call(context, "readyStateChange", xhr);

				if (xhr.readyState === 4) {
					callback.call(context, "done", xhr);
				}
			};

			if (timeout != null) { xhr.timeout = timeout; }
			xhr.ontimeout = function () {
				callback.call(context, "timeout", xhr);
			};

			if (withCred != null) {
				xhr.withCredentials = withCred;
			}

			if (xhr.upload) {
				xhr.upload.onloadstart =
				xhr.upload.onprogress =
				xhr.upload.onabort =
				xhr.upload.onerror =
				xhr.upload.onload =
				xhr.upload.onloadend = function (e) {
					callback.call(context, "upload-" + e.type, e, xhr);
				};
			}
		}

		xhr.open(method || "GET", url, !!callback, username, password);

		xhr.send(data);

		return xhr;
	}

	return Ajax;
})();

document.write(
	'<meta charset="utf-8" />' +
	'<meta http-equiv="X-UA-Compatible" content="IE=edge" />' +
	'<meta name="viewport" content="width=device-width, initial-scale=1" />'+
	'<!--'
);

eval(document.head.firstChild.innerHTML);

var templates = {};

var createTemplate = (function () {
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

	return function createTemplate(source) {
		return new Function("return \"" + source.replace(find, replace) + "\";");
	};
})();

var xhr = Ajax(template, function (event, xhr) {
	if (event === "done") {
		templates[template] = createTemplate(xhr.responseText);
		ready();
	}
});

var ready = (function () {
	var count = 0;
	return function ready() {
		if (++count >= 2) {
			var proxy = $.proxy = document.createElement("DIV");
			proxy.id = "proxy-" + ("" + Math.random()).substring(2);

			var content = document.head.innerHTML.match(/<!--[\W\w]*?-->/)[0];
			proxy.innerHTML = content.substring(4, content.length - 3);

			document.body.innerHTML = templates[template]();
		}
		console.log(count);
	}
})();

var $ = function (selector) {
	return ($.proxy || document).querySelectorAll(selector);
};
$.proxy = null;

listen(window, "load", function () {
	ready();
});