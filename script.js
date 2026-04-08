
const API_KEY = "acf65459";
const BASE_URL = "https://www.omdbapi.com/";

let allMovies = [];
let filteredMovies = [];

const searchForm = document.getElementById("search-form");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const filterType = document.getElementById("filter-type");
const sortBy = document.getElementById("sort-by");
const moviesContainer = document.getElementById("movies-container");
const watchlistToggle = document.getElementById("watchlist-toggle");
const watchlistSection = document.getElementById("watchlist");

async function fetchMovies(query) {
  try {
    hideMessage();
    showLoading(true);

    const res = await fetch(`${BASE_URL}?s=${query}&apikey=${API_KEY}`);
    const data = await res.json();

    if (data.Response === "False") {
      showMessage("No results found");
      renderMovies([]);
      return;
    }

    allMovies = data.Search;
    filteredMovies = [...allMovies];

    renderMovies(filteredMovies);

  } catch (error) {
    console.error(error);
    showMessage("Something went wrong");
  } finally {
    showLoading(false);
  }
}

function renderMovies(movies) {
  const container = document.getElementById("movies-container");
  document.getElementById("message")?.classList.add("hidden");

  container.innerHTML = movies.map(movie => `
    <div class="movie-card bg-gray-800 rounded-xl overflow-hidden shadow hover:scale-105 transition">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : ""}" 
           alt="${movie.Title}" 
           class="w-full h-64 object-cover">

      <div class="p-3">
        <h3 class="text-sm font-semibold">${movie.Title}</h3>
        <p class="text-xs text-gray-400">${movie.Year}</p>

        <button 
          class="mt-2 w-full bg-blue-600 py-1 rounded hover:bg-blue-500 add-watchlist"
          data-imdbid="${movie.imdbID}"
        >
          Add to Watchlist
        </button>
      </div>
    </div>
  `).join("");
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) fetchMovies(query);
});

searchBtn?.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchMovies(query);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) fetchMovies(query);
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
  } 
  else if (value === "year-desc") {
    sorted.sort((a, b) => Number(b.Year) - Number(a.Year));
  } 
  else if (value === "title-asc") {
    sorted.sort((a, b) => a.Title.localeCompare(b.Title));
  } 
  else if (value === "title-desc") {
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
  const movie = filteredMovies.find((item) => item.imdbID === id)
    || allMovies.find((item) => item.imdbID === id);

  if (movie) addToWatchlist(movie);
});

function renderWatchlist() {
  const container = document.getElementById("watchlist-container");
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  container.innerHTML = watchlist.map(movie => `
    <div class="flex items-center gap-2 bg-gray-700 p-2 rounded">
      <img src="${movie.Poster}" class="w-10 h-14 object-cover">
      <div class="flex-1">
        <p class="text-sm">${movie.Title}</p>
      </div>
      <button 
        onclick="removeFromWatchlist('${movie.imdbID}')"
        class="text-red-400"
      >
        ✖
      </button>
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
  document.body.classList.toggle("bg-gray-900");
});

watchlistToggle?.addEventListener("click", () => {
  const isHidden = watchlistSection.classList.toggle("hidden");
  watchlistToggle.textContent = isHidden ? "Show Watchlist" : "Hide Watchlist";
  if (!isHidden) renderWatchlist();
});

function loadRandomMovies() {
  const randomQueries = ["star", "love", "dark", "hero", "space", "dream", "city", "wild"];
  const query = randomQueries[Math.floor(Math.random() * randomQueries.length)];
  fetchMovies(query);
}

window.addEventListener("DOMContentLoaded", () => {
  renderWatchlist();
  loadRandomMovies();
});