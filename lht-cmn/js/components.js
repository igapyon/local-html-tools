/*
 * lht-cmn components.js
 * Version: v20260222
 * Copyright 2026 Toshiki Iga
 * Licensed under the Apache License, Version 2.0
 */

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

class LhtTextFieldHelp extends HTMLElement {
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

    if (this.hasAttribute("required")) {
      field.required = true;
      field.setAttribute("required", "");
    }
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

class LhtSelectHelp extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const fieldId = (this.getAttribute("field-id") || "").trim();
    if (!fieldId) return;

    const hasMdOutlinedSelect = !!(window.customElements && window.customElements.get("md-outlined-select"));
    const field = document.createElement(hasMdOutlinedSelect ? "md-outlined-select" : "select");
    field.id = fieldId;
    this._lhtField = field;
    this._isFallbackSelect = !hasMdOutlinedSelect;

    const label = (this.getAttribute("label") || "").trim();
    if (label) {
      if (this._isFallbackSelect) {
        field.setAttribute("aria-label", label);
      } else {
        field.setAttribute("label", label);
      }
    }

    const value = this.getAttribute("value");
    if (value != null) field.value = value;

    const fieldClass = (this.getAttribute("field-class") || "").trim();
    if (fieldClass) {
      fieldClass.split(/\s+/).filter(Boolean).forEach((name) => field.classList.add(name));
    }
    if (this._isFallbackSelect) {
      field.classList.add("lht-select-help__fallback");
    } else {
      field.classList.add("md-outlined-field");
    }

    if (this.hasAttribute("required")) {
      field.required = true;
      field.setAttribute("required", "");
    }
    if (this.hasAttribute("disabled")) field.disabled = true;

    const helpText = (this.getAttribute("help-text") || "").trim();
    if (helpText) {
      if (this._isFallbackSelect) {
        field.title = helpText;
      } else {
        field.addEventListener("focus", () => {
          field.supportingText = helpText;
        });
        field.addEventListener("blur", () => {
          field.supportingText = "";
        });
      }
    }

    this.appendChild(field);
    this.hydrateOptions();

    if (!this._hasDeclarativeOptions()) {
      this._optionsObserver = new MutationObserver(() => {
        this.hydrateOptions();
      });
      this._optionsObserver.observe(this, { childList: true, subtree: true });
      requestAnimationFrame(() => this.hydrateOptions());
    }
  }

  disconnectedCallback() {
    if (this._optionsObserver) {
      this._optionsObserver.disconnect();
      this._optionsObserver = null;
    }
  }

  _hasDeclarativeOptions() {
    return this.hasAttribute("options") || !!this.querySelector("script[type='application/json'][slot='options']");
  }

  _normalizeOptions(rawOptions) {
    return rawOptions
      .map((entry) => {
        const value = String(entry?.value ?? entry?.label ?? "");
        const label = String(entry?.label ?? entry?.text ?? entry?.value ?? "");
        return {
          value,
          label,
          selected: !!entry?.selected,
          disabled: !!entry?.disabled
        };
      })
      .filter((entry) => entry.value || entry.label);
  }

  _readDeclarativeOptions() {
    const optionsJson = (this.getAttribute("options") || "").trim();
    if (optionsJson) {
      try {
        const parsed = JSON.parse(optionsJson);
        if (Array.isArray(parsed)) return this._normalizeOptions(parsed);
      } catch (_) {
        // JSON 不正時は次の入力ソースへフォールバック
      }
    }

    const script = this.querySelector("script[type='application/json'][slot='options']");
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "[]");
        if (Array.isArray(parsed)) return this._normalizeOptions(parsed);
      } catch (_) {
        // JSON 不正時は空扱い
      }
      return [];
    }

    return null;
  }

  _readChildOptionElements() {
    const sourceOptions = Array.from(this.querySelectorAll("option"));
    if (sourceOptions.length === 0) return [];
    return sourceOptions.map((sourceOption) => ({
      value: sourceOption.getAttribute("value") ?? sourceOption.textContent ?? "",
      label: sourceOption.textContent ?? "",
      selected: sourceOption.hasAttribute("selected"),
      disabled: sourceOption.hasAttribute("disabled")
    }));
  }

  _setFieldOptions(options) {
    const field = this._lhtField;
    if (!field) return;
    field.innerHTML = "";

    for (const entry of options) {
      if (this._isFallbackSelect) {
        const option = document.createElement("option");
        option.value = entry.value;
        option.textContent = entry.label;
        if (entry.disabled) option.disabled = true;
        if (entry.selected) {
          option.selected = true;
          field.value = entry.value;
        }
        field.appendChild(option);
      } else {
        const option = document.createElement("md-select-option");
        option.value = entry.value;
        if (entry.disabled) option.disabled = true;
        if (entry.selected) {
          option.selected = true;
          option.setAttribute("selected", "");
          field.value = entry.value;
        }
        const headline = document.createElement("div");
        headline.slot = "headline";
        headline.textContent = entry.label;
        option.appendChild(headline);
        field.appendChild(option);
      }
    }
  }

  hydrateOptions() {
    const declarativeOptions = this._readDeclarativeOptions();
    if (Array.isArray(declarativeOptions)) {
      this._setFieldOptions(declarativeOptions);
      const jsonScript = this.querySelector("script[type='application/json'][slot='options']");
      if (jsonScript) jsonScript.remove();
      if (this._optionsObserver) {
        this._optionsObserver.disconnect();
        this._optionsObserver = null;
      }
      return;
    }

    const optionsFromChildren = this._readChildOptionElements();
    if (optionsFromChildren.length === 0) return;
    this._setFieldOptions(optionsFromChildren);
    this.querySelectorAll("option").forEach((option) => option.remove());
    if (this._optionsObserver) {
      this._optionsObserver.disconnect();
      this._optionsObserver = null;
    }
  }
}

class LhtFileSelect extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const inputId = (this.getAttribute("input-id") || "fileInput").trim();
    const buttonId = (this.getAttribute("button-id") || "fileSelectBtn").trim();
    const fileNameId = (this.getAttribute("file-name-id") || "fileNameText").trim();
    const accept = (this.getAttribute("accept") || "").trim();
    const buttonLabel = (this.getAttribute("button-label") || "ファイルを選択").trim();
    const placeholder = (this.getAttribute("placeholder") || "未選択").trim();
    const showFileName = this.hasAttribute("show-file-name");

    this.textContent = "";

    const root = document.createElement("div");
    root.className = "lht-file-select";

    const hasMdFilledButton = !!(window.customElements && window.customElements.get("md-filled-button"));
    const triggerButton = document.createElement(hasMdFilledButton ? "md-filled-button" : "button");
    if (!hasMdFilledButton) {
      triggerButton.type = "button";
    }
    triggerButton.id = buttonId;
    triggerButton.className = `lht-file-select__button${hasMdFilledButton ? "" : " lht-file-select__button--fallback"}`;

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("slot", "icon");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("class", "lht-file-select__button-icon");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "1.9");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.innerHTML = '<path d="M4 7h7l2 2h7v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="M12 10v6"></path><path d="M9 13l3 3 3-3"></path>';

    const labelNode = document.createElement("span");
    labelNode.className = "lht-file-select__button-text";
    labelNode.textContent = buttonLabel;
    triggerButton.appendChild(icon);
    triggerButton.appendChild(labelNode);

    const input = document.createElement("input");
    input.id = inputId;
    input.type = "file";
    input.className = "md-file";
    input.hidden = true;
    if (accept) input.setAttribute("accept", accept);
    if (this.hasAttribute("multiple")) input.multiple = true;

    const fileName = document.createElement("span");
    fileName.id = fileNameId;
    fileName.className = "lht-file-select__file-name";
    fileName.textContent = placeholder;
    if (!showFileName) fileName.hidden = true;

    if (this.hasAttribute("disabled")) {
      input.disabled = true;
      triggerButton.disabled = true;
    }

    triggerButton.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const names = Array.from(input.files || []).map((file) => file.name).filter(Boolean);
      fileName.textContent = names.length > 0 ? names.join(", ") : placeholder;
    });

    root.appendChild(triggerButton);
    root.appendChild(fileName);
    this.appendChild(root);
    this.appendChild(input);
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

class LhtIndexCardLink extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const href = (this.getAttribute("href") || "").trim();
    if (!href) return;

    const title = (this.getAttribute("title") || "").trim();
    const descAttr = (this.getAttribute("desc") || "").trim();
    const iconAttr = (this.getAttribute("icon") || "").trim();
    const target = (this.getAttribute("target") || "").trim();
    const relAttr = (this.getAttribute("rel") || "").trim();
    const variant = (this.getAttribute("variant") || "default").trim().toLowerCase();
    const arrowMode = (this.getAttribute("arrow") || "auto").trim().toLowerCase();
    const badgeText = (this.getAttribute("badge") || "").trim();
    const descLines = (this.getAttribute("desc-lines") || "").trim();

    if (!title || !descAttr) {
      const missing = [];
      if (!title) missing.push("title");
      if (!descAttr) missing.push("desc");
      // Fail fast for authoring mistakes in index cards.
      console.warn(`[lht-index-card-link] Missing required attribute(s): ${missing.join(", ")}`, this);
      return;
    }

    this.textContent = "";

    const link = document.createElement("a");
    link.href = href;
    link.className = "md-link-card";
    const isExternalHref = /^(https?:)?\/\//i.test(href);
    const isExternal = variant === "external" || isExternalHref || target === "_blank";
    const effectiveTarget = target || (isExternal ? "_blank" : "");
    if (effectiveTarget) link.target = effectiveTarget;
    if (effectiveTarget === "_blank") {
      link.rel = relAttr || "noopener noreferrer";
    } else if (relAttr) {
      link.rel = relAttr;
    }
    if (variant === "simple") link.classList.add("lht-index-card-link--simple");
    if (isExternal) link.classList.add("lht-index-card-link--external");

    const head = document.createElement("div");
    head.className = "md-card-head";

    const h3 = document.createElement("h3");
    h3.className = "md-card-title";
    if (iconAttr) {
      const iconContainer = document.createElement("span");
      iconContainer.className = "lht-index-card-link__icon";
      iconContainer.textContent = iconAttr;
      h3.appendChild(iconContainer);
    }
    const titleContainer = document.createElement("span");
    titleContainer.className = "lht-index-card-link__title";
    titleContainer.textContent = title;
    h3.appendChild(titleContainer);
    if (badgeText) {
      const badge = document.createElement("span");
      badge.className = "lht-index-card-link__badge";
      badge.textContent = badgeText;
      h3.appendChild(badge);
    }

    const arrow = document.createElement("span");
    arrow.className = "md-card-arrow";
    const showArrow = arrowMode === "auto" ? variant !== "simple" : arrowMode !== "none";
    arrow.textContent = isExternal ? "↗" : "→";
    if (!showArrow) arrow.hidden = true;

    const desc = document.createElement("p");
    desc.className = "md-card-desc";
    desc.textContent = descAttr;
    if (descLines && /^\d+$/.test(descLines)) {
      desc.classList.add("lht-index-card-link__desc--clamp");
      desc.style.setProperty("--lht-desc-lines", descLines);
    }

    head.appendChild(h3);
    head.appendChild(arrow);
    link.appendChild(head);
    link.appendChild(desc);
    this.appendChild(link);
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
if (!customElements.get("lht-text-field-help")) {
  customElements.define("lht-text-field-help", LhtTextFieldHelp);
}
if (!customElements.get("lht-select-help")) {
  customElements.define("lht-select-help", LhtSelectHelp);
}
if (!customElements.get("lht-file-select")) {
  customElements.define("lht-file-select", LhtFileSelect);
}
if (!customElements.get("lht-switch-help")) {
  customElements.define("lht-switch-help", LhtSwitchHelp);
}
if (!customElements.get("lht-command-block")) {
  customElements.define("lht-command-block", LhtCommandBlock);
}
if (!customElements.get("lht-index-card-link")) {
  customElements.define("lht-index-card-link", LhtIndexCardLink);
}
if (!customElements.get("lht-page-menu")) {
  customElements.define("lht-page-menu", LhtPageMenu);
}
