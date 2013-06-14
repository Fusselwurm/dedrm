

var
	pageCount = 0,
	port = chrome.extension.connect({name: "popup"}),
	buttonOn = function buttonOn() {
		var button = document.querySelector('#dl');
		button.removeAttribute('disabled');
	},
	buttonOff = function buttonOff() {
		var button = document.querySelector('#dl');
		button.setAttribute('disabled', 'disabled');
	},
	setPageCount = function (cnt) {
		pageCount = cnt;
		document.querySelector('#pageCount').textContent = pageCount;
	},
	actions = {
		append: function (msg) {
			setPageCount(pageCount + 1);
		},
		restart: function (msg) {
			setPageCount(0);
			buttonOff();
		},
		status: function (msg) {
			switch (msg) {
				case 'finished':
					buttonOn();
					break;
				case 'running':
				default:
					buttonOff();
			}
		},
		deliver: function (pages) {
			document.body.innerHTML = pages.join('<hr>');
		}
	},
	listener = function (msg) {
		var action = msg.action;
		if (action && actions[action]) {
			actions[action](msg.message);
		} else {
			console.log('unknown action ' + action);
		}
	};

port.onMessage.addListener(listener);

document.querySelector('#start').addEventListener('click', function () {
	port.postMessage({
		action: 'restart'
	});
	actions.restart();
});

document.querySelector('#dl').addEventListener('click', function () {
	port.postMessage({
		action: 'get'
	});
});
