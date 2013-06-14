
var
	interval = 1000,
	captureInterval = 0,
	port = chrome.extension.connect({name: "content"}),
	capturePage = function capturePage() {
		var
			frame = document.querySelector('iframe[src^=javascript]'),
			doc = frame && frame.contentDocument,
			html = doc && doc.body.innerHTML;

		if (html) {
			port.postMessage({
				action: 'append',
				message: html
			});
		} else {
			port.postMessage({
				action: 'error',
				message: frame ? (html ? 'yay!' : 'couldnt get document or doc empty') : 'didnt find frame'
			});
		}
	},
	scrollToStart = function () {
		var evt,
			i = 10;
		for (; i > 0; i -= 1) {
			evt = document.createEvent("WheelEvent");
			Array.prototype.forEach.call(document.querySelectorAll('.gb-text-reader, gb-reader-container-reader'), function (el) {
				evt.initWebKitWheelEvent(0, -999, window, 100, 100, 100, 100, false, false, false, false);
				el.dispatchEvent(evt);
			});
		}
	},
	triggerMouseEvent = function (element, type) {
		console.log('triggering ' + type + ' on ' + element);
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		element.dispatchEvent(evt);
	},
	actions = {
		restart: function restart() {
			clearInterval(captureInterval);
			// NOTE: .gb-backbutton doesnt always exist, points at different pages... :/
			// scrolling seems to work, tho :)
			scrollToStart();

			captureInterval = setInterval(function () {
				var arrowRight;

				capturePage();

				arrowRight = document.querySelector('.gb-pagination-controls-right-arrow');
				if (arrowRight && (arrowRight.getAttribute('style').indexOf('display: none') === -1)) {
					triggerMouseEvent(arrowRight, 'mousedown');
				} else {
					port.postMessage({
						action: 'status',
						message: 'finished'
					});
					clearInterval(captureInterval);
				}
			}, interval);
		}
	},
	listener = function (msg) {
		console.log('got message');
		var action = msg.action;
		if (action && actions[action]) {
			actions[action](msg.message);
		} else {
			console.log('unknown action ' + action);
		}
	};

port.onMessage.addListener(listener);
