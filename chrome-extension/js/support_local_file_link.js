{
	const alreadyCheckKey = `data-already_local_file_link_checked-${chrome.runtime.id}`;
	const filePathChecker = (() => {
		const rules = [];
		return {
			addRule: rule => {
				rules.push(rule);
			},
			checkAndGetFuleUrl: maybePathString => {
				const matchedRule = rules.find(rule => {
					return rule.isFilePath(maybePathString);
				});
				if (!matchedRule) return null;
				return matchedRule.generateFileUrl(maybePathString).replace(/[%#]/g, encodeURIComponent);
			},
		};
	})();
	filePathChecker.addRule({
		isFilePath: str => str.startsWith('\\\\'),
		generateFileUrl: str => 'file:' + str.replace(/\\/g, '/'),
	});
	// ダブルクオーテーションで囲まれている時
	filePathChecker.addRule({
		isFilePath: str => str.startsWith('"\\\\') && str.endsWith('"'),
		generateFileUrl: str => 'file:' + str.slice(1, -1).replace(/\\/g, '/'),
	});
	// <>で囲まれている時
	filePathChecker.addRule({
		isFilePath: str => str.startsWith('<\\\\') && str.endsWith('>'),
		generateFileUrl: str => 'file:' + str.slice(1, -1).replace(/\\/g, '/'),
	});
	const isMessageBody = node => {
		if (!node || !node.classList) return false;
		const isOriginalMessageBody = node.classList.contains('message_body') || node.classList.contains('c-message__body');
		if (isOriginalMessageBody) return true;
		const isCommentBody = node.classList.contains('c-message_kit__text');
		if (isCommentBody) return true;
		const isFormattedPreElement = (node.tagName === 'PRE') && node.classList.contains('special_formatting');
		if (isFormattedPreElement) return true;
		const isFormattedCodeElement = (node.tagName === 'CODE') && node.classList.contains('c-mrkdwn__code');
		if (isFormattedCodeElement) return true;
		const isQuotedMessageBody = node.classList.contains('msg_inline_attachment_row') &&
									node.classList.contains('attachment_flush_text') &&
									!node.classList.contains('attachment_source') &&
									!node.classList.contains('attachment_footer');
		if (isQuotedMessageBody) return true;
		return false;
	};
	const generateFileAnchorElem = fileUrl => {
		const a = document.createElement('a');
		a.href = fileUrl;
		a.addEventListener('click', evt => {
			if (!evt.isTrusted) return;
			// file://リンクをクリックした時のエラーを表示させない
			evt.preventDefault();
			// 別の拡張でfile://リンク対応しているときに2重で開くのでイベント伝播をキャンセル
			evt.stopPropagation();
			chrome.runtime.sendMessage({
				method: 'openLocalFile',
				fileUrl,
			});
		});
		return a;
	};
	document.body.addEventListener('mouseover', evt => {
		const target = evt.target;
		if (!isMessageBody(target)) return;
		if (target.hasAttribute(alreadyCheckKey)) return;
		target.setAttribute(alreadyCheckKey, true);
		// TODO: 処理の共通化
		Array.from(target.childNodes).filter(node => {
			return node instanceof Text;
		}).forEach(textNode => {
			const text = textNode.textContent.trim();
			const maybeFileUrl = filePathChecker.checkAndGetFuleUrl(text);
			if (maybeFileUrl !== null) {
				const url = maybeFileUrl;
				const a = generateFileAnchorElem(url);
				a.innerText = text;
				target.replaceChild(a, textNode);
			}
		});
		Array.from(target.childNodes).filter(node => {
			return node.tagName === 'PRE';
		}).flatMap(node => {
			return Array.from(node.childNodes).filter(child => child.nodeName === '#text');
		}).forEach(node => {
			const text = node.textContent.trim();
			if (text.includes('\n')) return;
			const maybeFileUrl = filePathChecker.checkAndGetFuleUrl(text);
			if (maybeFileUrl !== null) {
				const url = maybeFileUrl;
				const a = generateFileAnchorElem(url);
				a.innerText = text;
				node.parentNode.replaceChild(a, node);
			}
		});
		Array.from(target.childNodes).filter(node => {
			return node.tagName === 'CODE';
		}).forEach(code => {
			const text = code.textContent.trim();
			const maybeFileUrl = filePathChecker.checkAndGetFuleUrl(text);
			if (maybeFileUrl !== null) {
				const url = maybeFileUrl;
				const a = generateFileAnchorElem(url);
				code.parentNode.replaceChild(a, code);
				a.append(code);
			}
		});
	});
}
