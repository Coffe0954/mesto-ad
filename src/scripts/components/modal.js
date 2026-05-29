const escHandler = (e) => {
  if (e.key === "Escape") {
    const activeModal = document.querySelector(".overlay-dialog_is-opened");
    if (activeModal) hideModal(activeModal);
  }
};

export const showModal = (modal) => {
  modal.classList.add("overlay-dialog_is-opened");
  document.addEventListener("keyup", escHandler);
};

export const hideModal = (modal) => {
  modal.classList.remove("overlay-dialog_is-opened");
  document.removeEventListener("keyup", escHandler);
};

export const attachModalHandlers = (modal) => {
  const closeBtn = modal.querySelector(".overlay-dialog__close");
  closeBtn.addEventListener("click", () => hideModal(modal));

  modal.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("overlay-dialog")) {
      hideModal(modal);
    }
  });
};
