
var Ajax = (function () {
	function Ajax(url, callback, context) {
		return full(url, null, null, null, null, null, null, null, null, null, callback, context);
	}
	Ajax.get = function (url, callback, context) {
		return full(url, "GET", null, null, null, null, null, null, null, null, callback, context);
	};
	Ajax.post = function (url, data, callback, context) {
		return full(url, "POST", null, null, data, null, null, null, null, null, callback, context);
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
