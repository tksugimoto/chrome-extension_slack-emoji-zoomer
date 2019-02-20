
// チャンネル検索時のデフォルトIMEを半角入力にする
(() => {
	const changeTypeToEmail = () => {
		document.querySelector('[data-qa="jumper_input"]').type = 'email';
	};
	const setup = () => {
		try {
			changeTypeToEmail();
		} catch (e) {
			window.setTimeout(setup, 1000);
		}
	};
	setup();
})();
