{
	const alreadyCheckKey = `data-already_local_file_link_checked-${chrome.runtime.id}`;
	document.body.addEventListener("mouseover", evt => {
		const target = evt.target;
		if (!target.classList.contains("message_body")) return;
		if (target.hasAttribute(alreadyCheckKey)) return;
		target.setAttribute(alreadyCheckKey, true);
		Array.from(target.childNodes).filter(node => {
			return node instanceof Text;
		}).forEach(textNode => {
			const text = textNode.textContent;
			if (text.startsWith("\\\\")) {
				const url = "file:" + text.replace(/\\/g, "/");
				const a = document.createElement("a");
				a.href = url;
				a.innerText = text;
				target.replaceChild(a, textNode);
			}
		});
	});
}
