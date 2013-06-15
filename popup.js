

var
	newDlLink = (function () {
		var cnt = 0;
		return function (pages) {
			var b = new Blob(pages, {type: 'text/html'}),
				ul = document.querySelector('#fileLinks'),
				a = document.createElement('a');

			cnt += 1;
			a.download = 'book.html';
			a.textContent = 'get file #' + cnt;
			a.href = URL.createObjectURL(b);
		};
	}()),
	pageCount = 0,
	port = chrome.extension.connect({name: "popup"}),
	setStatus = function setStatus(s) {
		document.querySelector('#status').textContent = s;
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
			setStatus('restarting');
		},
		status: function (msg) {
			setStatus(msg);
		},
		deliver: function (pages) {
			newDlLink(pages);
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
