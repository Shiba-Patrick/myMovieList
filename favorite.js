//宣告各種需要ＡＰＩ的網址變數,以利之後使用
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

//宣告movies變數來存放資料
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

//節取節點所需變數
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#searchForm")
const searchInput = document.querySelector("#search-input")

//印出電影基本資訊的html
function renderMovieList(data) {
  let rawHtml = ''

  data.forEach((item) => {
    //將編輯好的HTML格式放入依照格式放入需要變數,並且使用data-id在資料庫去撈出id資料
    rawHtml += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top"
              alt="movie post">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  //最後渲染上去
  dataPanel.innerHTML = rawHtml
}

//刪除功能
function removeFromFavorite(id) {
  if (!movies || !movies.length) return

  //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return

  //刪除該筆電影
  movies.splice(movieIndex, 1)

  //存回 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}

//監聽dataPanel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

//取出API電影的詳細資料
function showMovieModal(id) {
  //宣告所需要的欄位變數
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDescription = document.querySelector("#movie-modal-description")
  const modalDate = document.querySelector("#movie-modal-date")

  //運用API拉出每一筆ID的詳細資料:文字直接innerText,圖片等使用innerHTML
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDescription.innerText = data.description
    modalDate.innerText = data.release_date
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
    `
  })
}

renderMovieList(movies)
