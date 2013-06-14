var urls = ['*://*.google.com/*'];

/*
chrome.webRequest.onResponseStarted.addListener(function () {
	console.log(arguments);
}, {
	urls: urls,
	types: ['sub_frame', 'main_frame', "xmlhttprequest", "other"],
});

chrome.webRequest.onCompleted.addListener(function () {
	console.log(arguments);
}, {
	urls: urls,
	types: ['sub_frame', 'main_frame', "xmlhttprequest", "other"],
});
*/

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(sender.tab ?
		"from a content script:" + sender.tab.url :
		"from the extension");

	sendResponse({farewell: "goodbye"});

	console.log(request);
});
