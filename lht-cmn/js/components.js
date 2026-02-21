class LhtHelpTooltip extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const label = this.getAttribute("label") || "説明";
    const isWide = this.hasAttribute("wide");
    const helpContentHtml = this.innerHTML.trim();

    this.textContent = "";

    const group = document.createElement("span");
    group.className = "md-tooltip-group";

    const button = document.createElement("md-icon-button");
    button.className = "md-help-icon-button";
    button.setAttribute("aria-label", label);
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-info-icon" fill="none"><circle cx="12" cy="12" r="9" fill="#cbbcf0"/><rect x="11" y="10" width="2" height="7" rx="1" fill="#ffffff"/><circle cx="12" cy="7.5" r="1" fill="#ffffff"/></svg>';

    const tooltip = document.createElement("span");
    tooltip.className = `md-tooltip-content md-tooltip md-tooltip--rich${isWide ? " md-tooltip--wide" : ""}`;
    tooltip.innerHTML = helpContentHtml;

    group.appendChild(button);
    group.appendChild(tooltip);
    this.appendChild(group);
  }
}

class LhtCommandBlock extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const commandId = (this.getAttribute("command-id") || "").trim();
    if (!commandId) return;
    const copyButtons = (this.getAttribute("copy-buttons") || "single").trim().toLowerCase();
    const isDual = copyButtons === "dual";

    this.textContent = "";

    const block = document.createElement("div");
    block.className = "md-code-block";

    const code = document.createElement("code");
    code.id = commandId;
    code.className = `md-code${isDual ? " md-code--dual-copy" : ""}`;
    block.appendChild(code);

    const topCopyButton = this.createCopyButton("コピー", () => this.copyFromCommand(commandId));
    block.appendChild(topCopyButton);

    if (isDual) {
      const bottomCopyButton = this.createCopyButton("コピー（右下）", () => this.copyFromCommand(commandId));
      bottomCopyButton.classList.add("md-copy-button--bottom-right");
      block.appendChild(bottomCopyButton);
    }

    this.appendChild(block);
  }

  createCopyButton(label, onClick) {
    const button = document.createElement("md-icon-button");
    button.className = "md-copy-button md-copy-button--surface";
    button.setAttribute("aria-label", label);
    button.innerHTML = '<svg viewBox="0 0 24 24" class="md-icon-small" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#md-icon-copy" xlink:href="#md-icon-copy"></use></svg>';
    button.addEventListener("click", onClick);
    return button;
  }

  async copyFromCommand(commandId) {
    const commandElement = document.getElementById(commandId);
    if (!commandElement) return;
    const text = (commandElement.textContent || "").trim();
    if (!text) return;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement("textarea");
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      if (typeof window.showToast === "function") {
        window.showToast("コピーしました");
      }
    } catch (_) {
      // Clipboard API 利用不可環境では失敗を無視
    }
  }
}

class LhtPageMenu extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const homeHref = (this.getAttribute("home-href") || "../index.html").trim();
    const homeLabel = (this.getAttribute("home-label") || "トップへ戻る").trim();

    this.textContent = "";
    this.classList.add("lht-page-menu");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "md-menu-button md-icon-btn";
    button.setAttribute("aria-label", "メニュー");
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-icon-20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><use href="#md-icon-menu" xlink:href="#md-icon-menu"></use></svg>';

    const panel = document.createElement("div");
    panel.className = "md-menu-panel md-hidden";

    const link = document.createElement("a");
    link.className = "md-menu-link";
    link.href = homeHref;
    link.textContent = homeLabel;
    panel.appendChild(link);

    button.addEventListener("click", () => {
      panel.classList.toggle("md-hidden");
    });

    document.addEventListener("pointerdown", (event) => {
      if (!this.contains(event.target)) {
        panel.classList.add("md-hidden");
      }
    });

    this.appendChild(button);
    this.appendChild(panel);
  }
}

if (!customElements.get("lht-help-tooltip")) {
  customElements.define("lht-help-tooltip", LhtHelpTooltip);
}
if (!customElements.get("lht-command-block")) {
  customElements.define("lht-command-block", LhtCommandBlock);
}
if (!customElements.get("lht-page-menu")) {
  customElements.define("lht-page-menu", LhtPageMenu);
}
