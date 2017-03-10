
const openLocalFile  = (localFileUrl, baseTab) => {
	chrome.tabs.create({
		url: localFileUrl,
		index: baseTab.index + 1
	});
};

chrome.runtime.onMessage.addListener((request, sender) => {
	if (request.method === "openLocalFile") {
		const localFileUrl = request.fileUrl;
		const tab = sender.tab;
		openLocalFile(localFileUrl, tab);
	}
});
