//宣告各種需要ＡＰＩ的網址變數,以利之後使用
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

//宣告movies變數來存放資料
const movies = []
const MOVIES_PER_PAGE = 12
let filterMovies = [] //將此變數從蒐尋器變數出拉出變成全域變數

//節取節點所需變數
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#searchForm")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  //最後渲染上去
  dataPanel.innerHTML = rawHtml
}

//新增收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已在收藏清單之中")
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//分頁器切割後長度
function getMoviesByPage(page) {
  //運用三元運算子來做條件判斷 + 計算起始頁面
  const data = filterMovies.length ? filterMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  //回傳切割完的陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//分頁器樣式
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  //製作template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
      `
  }
  paginator.innerHTML = rawHTML
}

//分頁監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)

  //更新畫面
  renderMovieList(getMoviesByPage(page))

})

//監聽dataPanel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
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

//蒐尋器
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault() //新增preventDefault預防瀏覽器預設行為
  const keyword = searchInput.value.trim().toLowerCase()

  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword))

  //若輸入空白則回到原頁面
  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  //基本for迴圈法
  //for (const movie of movies) {
  //if (movie.title.toLowerCase().includes(keyword)) {
  //filterMovies.push(movie)
  //}
  //}

  //重製分頁器
  renderPaginator(filterMovies.length)

  //預設顯示第一頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})

//抓取API電影清單
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(7))
  })
  .catch((err) => console.log(err))
