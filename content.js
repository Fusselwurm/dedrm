// setInterval(function () {
// 	console.info(document.querySelector('iframe[src^=javascript]').document);
// }, 1000);

function log (s) {
	chrome.extension.sendMessage(s, function(response) {
		console.debug(response);
	});
}

setInterval(function () {
	var
		frame = document.querySelector('iframe[src^=javascript]'),
		doc = frame && frame.contentDocument,
		html = doc && doc.body.innerHTML;

	console.log('trying to get frame...');

	log({
		html: html,
		success: !!html,
		message: frame ? (html ? 'yay!' : 'couldnt get document or doc empty') : 'didnt find frame'
	});
}, 2000);
