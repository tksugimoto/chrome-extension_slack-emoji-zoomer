
// 絵文字検索時のデフォルトIMEを半角入力にする
document.addEventListener('click', evt => {
	if (!evt.target.closest('[aria-label="絵文字メニュー"]')) return;
	window.setTimeout(() => {
		const emojiSearchInput = document.querySelector('[aria-owns="emoji-picker-list"]');
		emojiSearchInput.type = 'email';
	}, 0);
});
