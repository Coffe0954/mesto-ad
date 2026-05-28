const fetchTemplate = () => {
  return document
    .getElementById("photo-card-template")
    .content.querySelector(".photo-card")
    .cloneNode(true);
};

export const checkIfLiked = (btn) => btn.classList.contains("photo-card__like-button_is-active");

export const displayLikes = (btn, counter, likes, uid) => {
  const isMine = likes.some((u) => u._id === uid);
  counter.textContent = likes.length;
  btn.classList.toggle("photo-card__like-button_is-active", isMine);
};

export const removePhotoCard = (el) => el.remove();

export const createPhotoCard = (
  item,
  uid,
  { onPreview, onLike, onDelete }
) => {
  const el = fetchTemplate();
  const heartBtn = el.querySelector(".photo-card__like-button");
  const countLabel = el.querySelector(".photo-card__like-count");
  const trashBtn = el.querySelector(".photo-card__control-button_type_delete");
  const img = el.querySelector(".photo-card__image");

  img.src = item.link;
  img.alt = item.name;
  el.querySelector(".photo-card__title").textContent = item.name;

  displayLikes(heartBtn, countLabel, item.likes, uid);

  if (item.owner._id !== uid) {
    trashBtn.remove();
  } else {
    trashBtn.addEventListener("click", () => onDelete(el, item._id));
  }

  heartBtn.addEventListener("click", () => onLike(el, item._id, heartBtn, countLabel));
  img.addEventListener("click", () => onPreview({ name: item.name, link: item.link }));

  return el;
};
