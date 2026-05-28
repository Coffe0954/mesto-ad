import {
  createPhotoCard,
  checkIfLiked,
  displayLikes,
  removePhotoCard,
} from "./components/card.js";
import {
  showModal,
  hideModal,
  attachModalHandlers,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setAvatar,
  postCard,
  deleteCardApi,
  changeLikeCardStatus,
} from "./components/api.js";

const validationSettings = {
  formSelector: ".overlay-dialog__form",
  inputSelector: ".overlay-dialog__input",
  submitButtonSelector: ".overlay-dialog__button",
  inactiveButtonClass: "overlay-dialog__button_disabled",
  inputErrorClass: "overlay-dialog__input_type_error",
  errorClass: "overlay-dialog__error_visible",
};

let userId;
let cardToDeleteInfo = {};

const gridContainer = document.querySelector(".photo-grid__list");

const editPopup = document.querySelector(".overlay-dialog_type_edit");
const addPopup = document.querySelector(".overlay-dialog_type_new-photo-card");
const previewPopup = document.querySelector(".overlay-dialog_type_image");
const avatarPopup = document.querySelector(".overlay-dialog_type_edit-avatar");
const confirmPopup = document.querySelector(".overlay-dialog_type_remove-photo-card");

const editForm = editPopup.querySelector(".overlay-dialog__form");
const nameInput = editForm.querySelector(".overlay-dialog__input_type_name");
const jobInput = editForm.querySelector(".overlay-dialog__input_type_description");

const addForm = addPopup.querySelector(".overlay-dialog__form");
const placeInput = addForm.querySelector(".overlay-dialog__input_type_card-name");
const linkInput = addForm.querySelector(".overlay-dialog__input_type_url");

const avatarForm = avatarPopup.querySelector(".overlay-dialog__form");
const avatarUrlInput = avatarForm.querySelector(".overlay-dialog__input");

const previewImg = previewPopup.querySelector(".overlay-dialog__image");
const previewTitle = previewPopup.querySelector(".overlay-dialog__caption");
const userName = document.querySelector(".user-panel__title");
const userJob = document.querySelector(".user-panel__description");
const userAvatar = document.querySelector(".user-panel__image");

const editBtn = document.querySelector(".user-panel__edit-button");
const addBtn = document.querySelector(".user-panel__add-button");

const confirmForm = confirmPopup.querySelector(".overlay-dialog__form");

const logoIcon = document.querySelector(".app-header__logo");
const statsPopup = document.querySelector(".overlay-dialog_type_info");
const statsInfo = statsPopup.querySelector(".overlay-dialog__info");
const statsHeader = statsPopup.querySelector(".overlay-dialog__title");
const statsSubheader = statsPopup.querySelector(".overlay-dialog__text");
const statsUsers = statsPopup.querySelector(".overlay-dialog__list");

const setBtnLoading = (
  loading,
  btn,
  defaultText = "Сохранить",
  loadingText = "Сохранение..."
) => {
  btn.textContent = loading ? loadingText : defaultText;
};

const onImagePreview = ({ name, link }) => {
  previewImg.src = link;
  previewImg.alt = name;
  previewTitle.textContent = name;
  showModal(previewPopup);
};

const onLikeToggle = (cardEl, cardId, likeBtn, likeCounter) => {
  const liked = checkIfLiked(likeBtn);
  changeLikeCardStatus(cardId, liked)
    .then((res) => {
      displayLikes(likeBtn, likeCounter, res.likes, userId);
    })
    .catch(console.error);
};

const onDeleteRequest = (cardEl, cardId) => {
  cardToDeleteInfo = { element: cardEl, id: cardId };
  showModal(confirmPopup);
};

const cardCallbacks = {
  onPreview: onImagePreview,
  onLike: onLikeToggle,
  onDelete: onDeleteRequest,
};

const addCardToGrid = (data, pos = "append") => {
  const card = createPhotoCard(data, userId, cardCallbacks);
  gridContainer[pos](card);
};

const updateProfileUI = ({ name, about, avatar }) => {
  userName.textContent = name;
  userJob.textContent = about;
  if (avatar) userAvatar.style.backgroundImage = `url('${avatar}')`;
};

const openDialog = (modal, form, reset = false) => {
  if (reset) form.reset();
  clearValidation(form, validationSettings);
  showModal(modal);
};

const formatDateRu = (d) =>
  d.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createStatLine = (key, val) => {
  const temp = document
    .querySelector("#overlay-dialog-info-definition-template")
    .content.cloneNode(true);
  temp.querySelector(".overlay-dialog__info-term").textContent = key;
  temp.querySelector(".overlay-dialog__info-description").textContent = val;
  return temp;
};

const createBadge = (name) => {
  const temp = document
    .querySelector("#overlay-dialog-info-user-preview-template")
    .content.cloneNode(true);
  temp.querySelector(".overlay-dialog__list-item").textContent = name;
  return temp;
};

const onLogoClick = () => {
  getCardList()
    .then((list) => {
      statsInfo.innerHTML = "";
      statsUsers.innerHTML = "";
      statsHeader.textContent = "Статистика карточек";
      statsSubheader.textContent = "Все пользователи";

      if (list.length > 0) {
        const users = new Map();
        list.forEach((c) => {
          const oid = c.owner._id;
          if (users.has(oid)) users.get(oid).count++;
          else users.set(oid, { name: c.owner.name, count: 1 });
        });

        let max = 0;
        users.forEach((u) => { if (u.count > max) max = u.count; });

        statsInfo.append(createStatLine("Всего карточек:", list.length));
        statsInfo.append(createStatLine("Первая создана:", formatDateRu(new Date(list[list.length - 1].createdAt))));
        statsInfo.append(createStatLine("Последняя создана:", formatDateRu(new Date(list[0].createdAt))));
        statsInfo.append(createStatLine("Всего пользователей:", users.size));
        statsInfo.append(createStatLine("Максимум карточек от одного:", max));

        users.forEach((u) => statsUsers.append(createBadge(u.name)));
      }
      showModal(statsPopup);
    })
    .catch(console.error);
};

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setBtnLoading(true, btn);
  setUserInfo({ name: nameInput.value, about: jobInput.value })
    .then((data) => {
      updateProfileUI(data);
      hideModal(editPopup);
    })
    .catch(console.error)
    .finally(() => setBtnLoading(false, btn));
});

avatarForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setBtnLoading(true, btn);
  setAvatar(avatarUrlInput.value)
    .then((data) => {
      updateProfileUI({ name: userName.textContent, about: userJob.textContent, avatar: data.avatar });
      hideModal(avatarPopup);
    })
    .catch(console.error)
    .finally(() => setBtnLoading(false, btn));
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setBtnLoading(true, btn, "Создать", "Создание...");
  postCard({ name: placeInput.value, link: linkInput.value })
    .then((data) => {
      addCardToGrid(data, "prepend");
      hideModal(addPopup);
    })
    .catch(console.error)
    .finally(() => setBtnLoading(false, btn, "Создать"));
});

confirmForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setBtnLoading(true, btn, "Да", "Удаление...");
  deleteCardApi(cardToDeleteInfo.id)
    .then(() => {
      removePhotoCard(cardToDeleteInfo.element);
      hideModal(confirmPopup);
    })
    .catch(console.error)
    .finally(() => setBtnLoading(false, btn, "Да"));
});

editBtn.addEventListener("click", () => {
  nameInput.value = userName.textContent;
  jobInput.value = userJob.textContent;
  openDialog(editPopup, editForm);
});

userAvatar.addEventListener("click", () => openDialog(avatarPopup, avatarForm, true));
addBtn.addEventListener("click", () => openDialog(addPopup, addForm, true));
logoIcon.addEventListener("click", onLogoClick);

document.querySelectorAll(".overlay-dialog").forEach(attachModalHandlers);

enableValidation(validationSettings);

Promise.all([getUserInfo(), getCardList()])
  .then(([user, cards]) => {
    userId = user._id;
    updateProfileUI(user);
    cards.forEach((c) => addCardToGrid(c));
  })
  .catch(console.error);
