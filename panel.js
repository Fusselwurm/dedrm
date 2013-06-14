
setTimeout(function () {
	try {
		setInterval(function () {
			console.warn(document.querySelector('iframe[src^=javascript]').document);
		}, 1000);
	} catch (e) {

		document.querySelector('div').textContent += ( e.message || e );
	}


	document.querySelector('div').textContent +=  chrome.devtools.inspectedWindow.tabId

	chrome.devtools.inspectedWindow.getResources(function () {
	document.querySelector('div').textContent += arguments[0];
	});
	document.querySelector('div').textContent += 'iaeai';
}, 1000);

