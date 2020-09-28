import "./styles.css";
import $ from "jquery";

//UIKit.modal({});
/**
 * Usage:
 *
 * Show a modal
 * UIKitModal = UIKit.modal('show',#id,{isModal, onClose})
 *
 * Initialize a modal
 * UIKitModal = UIKit.modal('init', #id,{#activator, isModal, onClose})
 *
 * Initialize all modals in a container
 * [UIKitModal] = UIKit.moal('all', .activatorClass);
 *
 * Close a modal
 * UIKitModal.close();
 */

const UIKit = {
  modals: new Map(),
  modal: (cmd, selector, options) => {
    let defaultOpts = {
      isModal: false,
      onClose: (f) => f
    };
    if (selector === undefined) throw new Error("Invalid modal selector.");

    switch (cmd) {
      case "init":
        if (UIKit.modals.has(selector)) return UIKit.modals.get(selector);

        options = Object.assign(defaultOpts, options || {}, { id: selector });
        UIKit.modals.set(selector, new UIKitModal(options));

        return UIKit.modals.get(selector);
      case "show":
        options = Object.assign(defaultOpts, options || {}, { id: selector });
        if (!UIKit.modals.has(selector)) {
          UIKit.modal("init", selector, options);
        }

        let modal = UIKit.modals.get(selector);
        if (modal) {
          modal.show(options.onClose);
        }
        break;
      case "all":
      default:
        if ($(selector).length < 1) return;
        $(selector).map((i, activator) => {
          let selector = activator.hash;
          UIKit.modal("init", selector, { activator });
        });
    }
  }
};

function UIKitModal({
  id,
  isModal = false,
  activator = null,
  onClose = (f) => f
}) {
  let _elm = $(id),
    _onClose = null;

  this.init = () => {
    // prep the container div
    let container = _elm.parent();
    if (!container.data("uikit-modal-init")) {
      container.data("uikit-modal-init", true);
      container.css({
        position: "absolute",
        top: "0px",
        left: "0px",
        background: "#000",
        width: "100%",
        height: "100%",
        opacity: "50%",
        "justify-content": "center",
        "align-items": "center",
        display: "none"
      });
    }

    // set white background for the modal
    _elm.css({ background: "white", "min-width": "20%", "min-height": "50px" });

    // add close handler
    let handler = $(
      '<a href="#" style="text-decoration:none;position:absolute;color:#666;top:10px;right:10px;">x</a>'
    );
    handler.click(this.close);
    _elm.css({ position: "relative" }).append(handler);

    // register activator click event
    if (activator) {
      if (typeof activator === "string" || activator instanceof HTMLElement)
        activator = $(activator);
      if (activator.length > 0) $(activator).click((e) => this.show());
    }

    console.log(_onClose, onClose);
  };

  this.show = (onCloseCustom) => {
    if (onCloseCustom !== undefined && onCloseCustom !== null)
      _onClose = onCloseCustom;

    _elm.parent().css({ display: "flex", "z-index": 1000 }).show();
    _elm.fadeIn();
    _elm.click((e) => {
      e.stopPropagation();
    });
    if (!isModal) _elm.parent().click(this.close);
  };

  this.close = (e) => {
    e.stopPropagation();
    _elm.fadeOut();
    _elm.parent().hide();

    if (_onClose !== null) {
      console.log(_onClose);
      _onClose();
      _onClose = null;
    } else {
      onClose();
    }
  };

  this.init();
}

UIKit.modal("init", ".modal", {
  activator: ".modal-activator",
  isModal: true
});

// UIKit.modal("show", ".modal", {
//   onClose: () => {
//     alert("modal is closed");
//   }
// });
