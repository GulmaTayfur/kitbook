let bookList = [];
let basketList = [];

//toggle menu
const toggleModal = () => {
  const basketModal = document.querySelector(".basket_modal");
  basketModal.classList.toggle("active");
};

const toggleDarkMode = () => {
  const body = document.body;
  body.classList.toggle("dark-mode");

  const darkModeEnabled = body.classList.contains("dark-mode");
  localStorage.setItem("darkModeEnabled", darkModeEnabled);

  const lightModeToggle = document.getElementById("lightModeToggle");
  if (darkModeEnabled) {
    lightModeToggle.innerHTML = '<i class="bi bi-brightness-high"></i>';
  } else {
    lightModeToggle.innerHTML = '<i class="bi bi-moon"></i>';
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const storedDarkMode = localStorage.getItem("darkModeEnabled");
  if (storedDarkMode === "true") {
    document.body.classList.add("dark-mode");

    const lightModeToggle = document.getElementById("lightModeToggle");
    lightModeToggle.innerHTML = '<i class="bi bi-brightness-low"></i>';
  }
});

const getBooks = () => {
  fetch("./products.json")
    .then((res) => res.json())
    .then((books) => (bookList = books))
    .catch((err) => console.log(err));
};
getBooks();

const createBookStars = (starRate) => {
  //   console.log(starRate);
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i) {
      starRateHtml += ` <i class="bi bi-star-fill active"></i>`;
    } else {
      starRateHtml += ` <i class="bi bi-star-fill"></i>`;
    }
  }
  return starRateHtml;
};

const createBookItemsHtml = () => {
  const bookListEl = document.querySelector(".book_list");
  let bookListHtml = "";

  bookList.forEach((book, index) => {
    // console.log(book);
    bookListHtml += `
        <div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
        <div class="row book_card">
          <div class="col-6">
            <img
              src="${book.imgSource}"
              alt=""
              class="img-fluid shadow"
              width="258px"
              height="400px"
            />
          </div>
          <div class="col-6 d-flex flex-column justify-content-center gap-4">
            <div class="book_detail">
              <span class="fos gray fs-5">${book.author}</span> <br />
              <span class="fs-4 fw-bold">${book.name}</span> <br />
              <span class="book_star-rate">
               ${createBookStars(book.starRate)}
                <span class="gray">1938 reviews</span>
              </span>
            </div>
            <p class="book_description fos gray">
             ${book.description}
            </p>
            <div>
              <span class="black fw-bold fs-4 me-2">${book.price}tl</span>
              <span class="fs-4 fw-bold old_price">${
                book.oldPrice
                  ? `<span class="fs-4 fw-bold old_price">${book.oldPrice}tl</span>`
                  : ""
              }</span>
            </div>
            <button class="btn_purple" onClick="addBookToBasket(${
              book.id
            })">Sepete Ekle</button>
          </div>
        </div>
      </div>
        `;
  });
  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  POETRY: "Şiir",
  SELF_HELP: "Kişisel Gelişim",
  HOBBY: "Hobi",
  EDUCATION: "Eğitim",
  CHILDREN: "Çocuk",
  HISTORY: "Tarih",
  SCIENCE: "Bilim",
};
const createBookTypesHtml = () => {
  const filterEle = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (filterTypes.findIndex((filter) => filter == book.type) == -1) {
      filterTypes.push(book.type);
    }
  });
  // console.log(filterTypes);
  filterTypes.forEach((type, index) => {
    // console.log(type);
    filterHtml += ` <li onClick ="filterBooks(this)" data-types="${type}" class="${
      index == 0 ? "active" : null
    }" >${BOOK_TYPES[type] || type} </li>
        `;
  });

  filterEle.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.types;
  getBooks();
  if (bookType != "ALL") {
    bookList = bookList.filter((book) => book.type == bookType);
  }
  createBookItemsHtml();
};

const listBasketItems = () => {
  const basketListEl = document.querySelector(".basket_list");
  const basketCountEl = document.querySelector(".basket_count");
  const totalQuantity = basketList.reduce(
    (total, item) => total + item.quantity,
    0
  );
  basketCountEl.innerHTML = totalQuantity > 0 ? totalQuantity : null;
  const totalPriceEl = document.querySelector(".total_price");
  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `
    <li class="basket_item">
            <img src="${item.product.imgSource}" 
            width="100" 
            height="100" />
            <div class="basket_item-info">
              <h3 class="book_name">${item.product.name}</h3>
              <span class="book_price">${item.product.price}tl</span><br />
              <span class="book_remove" onClick="removeItemBasket(${item.product.id})">Sepetten Kaldır</span>
            </div>
            <div class="book_count">
              <span class="decrease" onClick="decreaseItemToBasket(${item.product.id})">-</span>
              <span class="mx-2">${item.quantity}</span>
              <span class="increase" onClick="increaseItemToBasket(${item.product.id})">+</span>
            </div>
          </li>`;
  });
  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `
  <li class="basket_item">Sepette herhangi bir ürün bulunmuyor. Sepete ürün ekleyin.</li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? "Toplam:" + totalPrice + "tl" : null;
};

const addBookToBasket = (bookId) => {
  let findedBook = bookList.find((book) => book.id == bookId);
  // console.log(findedBook);
  if (findedBook) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );
    if (basketAlreadyIndex == -1) {
      let addItem = { quantity: 1, product: findedBook };
      basketList.push(addItem);
      // console.log(basketList);
    } else {
      basketList[basketAlreadyIndex].quantity += 1;
      // console.log(basketList);
    }
  }
  const btnCheck = document.querySelector(".btnCheck");
  btnCheck.style.display = "block";
  listBasketItems();
};

const removeItemBasket = (bookId) => {
  const findIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findIndex != -1) {
    basketList.splice(findIndex, 1);
  }
  const btnCheck = document.querySelector(".btnCheck");
  btnCheck.style.display = "none";
  listBasketItems();
};

const decreaseItemToBasket = (bookId) => {
  const findIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findIndex != -1) {
    if (basketList[findIndex].quantity != 1) {
      basketList[findIndex].quantity -= 1;
    } else {
      removeItemBasket(bookId);
    }
  }
  listBasketItems();
};

const increaseItemToBasket = (bookId) => {
  const findIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findIndex != -1) {
    basketList[findIndex].quantity += 1;
  }
  listBasketItems();
};

//datanın gelmesini bekledik
setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 400);
