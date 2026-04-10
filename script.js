const API_KEY = "acf65459";
const BASE_URL = "https://www.omdbapi.com/";

let allMovies = [];
let filteredMovies = [];
let currentQuery = "";
let currentPage = 1;
let totalResults = 0;

const searchForm = document.getElementById("search-form");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const filterType = document.getElementById("filter-type");
const sortBy = document.getElementById("sort-by");
const moviesContainer = document.getElementById("movies-container");
const loadMoreBtn = document.getElementById("load-more-btn");

async function fetchMovies(query, page = 1) {
  try {
    hideMessage();
    showLoading(true);

    const res = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&page=${page}&apikey=${API_KEY}`);
    const data = await res.json();

    if (data.Response === "False") {
      if (page === 1) {
        allMovies = [];
        filteredMovies = [];
        renderMovies([]);
        renderLoadMore();
        showMessage("No results found");
      }
      return;
    }

    totalResults = Number(data.totalResults) || 0;
    currentPage = page;

    if (page === 1) {
      allMovies = data.Search;
    } else {
      allMovies = [...allMovies, ...data.Search];
    }

    filteredMovies = [...allMovies];
    renderMovies(filteredMovies);
    renderLoadMore();

  } catch (error) {
    console.error(error);
    showMessage("Something went wrong");
  } finally {
    showLoading(false);
  }
}

function renderMovies(movies) {
  const container = moviesContainer;
  document.getElementById("message")?.classList.add("hidden");

  container.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x420?text=No+Cover"}" alt="${movie.Title}">
      <div class="movie-card-body">
        <div>
          <h3 class="movie-title">${movie.Title}</h3>
          <p class="movie-year">${movie.Year} · ${movie.Type || "Movie"}</p>
        </div>
        <button class="add-watchlist" data-imdbid="${movie.imdbID}">Add to Watchlist</button>
      </div>
    </div>
  `).join("");
}

function renderLoadMore() {
  const remaining = totalResults - allMovies.length;
  if (remaining > 0) {
    loadMoreBtn.classList.remove("hidden");
    loadMoreBtn.textContent = `Load More (${Math.min(10, remaining)} more)`;
  } else {
    loadMoreBtn.classList.add("hidden");
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    currentQuery = query;
    fetchMovies(query, 1);
  }
});

searchBtn?.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    currentQuery = query;
    fetchMovies(query, 1);
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      currentQuery = query;
      fetchMovies(query, 1);
    }
  }
});

filterType.addEventListener("change", () => {
  const type = filterType.value;
  filteredMovies = allMovies.filter(movie => {
    if (!type) return true;
    return movie.Type === type;
  });
  renderMovies(filteredMovies);
});

sortBy.addEventListener("change", () => {
  const value = sortBy.value;
  let sorted = [...filteredMovies];

  if (value === "year-asc") {
    sorted.sort((a, b) => Number(a.Year) - Number(b.Year));
  } else if (value === "year-desc") {
    sorted.sort((a, b) => Number(b.Year) - Number(a.Year));
  } else if (value === "title-asc") {
    sorted.sort((a, b) => a.Title.localeCompare(b.Title));
  } else if (value === "title-desc") {
    sorted.sort((a, b) => b.Title.localeCompare(a.Title));
  }

  filteredMovies = sorted;
  renderMovies(filteredMovies);
});

function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  const exists = watchlist.find(item => item.imdbID === movie.imdbID);

  if (!exists) {
    watchlist.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    renderWatchlist();
  }
}

function removeFromWatchlist(id) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(movie => movie.imdbID !== id);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

moviesContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".add-watchlist");
  if (!button) return;
  const id = button.dataset.imdbid;
  const movie = filteredMovies.find(item => item.imdbID === id) || allMovies.find(item => item.imdbID === id);
  if (movie) addToWatchlist(movie);
});

function renderWatchlist() {
  const container = document.getElementById("watchlist-container");
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (!watchlist.length) {
    container.innerHTML = `<p class="watchlist-empty">Your watchlist is empty. Add a title to save it here.</p>`;
    return;
  }

  container.innerHTML = watchlist.map(movie => `
    <div class="watchlist-item">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/80x120?text=No+Cover"}" alt="${movie.Title}">
      <p>${movie.Title}</p>
      <button onclick="removeFromWatchlist('${movie.imdbID}')">✖</button>
    </div>
  `).join("");
}

function showLoading(isLoading) {
  const loading = document.getElementById("loading");
  loading.classList.toggle("hidden", !isLoading);
  if (isLoading) {
    document.getElementById("message")?.classList.add("hidden");
  }
}

function showMessage(msg) {
  const message = document.getElementById("message");
  message.textContent = msg;
  message.classList.remove("hidden");
}

function hideMessage() {
  document.getElementById("message")?.classList.add("hidden");
}

const toggle = document.getElementById("theme-toggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("invert-theme");
});

loadMoreBtn?.addEventListener("click", () => {
  if (!currentQuery) return;
  fetchMovies(currentQuery, currentPage + 1);
});

function loadRandomMovies() {
  const randomQueries = ["star", "love", "dark", "hero", "space", "dream", "city", "wild"];
  const query = randomQueries[Math.floor(Math.random() * randomQueries.length)];
  currentQuery = query;
  fetchMovies(query, 1);
}

window.addEventListener("DOMContentLoaded", () => {
  renderWatchlist();
  loadRandomMovies();
});
