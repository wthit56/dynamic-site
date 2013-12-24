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
