var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// js/index.js
var index_exports = {};
__export(index_exports, {
  close: () => close,
  default: () => index_default,
  getOpen: () => getOpen,
  init: () => init,
  position: () => position
});
module.exports = __toCommonJS(index_exports);

// js/popover.js
var GAP = 8;
var EDGE = 8;
var openPopover = null;
var openChip = null;
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var popoverFor = (chip) => chip.ownerDocument.getElementById(chip.dataset.fileChip);
var position = (chip, popover) => {
  const rect = chip.getBoundingClientRect();
  const width = popover.offsetWidth;
  const height = popover.offsetHeight;
  let top = rect.bottom + GAP;
  const left = clamp(rect.left, EDGE, Math.max(EDGE, window.innerWidth - width - EDGE));
  if (top + height > window.innerHeight) {
    const above = rect.top - height - GAP;
    if (above >= EDGE) {
      top = above;
    }
  }
  top = clamp(top, EDGE, window.innerHeight - height - EDGE);
  popover.style.top = "0px";
  popover.style.left = "0px";
  const origin = popover.getBoundingClientRect();
  popover.style.top = `${Math.round(top - origin.top)}px`;
  popover.style.left = `${Math.round(left - origin.left)}px`;
};
var close = ({ restoreFocus = false } = {}) => {
  if (!openPopover) {
    return;
  }
  const popover = openPopover;
  const chip = openChip;
  const hadFocus = popover.contains(popover.ownerDocument.activeElement);
  popover.hidden = true;
  chip?.setAttribute("aria-expanded", "false");
  openPopover = null;
  openChip = null;
  if (restoreFocus && hadFocus) {
    chip?.focus();
  }
};
var open = (chip) => {
  close();
  const popover = popoverFor(chip);
  if (!popover) {
    return null;
  }
  popover.hidden = false;
  chip.setAttribute("aria-expanded", "true");
  openPopover = popover;
  openChip = chip;
  position(chip, popover);
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => openPopover === popover && position(chip, popover));
  }
  return popover;
};
var getOpen = () => openPopover;
var getOpenChip = () => openChip;

// js/marks.js
var DEFAULT_MARKED = "Marked";
var DEFAULT_UNMARKED = "Remove on save";
var targetFor = (chip) => chip.closest("[data-file-chips]")?.querySelector("[data-file-chips-bucket]") ?? chip.closest("form");
var findInput = (target, name, id) => [...target.querySelectorAll('input[type="hidden"]')].find((input) => input.name === name && input.value === id) ?? null;
var render = (chip, button, marked) => {
  chip.classList.toggle("fc-chip--marked", marked);
  button.classList.toggle("fc-btn--active", marked);
  button.setAttribute("aria-pressed", String(marked));
  const label = button.querySelector("[data-file-chip-remove-label]") ?? button;
  label.textContent = marked ? button.dataset.labelMarked ?? DEFAULT_MARKED : button.dataset.labelUnmarked ?? DEFAULT_UNMARKED;
};
var buttonIn = (popover) => popover.querySelector("[data-file-chip-remove]");
var sync = (chip, popover) => {
  const button = buttonIn(popover);
  const target = targetFor(chip);
  if (!button || !target) {
    return;
  }
  render(chip, button, findInput(target, button.dataset.fileChipInput, button.dataset.fileChipId) !== null);
};
var toggle = (chip, button) => {
  const target = targetFor(chip);
  if (!target) {
    console.warn("[FileChips] No [data-file-chips-bucket] or <form> found for this chip; cannot mark it for removal.");
    return;
  }
  const name = button.dataset.fileChipInput;
  const id = button.dataset.fileChipId;
  const existing = findInput(target, name, id);
  if (existing) {
    existing.remove();
  } else {
    const input = chip.ownerDocument.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = id;
    target.appendChild(input);
  }
  const marked = !existing;
  render(chip, button, marked);
  chip.dispatchEvent(new CustomEvent("file-chips:change", { bubbles: true, detail: { id, input: name, marked } }));
};

// js/index.js
var documents = /* @__PURE__ */ new Map();
var handled = (doc, element) => [...documents.get(doc)?.roots ?? []].some((root) => root.contains(element));
var openWithState = (chip) => {
  const popover = open(chip);
  if (popover) {
    sync(chip, popover);
  }
  return popover;
};
var listenersFor = (doc) => ({
  click(event) {
    const target = event.target;
    const remove = target.closest?.("[data-file-chip-remove]");
    if (remove && getOpen()?.contains(remove)) {
      toggle(getOpenChip(), remove);
      return;
    }
    const chip = target.closest?.("[data-file-chip]");
    if (!chip || !handled(doc, chip)) {
      return;
    }
    event.preventDefault();
    if (getOpenChip() === chip) {
      close();
    } else {
      openWithState(chip);
    }
  },
  mousedown(event) {
    const popover = getOpen();
    if (popover && !popover.contains(event.target) && !event.target.closest?.("[data-file-chip]")) {
      close();
    }
  },
  keydown(event) {
    if (event.key === "Escape" && getOpen()) {
      close({ restoreFocus: true });
    }
  },
  reposition() {
    const popover = getOpen();
    if (popover) {
      position(getOpenChip(), popover);
    }
  }
});
var listen = (doc, listeners, method) => {
  doc[method]("click", listeners.click);
  doc[method]("mousedown", listeners.mousedown);
  doc[method]("keydown", listeners.keydown);
  doc.defaultView?.[method]("resize", listeners.reposition);
  doc.defaultView?.[method]("scroll", listeners.reposition, true);
};
var init = ({ root = document } = {}) => {
  const doc = root.ownerDocument ?? root;
  if (handled(doc, root)) {
    return () => {
    };
  }
  if (!documents.has(doc)) {
    const listeners = listenersFor(doc);
    documents.set(doc, { roots: /* @__PURE__ */ new Set(), listeners });
    listen(doc, listeners, "addEventListener");
  }
  const entry = documents.get(doc);
  entry.roots.add(root);
  return () => {
    if (!entry.roots.delete(root)) {
      return;
    }
    if (getOpenChip() && root.contains(getOpenChip())) {
      close();
    }
    if (entry.roots.size === 0) {
      listen(doc, entry.listeners, "removeEventListener");
      documents.delete(doc);
    }
  };
};
var FileChips = {
  init,
  open: openWithState,
  close: () => close(),
  getOpen,
  position
};
var index_default = FileChips;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  close,
  getOpen,
  init,
  position
});
module.exports = module.exports.default;
