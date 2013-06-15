var urls = ['*://*.google.com/*'];

var
	pages = [],
	status = '',
	popupPort = null,
	contentPorts = [],
	popupListener = function (request) {
		switch (request.action) {
			case 'restart':
				pages = [];
				contentPorts.forEach(function (port) {
					port.postMessage(request);
				});
				status = 'restarting';
				break;
			case 'get':
				popupPort && popupPort.postMessage({
					action: 'deliver',
					message: pages
				});
				break;
			case 'status':
				status = request.message;
				console.error(request.message);
				break;
			default:
				console.warn('message with missing or unknown action: ' + request.action)
		}
	},
	contentListener = function (request) {
		switch (request.action) {
			case 'append':
				pages.push(request.message);
				console.log(request.message.substr(0, 50));
				popupPort && popupPort.postMessage({
					action: 'pageCount',
					message: pages.length
				});
				break;
			case 'status':
				status = request.message;
				console.info(request.message);
				popupPort && popupPort.postMessage(request);
				break;
			case 'currentPage':
				popupPort && popupPort.postMessage(request);
				break;
			default:
				console.warn('message with missing or unknown action: ' + request.action)
		}
	};

chrome.extension.onConnect.addListener(function(port) {
	switch (port.name) {
		case 'popup':
			popupPort = port;
			port.onMessage.addListener(popupListener);
			port.onDisconnect.addListener(function () {
				popupPort = null;
			});

			// inform of current status:
			port.postMessage({
				action: 'status',
				message: status
			});
			port.postMessage({
				action: 'pageCount',
				message: pages.length
			});
			break;
		case 'content':
			contentPorts.push(port);
			port.onMessage.addListener(contentListener);
			port.onDisconnect.addListener(function () {
				var idx = contentPorts.indexOf(port);
				if (idx !== -1) {
					contentPorts.splice(idx, 1);
				}
			});
			break;
		default:
			console.warn('strange connection: ' + port.name);
	}
});
