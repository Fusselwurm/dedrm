
var
	interval = 1000,
	captureInterval = 0,
	port = chrome.extension.connect({name: "content"}),
	prevHtml = '',
	htmlMassage = (function () {
		var steps = [
			function removeClasses(s) {
				return s.replace(/class="[^"]+"/g, '');
			},
			function removeStyles(s) {
				return s.replace(/style="[^"]+"/g, '');
			}
		]
		return function (html) {
			return steps.reduce(function (html, step) {
				return step(html);
			}, html);
		};
	}()),
	capturePage = function capturePage() {
		var
			frames = document.querySelectorAll('iframe[src^=javascript]'),
			frame = frames[frames.length - 1],
			doc = frame && frame.contentDocument,
			html = doc && doc.body.innerHTML;

		console.log(frame ? (html ? 'yay!' : 'couldnt get document or doc empty') : 'didnt find frame');


		return doc.body.textContent.trim().length > 5 ? html.trim() : '';
	},
	triggerMouseEvent = function (element, type) {
		console.log('triggering ' + type + ' on ' + element);
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		element.dispatchEvent(evt);
	},
	nav = {
		numPages: function () {
			return parseInt(document.querySelector('.gb-pagecontrol').textContent.match(/[0-9]+/)[0], 10);
		},
		currentPage: function () {
			return parseInt(document.querySelector('.gb-pagecontrol-input').value, 10);
		},
		goToPage: function (fn) {
			// FIXME


			// note: exact page navigation not possible with this method, as there are fewer slider segments (children) than pages
			// also... for some reason, it doesnt work :~p whatever, ill just navigate by hand...
			try {
				triggerMouseEvent(document.querySelector('.gb-slider-content div:nth-child(1)'), 'click');
			} catch (e) {
				console.error(e);
			}

			// direct input: im too lazy to find out which events need to be triggered here.
			//var input = document.querySelector('input.gb-pagecontrol-input');
			//input.value = i;
			//input.parent.submit();

			// this approach works, but takes some time to execute
			// evt = document.createEvent("WheelEvent");
			// Array.prototype.forEach.call(document.querySelectorAll('.gb-text-reader, gb-reader-container-reader'), function (el) {
			// evt.initWebKitWheelEvent(0, -999, window, 100, 100, 100, 100, false, false, false, false);
			// el.dispatchEvent(evt);
			// });

			if (fn) {
				setTimeout(fn, 1000);
			}
		},
		isLastPage: function () {
			return this.currentPage() === this.numPages();

		}
	},
	htmlIsOk = function (html) {
		var res = false;

		console.debug('html starts with: "' + html.substr(0, 50) + '"');

		if (html && html !==prevHtml) {
			res = true;
		}

		prevHtml = html;
		return res;
	},
	actions = {
		restart: function restart() {
			clearInterval(captureInterval);
			nav.goToPage(function () {
				port.postMessage({
					action: 'status',
					message: 'running'
				});

				captureInterval = setInterval(function () {
					var arrowRight, html;

					port.postMessage({
						action: 'currentPage',
						message: nav.currentPage()
					})
					html = htmlMassage(capturePage());
					if (htmlIsOk(html)) {
						port.postMessage({
							action: 'append',
							message: html
						});
					} else {
						port.postMessage({
							action: 'status',
							message: 'error'
						});
						clearInterval(captureInterval);
					}

					arrowRight = document.querySelector('.gb-pagination-controls-right-arrow');
					if (nav.isLastPage()) {
						clearInterval(captureInterval);
						port.postMessage({
							action: 'status',
							message: 'finished'
						});
					} else {
						triggerMouseEvent(arrowRight, 'mousedown');
					}
				}, interval);
			});
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
