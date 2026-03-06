/*
 * lht-cmn components.js
 * Version: v20260306
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
    const hideDelayMsRaw = Number(this.getAttribute("hide-delay-ms"));
    const hideDelayMs = Number.isFinite(hideDelayMsRaw) && hideDelayMsRaw >= 0 ? hideDelayMsRaw : 120;
    if (helpText) {
      let blurHideTimer = null;
      field.addEventListener("focus", () => {
        if (blurHideTimer) {
          clearTimeout(blurHideTimer);
          blurHideTimer = null;
        }
        field.supportingText = helpText;
      });
      field.addEventListener("blur", () => {
        if (blurHideTimer) {
          clearTimeout(blurHideTimer);
        }
        blurHideTimer = setTimeout(() => {
          field.supportingText = "";
          blurHideTimer = null;
        }, hideDelayMs);
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
    const hideDelayMsRaw = Number(this.getAttribute("hide-delay-ms"));
    const hideDelayMs = Number.isFinite(hideDelayMsRaw) && hideDelayMsRaw >= 0 ? hideDelayMsRaw : 120;
    if (helpText) {
      if (this._isFallbackSelect) {
        field.title = helpText;
      } else {
        let blurHideTimer = null;
        field.addEventListener("focus", () => {
          if (blurHideTimer) {
            clearTimeout(blurHideTimer);
            blurHideTimer = null;
          }
          field.supportingText = helpText;
        });
        field.addEventListener("blur", () => {
          if (blurHideTimer) {
            clearTimeout(blurHideTimer);
          }
          blurHideTimer = setTimeout(() => {
            field.supportingText = "";
            blurHideTimer = null;
          }, hideDelayMs);
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

class LhtLoadingOverlay extends HTMLElement {
  static get observedAttributes() {
    return ["active", "text"];
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");

    const text = (this.getAttribute("text") || "Loading...").trim();

    this.textContent = "";

    const dialog = document.createElement("div");
    dialog.className = "lht-loading-overlay__dialog";

    const spinner = document.createElement("div");
    spinner.className = "lht-loading-overlay__spinner";
    spinner.setAttribute("aria-hidden", "true");

    const message = document.createElement("p");
    message.className = "lht-loading-overlay__text";
    message.textContent = text;

    dialog.appendChild(spinner);
    dialog.appendChild(message);
    this.appendChild(dialog);

    this._messageNode = message;
    this.setActive(this.hasAttribute("active"));
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "text" && this._messageNode) {
      const text = (newValue || "Loading...").trim();
      this._messageNode.textContent = text || "Loading...";
      return;
    }
    if (name === "active") {
      this.setActive(newValue !== null);
    }
  }

  isActive() {
    return this.hasAttribute("active");
  }

  setActive(inProgress) {
    const next = !!inProgress;
    this.toggleAttribute("active", next);
    this.setAttribute("aria-hidden", next ? "false" : "true");

    const busyTargetId = (this.getAttribute("busy-target-id") || "").trim();
    if (busyTargetId) {
      const target = document.getElementById(busyTargetId);
      if (target) target.setAttribute("aria-busy", next ? "true" : "false");
    }

    const disableTargetIds = (this.getAttribute("disable-target-ids") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    for (const id of disableTargetIds) {
      const element = document.getElementById(id);
      if (!element || !("disabled" in element)) continue;
      element.disabled = next;
    }
  }

  waitForNextPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}

class LhtToast extends HTMLElement {
  static get observedAttributes() {
    return ["text", "active"];
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
    this.setAttribute("aria-atomic", "true");

    const initialText = (this.getAttribute("text") || this.textContent || "完了").trim();
    const text = initialText || "完了";

    this.textContent = "";

    const body = document.createElement("div");
    body.className = "lht-toast__body";
    body.textContent = text;
    this.appendChild(body);
    this._body = body;

    this.setActive(this.hasAttribute("active"));

    if (typeof window.showToast !== "function") {
      window.showToast = (message, durationMs) => {
        this.show(message, durationMs);
      };
    }
  }

  disconnectedCallback() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "text") {
      if (!this._body) return;
      const text = (newValue || "").trim();
      if (text) this._body.textContent = text;
      return;
    }
    if (name === "active") {
      this.setActive(newValue !== null);
    }
  }

  show(message, durationMs) {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }

    const defaultDurationMs = Number(this.getAttribute("duration-ms"));
    const fallbackDuration = Number.isFinite(defaultDurationMs) && defaultDurationMs > 0 ? defaultDurationMs : 1600;
    const nextDuration = Number(durationMs);
    const hideAfterMs = Number.isFinite(nextDuration) && nextDuration > 0 ? nextDuration : fallbackDuration;

    const text = (message || this.getAttribute("text") || this._body?.textContent || "完了").trim();
    if (this._body) this._body.textContent = text || "完了";

    this.setActive(true);

    this._hideTimer = setTimeout(() => {
      this.hide();
    }, hideAfterMs);
  }

  hide() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
    this.setActive(false);
  }

  setActive(active) {
    const next = !!active;
    this.toggleAttribute("active", next);
    this.setAttribute("data-visible", next ? "true" : "false");
    this.setAttribute("aria-hidden", next ? "false" : "true");
  }
}

class LhtErrorAlert extends HTMLElement {
  static get observedAttributes() {
    return ["text", "active"];
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.setAttribute("role", "alert");
    this.setAttribute("aria-live", "assertive");
    this.setAttribute("aria-atomic", "true");

    const initialText = (this.getAttribute("text") || this.textContent || "").trim();

    this.textContent = "";

    const body = document.createElement("p");
    body.className = "lht-error-alert__body";
    body.textContent = initialText;
    this.appendChild(body);
    this._body = body;

    this.setActive(this.hasAttribute("active"));
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === "text") {
      const text = (newValue || "").trim();
      if (this._body) this._body.textContent = text;
      return;
    }
    if (name === "active") {
      this.setActive(newValue !== null);
    }
  }

  isVisible() {
    return this.getAttribute("data-visible") === "true";
  }

  show(message) {
    const text = (message || this.getAttribute("text") || "").trim();
    if (this._body) this._body.textContent = text;
    this.setActive(text.length > 0);
  }

  clear() {
    if (this._body) this._body.textContent = "";
    this.hide();
  }

  hide() {
    this.setActive(false);
  }

  setActive(active) {
    const next = !!active;
    this.toggleAttribute("active", next);
    this.setAttribute("data-visible", next ? "true" : "false");
    this.setAttribute("aria-hidden", next ? "false" : "true");
  }
}

class LhtInputModeToggle extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const groupLabel = (this.getAttribute("group-label") || "入力方式").trim();
    const groupName = (this.getAttribute("name") || "inputMode").trim();
    const fileId = (this.getAttribute("file-id") || "inputModeFile").trim();
    const sourceId = (this.getAttribute("source-id") || "inputModeSource").trim();
    const fileLabel = (this.getAttribute("file-label") || "ファイル読込").trim();
    const sourceLabel = (this.getAttribute("source-label") || "ソースコード入力").trim();
    const defaultMode = (this.getAttribute("default-mode") || "file").trim().toLowerCase();
    const disabled = this.hasAttribute("disabled");

    this.textContent = "";
    this.classList.add("lht-input-mode-toggle");

    const group = document.createElement("div");
    group.className = "lht-input-mode-toggle__group";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", groupLabel);

    const fileOption = this.createOption({
      id: fileId,
      name: groupName,
      label: fileLabel,
      value: "file",
      checked: defaultMode !== "source",
      disabled
    });

    const sourceOption = this.createOption({
      id: sourceId,
      name: groupName,
      label: sourceLabel,
      value: "source",
      checked: defaultMode === "source",
      disabled
    });

    group.appendChild(fileOption.label);
    group.appendChild(sourceOption.label);
    this.appendChild(group);

    this._fileRadio = fileOption.input;
    this._sourceRadio = sourceOption.input;

    const onChange = () => this.applyModeUi();
    this._fileRadio.addEventListener("change", onChange);
    this._sourceRadio.addEventListener("change", onChange);

    this.applyModeUi();
  }

  createOption({ id, name, label, value, checked, disabled }) {
    const optionLabel = document.createElement("label");
    optionLabel.className = "lht-input-mode-toggle__option";

    const input = document.createElement("input");
    input.id = id;
    input.type = "radio";
    input.name = name;
    input.value = value;
    input.checked = !!checked;
    input.disabled = !!disabled;

    const text = document.createElement("span");
    text.textContent = label;

    optionLabel.appendChild(input);
    optionLabel.appendChild(text);
    return { label: optionLabel, input };
  }

  getMode() {
    return this._sourceRadio?.checked ? "source" : "file";
  }

  setMode(mode) {
    const normalized = (mode || "").trim().toLowerCase();
    const sourceMode = normalized === "source";
    if (this._sourceRadio) this._sourceRadio.checked = sourceMode;
    if (this._fileRadio) this._fileRadio.checked = !sourceMode;
    this.applyModeUi();
  }

  applyModeUi() {
    const sourceMode = this.getMode() === "source";
    const sourceTargetId = (this.getAttribute("source-target-id") || "").trim();
    const fileTargetId = (this.getAttribute("file-target-id") || "").trim();

    if (sourceTargetId) {
      const sourceTarget = document.getElementById(sourceTargetId);
      if (sourceTarget) sourceTarget.classList.toggle("md-hidden", !sourceMode);
    }
    if (fileTargetId) {
      const fileTarget = document.getElementById(fileTargetId);
      if (fileTarget) fileTarget.classList.toggle("md-hidden", sourceMode);
    }

    const onChangeFnName = (this.getAttribute("on-change") || "").trim();
    if (onChangeFnName) {
      const fn = window[onChangeFnName];
      if (typeof fn === "function") fn(this.getMode());
    }

    this.dispatchEvent(new CustomEvent("input-mode-change", {
      detail: { mode: this.getMode() },
      bubbles: true
    }));
  }
}

class LhtPreviewOutput extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const previewId = (this.getAttribute("preview-id") || "previewText").trim();
    const copyButtonId = (this.getAttribute("copy-button-id") || "copyBtn").trim();
    const copyTargetId = (this.getAttribute("copy-target-id") || previewId).trim();
    const placeholder = this.getAttribute("placeholder") || "未変換";
    const copyLabel = (this.getAttribute("copy-label") || "コピー").trim();
    const copyAriaLabel = (this.getAttribute("copy-aria-label") || `${copyLabel}をコピー`).trim();
    const previewTag = (this.getAttribute("preview-tag") || "div").trim().toLowerCase();
    const showCopyButton = !this.hasAttribute("no-copy");

    this.textContent = "";
    this.classList.add("lht-preview-output");

    const root = document.createElement("div");
    root.className = "lht-preview-output__root";

    const preview = document.createElement(previewTag === "pre" ? "pre" : "div");
    preview.id = previewId;
    preview.className = "lht-preview-output__preview";
    preview.textContent = placeholder;
    root.appendChild(preview);
    this._previewNode = preview;

    if (showCopyButton) {
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.id = copyButtonId;
      copyButton.className = "lht-preview-output__copy-button";
      copyButton.setAttribute("aria-label", copyAriaLabel);
      copyButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" class="lht-preview-output__copy-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><rect x="4" y="4" width="11" height="11" rx="2"></rect></svg>';
      copyButton.addEventListener("click", () => this.copy(copyTargetId));
      root.appendChild(copyButton);
      this._copyButton = copyButton;
    }

    this.appendChild(root);
  }

  getText() {
    return (this._previewNode?.textContent || "").trim();
  }

  setText(text) {
    if (!this._previewNode) return;
    this._previewNode.textContent = text == null ? "" : String(text);
  }

  clear() {
    if (!this._previewNode) return;
    const placeholder = this.getAttribute("placeholder") || "";
    this._previewNode.textContent = placeholder;
  }

  async copy(targetId) {
    const target = document.getElementById(targetId);
    const text = (target?.textContent || "").trim();
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
      // コピー不可環境では失敗を握りつぶす
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

class LhtPageHero extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const title = (this.getAttribute("title") || "").trim();
    if (!title) return;
    const subtitle = (this.getAttribute("subtitle") || "").trim();
    const icon = (this.getAttribute("icon") || "").trim();
    const helpLabel = (this.getAttribute("help-label") || "説明").trim();
    const homeHref = (this.getAttribute("menu-home-href") || "../index.html").trim();
    const homeLabel = (this.getAttribute("menu-home-label") || "トップへ戻る").trim();
    const useWideHelp = this.hasAttribute("help-wide");
    const showMenu = !this.hasAttribute("no-menu");
    const helpHtml = this.innerHTML.trim();

    this.textContent = "";
    this.classList.add("lht-page-hero");

    const topRow = document.createElement("div");
    topRow.className = "lht-page-hero__title-row";

    const titleMain = document.createElement("span");
    titleMain.className = "lht-page-hero__title-main";

    const heading = document.createElement("h1");
    heading.className = "lht-page-hero__title";
    if (icon) {
      const iconNode = document.createElement("span");
      iconNode.className = "lht-page-hero__icon";
      iconNode.setAttribute("aria-hidden", "true");
      iconNode.textContent = icon;
      heading.appendChild(iconNode);
    }
    const titleNode = document.createElement("span");
    titleNode.textContent = title;
    heading.appendChild(titleNode);
    titleMain.appendChild(heading);

    if (helpHtml) {
      const help = document.createElement("lht-help-tooltip");
      help.setAttribute("label", helpLabel);
      if (useWideHelp) {
        help.setAttribute("wide", "");
      }
      help.innerHTML = helpHtml;
      titleMain.appendChild(help);
    }

    topRow.appendChild(titleMain);

    if (showMenu) {
      const actions = document.createElement("span");
      actions.className = "lht-page-hero__actions";
      const menu = document.createElement("lht-page-menu");
      menu.setAttribute("home-href", homeHref);
      menu.setAttribute("home-label", homeLabel);
      actions.appendChild(menu);
      topRow.appendChild(actions);
    }

    this.appendChild(topRow);

    if (subtitle) {
      const subtitleNode = document.createElement("div");
      subtitleNode.className = "lht-page-hero__subtitle";
      subtitleNode.textContent = subtitle;
      this.appendChild(subtitleNode);
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
if (!customElements.get("lht-text-field-help")) {
  customElements.define("lht-text-field-help", LhtTextFieldHelp);
}
if (!customElements.get("lht-select-help")) {
  customElements.define("lht-select-help", LhtSelectHelp);
}
if (!customElements.get("lht-file-select")) {
  customElements.define("lht-file-select", LhtFileSelect);
}
if (!customElements.get("lht-loading-overlay")) {
  customElements.define("lht-loading-overlay", LhtLoadingOverlay);
}
if (!customElements.get("lht-toast")) {
  customElements.define("lht-toast", LhtToast);
}
if (!customElements.get("lht-error-alert")) {
  customElements.define("lht-error-alert", LhtErrorAlert);
}
if (!customElements.get("lht-input-mode-toggle")) {
  customElements.define("lht-input-mode-toggle", LhtInputModeToggle);
}
if (!customElements.get("lht-preview-output")) {
  customElements.define("lht-preview-output", LhtPreviewOutput);
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
if (!customElements.get("lht-page-hero")) {
  customElements.define("lht-page-hero", LhtPageHero);
}
if (!customElements.get("lht-page-menu")) {
  customElements.define("lht-page-menu", LhtPageMenu);
}
