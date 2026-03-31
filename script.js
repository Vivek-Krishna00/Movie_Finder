const apiKey = "acf65459";
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const movieGrid = document.getElementById("movie-grid");
const loadingIndicator = document.getElementById("loading");

searchForm.addEventListener("submit", async event => {
    event.preventDefault();
    const movieTitle = searchInput.value.trim();

    if (movieTitle) {
        try {
            loadingIndicator.classList.remove("hidden");
            movieGrid.innerHTML = ""; 

            const movieData = await getMovieData(movieTitle);
            displayMovieInfo(movieData);
        } catch (error) {
            console.error(error);
            displayError("Could not fetch movie data. Please check your connection.");
        } finally {
            loadingIndicator.classList.add("hidden");
        }
    } else {
        displayError("Please enter a movie title");
    }
});

async function getMovieData(movieTitle) {
    const apiUrl = `https://www.omdbapi.com/?s=${movieTitle}&apikey=${apiKey}&type=movie`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Could not fetch movie data");
    }
    
    return await response.json();
}

function displayMovieInfo(data) {
    movieGrid.innerHTML = "";

    if (data.Response === "True") {
        const movies = data.Search;
        
        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            const poster = document.createElement("img");
            poster.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster";
            poster.alt = movie.Title;

            const title = document.createElement("h3");
            title.textContent = movie.Title;
            title.classList.add("movie-title");

            const year = document.createElement("p");
            year.textContent = movie.Year;
            year.classList.add("movie-year");

            movieCard.appendChild(poster);
            movieCard.appendChild(title);
            movieCard.appendChild(year);
            
            movieGrid.appendChild(movieCard);
        });
    } else {
        displayError(data.Error); 
    }
}

function displayError(message) {
    movieGrid.innerHTML = "";
    
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.style.textAlign = "center";
    errorDisplay.style.gridColumn = "1 / -1"; 
    
    movieGrid.appendChild(errorDisplay);
}