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
					return rule.isFilePath(maybePathString)
				});
				if (!matchedRule) return null;
				return matchedRule.generateFileUrl(maybePathString);
			}
		};
	})();
	filePathChecker.addRule({
		isFilePath: str => str.startsWith("\\\\"),
		generateFileUrl: str => "file:" + str.replace(/\\/g, "/")
	});
	// ダブルクオーテーションで囲まれている時
	filePathChecker.addRule({
		isFilePath: str => str.startsWith('"\\\\') && str.endsWith('"'),
		generateFileUrl: str => "file:" + str.slice(1, -1).replace(/\\/g, "/")
	});
	const isMessageBody = node => {
		if (!node || !node.classList) return false;
		const isOriginalMessageBody = node.classList.contains("message_body");
		if (isOriginalMessageBody) return true;
		const isFormattedPreElement = (node.tagName === "PRE") && node.classList.contains("special_formatting");
		if (isFormattedPreElement) return true;
		const isQuotedMessageBody = node.classList.contains("msg_inline_attachment_row") && 
									node.classList.contains("attachment_flush_text") && 
									!node.classList.contains("attachment_source") && 
									!node.classList.contains("attachment_footer");
		if (isQuotedMessageBody) return true;
		return false;
	};
	document.body.addEventListener("mouseover", evt => {
		const target = evt.target;
		if (!isMessageBody(target)) return;
		if (target.hasAttribute(alreadyCheckKey)) return;
		target.setAttribute(alreadyCheckKey, true);
		Array.from(target.childNodes).filter(node => {
			return node instanceof Text;
		}).forEach(textNode => {
			const text = textNode.textContent;
			const maybeFileUrl = filePathChecker.checkAndGetFuleUrl(text);
			if (maybeFileUrl !== null) {
				const url = maybeFileUrl;
				const a = document.createElement("a");
				a.href = url;
				a.innerText = text;
				target.replaceChild(a, textNode);
			}
		});
		Array.from(target.childNodes).filter(node => {
			return node.tagName === "CODE";
		}).forEach(codeNode => {
			const text = codeNode.textContent;
			const maybeFileUrl = filePathChecker.checkAndGetFuleUrl(text);
			if (maybeFileUrl !== null) {
				const url = maybeFileUrl;
				const a = document.createElement("a");
				a.href = url;
				target.replaceChild(a, codeNode);
				a.appendChild(codeNode);
			}
		});
	});
}
