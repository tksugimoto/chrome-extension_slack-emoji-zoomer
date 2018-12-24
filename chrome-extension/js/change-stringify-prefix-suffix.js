document.body.addEventListener('selectstart', evt => {
	const container = evt.target.parentNode.closest('div');

	Array.from(container.querySelectorAll('pre[data-stringify-prefix]')).forEach(pre => {
		pre.setAttribute('data-stringify-prefix', '\n```\n');
		pre.setAttribute('data-stringify-suffix', '\n```');
	});
	Array.from(container.querySelectorAll('code[data-stringify-prefix]')).forEach(code => {
		code.setAttribute('data-stringify-prefix', '`');
		code.setAttribute('data-stringify-suffix', '`');
	});
});
