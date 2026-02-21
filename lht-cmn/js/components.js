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

class LhtHelpTextField extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const fieldId = (this.getAttribute("field-id") || "").trim();
    if (!fieldId) return;

    const field = document.createElement("md-outlined-text-field");
    field.id = fieldId;

    const label = (this.getAttribute("label") || "").trim();
    if (label) field.setAttribute("label", label);

    const placeholder = this.getAttribute("placeholder");
    if (placeholder != null) field.setAttribute("placeholder", placeholder);

    const autocomplete = this.getAttribute("autocomplete");
    if (autocomplete != null) field.setAttribute("autocomplete", autocomplete);

    const type = this.getAttribute("type");
    if (type != null) field.setAttribute("type", type);

    const min = this.getAttribute("min");
    if (min != null) field.setAttribute("min", min);

    const max = this.getAttribute("max");
    if (max != null) field.setAttribute("max", max);

    const step = this.getAttribute("step");
    if (step != null) field.setAttribute("step", step);

    const rows = this.getAttribute("rows");
    if (rows != null) field.setAttribute("rows", rows);

    const value = this.getAttribute("value");
    if (value != null) field.setAttribute("value", value);

    const fieldClass = (this.getAttribute("field-class") || "").trim();
    if (fieldClass) {
      fieldClass.split(/\s+/).filter(Boolean).forEach((name) => field.classList.add(name));
    }
    field.classList.add("md-outlined-field");

    if (this.hasAttribute("required")) field.required = true;
    if (this.hasAttribute("disabled")) field.disabled = true;

    const helpText = (this.getAttribute("help-text") || "").trim();
    if (helpText) {
      field.addEventListener("focus", () => {
        field.supportingText = helpText;
      });
      field.addEventListener("blur", () => {
        field.supportingText = "";
      });
    }

    this.textContent = "";
    this.appendChild(field);
  }
}

class LhtHelpSelect extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const fieldId = (this.getAttribute("field-id") || "").trim();
    if (!fieldId) return;

    const field = document.createElement("md-outlined-select");
    field.id = fieldId;

    const label = (this.getAttribute("label") || "").trim();
    if (label) field.setAttribute("label", label);

    const value = this.getAttribute("value");
    if (value != null) field.value = value;

    const fieldClass = (this.getAttribute("field-class") || "").trim();
    if (fieldClass) {
      fieldClass.split(/\s+/).filter(Boolean).forEach((name) => field.classList.add(name));
    }
    field.classList.add("md-outlined-field");

    if (this.hasAttribute("required")) field.required = true;
    if (this.hasAttribute("disabled")) field.disabled = true;

    const sourceOptions = Array.from(this.querySelectorAll("option"));
    for (const sourceOption of sourceOptions) {
      const option = document.createElement("md-select-option");
      const optionValue = sourceOption.getAttribute("value") ?? sourceOption.textContent ?? "";
      option.value = optionValue;
      if (sourceOption.hasAttribute("selected")) {
        option.selected = true;
        option.setAttribute("selected", "");
        field.value = optionValue;
      }
      option.innerHTML = `<div slot="headline">${sourceOption.textContent ?? ""}</div>`;
      field.appendChild(option);
    }

    const helpText = (this.getAttribute("help-text") || "").trim();
    if (helpText) {
      field.addEventListener("focus", () => {
        field.supportingText = helpText;
      });
      field.addEventListener("blur", () => {
        field.supportingText = "";
      });
    }

    this.textContent = "";
    this.appendChild(field);
  }
}

class LhtSwitchHelp extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const switchId = (this.getAttribute("switch-id") || "").trim();
    if (!switchId) return;
    const labelText = (this.getAttribute("label") || "").trim();
    const helpLabel = (this.getAttribute("help-label") || `${labelText}の説明`).trim();
    const helpContentHtml = this.innerHTML.trim();
    const onChangeFnName = (this.getAttribute("on-change") || "").trim();
    const isChecked = this.hasAttribute("checked");
    const isHelpWide = this.hasAttribute("help-wide");

    this.textContent = "";

    const label = document.createElement("label");
    label.className = "md-switch-label";

    const mdSwitch = document.createElement("md-switch");
    mdSwitch.id = switchId;
    Object.defineProperty(mdSwitch, "checked", {
      get() {
        return !!mdSwitch.selected;
      },
      set(value) {
        mdSwitch.selected = !!value;
      }
    });
    if (isChecked) {
      mdSwitch.selected = true;
      mdSwitch.setAttribute("selected", "");
    }
    if (onChangeFnName) {
      mdSwitch.addEventListener("change", () => {
        const fn = window[onChangeFnName];
        if (typeof fn === "function") {
          fn();
        }
      });
    }
    label.appendChild(mdSwitch);

    const labelSpan = document.createElement("span");
    labelSpan.textContent = labelText;
    label.appendChild(labelSpan);

    if (helpContentHtml) {
      const help = document.createElement("lht-help-tooltip");
      help.setAttribute("label", helpLabel);
      if (isHelpWide) {
        help.setAttribute("wide", "");
      }
      help.innerHTML = helpContentHtml;
      label.appendChild(help);
    }

    this.appendChild(label);
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
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-icon-20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></svg>';

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
if (!customElements.get("lht-help-text-field")) {
  customElements.define("lht-help-text-field", LhtHelpTextField);
}
if (!customElements.get("lht-help-select")) {
  customElements.define("lht-help-select", LhtHelpSelect);
}
if (!customElements.get("lht-switch-help")) {
  customElements.define("lht-switch-help", LhtSwitchHelp);
}
if (!customElements.get("lht-command-block")) {
  customElements.define("lht-command-block", LhtCommandBlock);
}
if (!customElements.get("lht-page-menu")) {
  customElements.define("lht-page-menu", LhtPageMenu);
}
