

var

	newDlLink = (function () {
		var cnt = 0;
		return function (pages) {
			var
				ul = document.querySelector('#fileLinks'),
				li = document.createElement('li'),
				a = document.createElement('a'),
				html,
				blob;

			html = pages.join('<hr />');
			html = '<html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8" /></head><body>' + s + '</body></html>';
			blob = new Blob([html], {type: 'text/html'}),

			cnt += 1;
			a.download = 'book.html';
			a.textContent = 'get file #' + cnt;
			a.href = URL.createObjectURL(blob);
			li.appendChild(a);
			ul.appendChild(li);
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
	setCurrentPage = function (i) {
		document.querySelector('#currentPage').textContent = i;
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
			if (msg === 'finished') {
				port.postMessage({
					action: 'get'
				});
			}
		},
		pageCount: function (msg) {
			setPageCount(msg);
		},
		deliver: function (pages) {
			newDlLink(pages);
		},
		currentPage: function (msg) {
			setCurrentPage(msg);
		}
	},
	listener = function (request) {
		var action = request.action;
		if (action && actions[action]) {
			actions[action](request.message);
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
