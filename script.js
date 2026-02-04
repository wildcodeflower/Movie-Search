// Here is your key: bdc5a3b7
// OMDb API: http://www.omdbapi.com/?i=tt3896198&apikey=bdc5a3b7

const API_KEY = "bdc5a3b7";
const RESULTS_PER_PAGE = 6;

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsEl = document.getElementById("results");
const errorEl = document.getElementById("error");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const sortSelect = document.getElementById("sortSelect");
const homeLink = document.getElementById("homeLink");

let allResults = [];
let visibleCount = RESULTS_PER_PAGE;

searchBtn.addEventListener("click", searchMovies);
sortSelect.addEventListener("change", applySort);
loadMoreBtn.addEventListener("click", showMore);
homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  loadLatestMovies();
});

window.addEventListener("DOMContentLoaded", loadLatestMovies);

async function loadLatestMovies() {
  visibleCount = RESULTS_PER_PAGE;
  sortSelect.value = "";
  resultsEl.innerHTML = "";
  errorEl.textContent = "";
  loadMoreBtn.classList.add("hidden");

  const currentYear = new Date().getFullYear();

  // Try current year first, then fallback
  const yearsToTry = [currentYear, currentYear - 1];

  for (const year of yearsToTry) {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=the&type=movie&y=${year}`
      );

      const data = await response.json();

      if (data.Response === "True") {
        allResults = data.Search
          .filter(item => item.Type === "movie")
          .sort((a, b) => parseInt(b.Year) - parseInt(a.Year));

        renderResults();
        return; // ✅ success, stop trying
      }

    } catch (err) {
      console.error(err);
    }
  }
  // If all attempts fail
  errorEl.textContent = "Unable to load latest movies.";
}

async function searchMovies() {
  const query = searchInput.value.trim();
  resultsEl.innerHTML = "";
  errorEl.textContent = "";
  loadMoreBtn.classList.add("hidden");
  visibleCount = RESULTS_PER_PAGE;

  if (!query) {
    errorEl.textContent = "Please enter a movie title.";
    return;
  }

  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
    const data = await response.json();

    if (data.Response === "False") {
      errorEl.textContent = data.Error;
      return;
    }

    allResults = data.Search;
    applySort();

  } catch (err) {
    console.error(err);
    errorEl.textContent = "Something went wrong. Try again.";
  }
}

function applySort() {
  const sortBy = sortSelect.value;

  if (sortBy === "title") {
    allResults.sort((a, b) => a.Title.localeCompare(b.Title));
  }

  if (sortBy === "year") {
    allResults.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  }

  renderResults();
}

function renderResults() {
  resultsEl.innerHTML = "";

  allResults.slice(0, visibleCount).forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    const poster = movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster";

    card.innerHTML = `
      <img src="${poster}" alt="${movie.Title}" />
      <div class="card-content">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      window.open(`https://www.imdb.com/title/${movie.imdbID}/`, "_blank");
    });

    resultsEl.appendChild(card);
  });

  loadMoreBtn.classList.toggle("hidden", visibleCount >= allResults.length);
}

function showMore() {
  visibleCount += RESULTS_PER_PAGE;
  renderResults();
}