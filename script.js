// My OMDb key: bdc5a3b7
// OMDb API: http://www.omdbapi.com/?i=tt3896198&apikey=bdc5a3b7

const API_KEY = "bdc5a3b7";
const RESULTS_PER_PAGE = 6;

// DOM reference
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsEl = document.getElementById("results");
const errorEl = document.getElementById("error");
const sortSelect = document.getElementById("sortSelect");
const loadingEl = document.getElementById("loading");
const heroEl = document.getElementById("hero");
const heroTitle = heroEl.querySelector(".hero-title");
const homeLink = document.getElementById("homeLink");

// App state
let allResults = [];

/* --------------------------------
   Event Listeners
--------------------------------- */

searchBtn.addEventListener("click", searchMovies);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchMovies();
  }
});

sortSelect.addEventListener("change", applySort);

homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  resetHome();
});

/* --------------------------------
   Core Logic
--------------------------------- */

async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return;

  // Animate hero
  heroEl.classList.add("compact");
  heroTitle.classList.add("hidden");

  // Reset UI state
  resultsEl.innerHTML = "";
  errorEl.textContent = "";

  // Show loading
  loadingEl.classList.remove("hidden");
  await new Promise(requestAnimationFrame);

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(
        query
      )}&type=movie`
    );

    const data = await response.json();
    loadingEl.classList.add("hidden");

    if (data.Response === "False") {
      errorEl.textContent = data.Error;
      return;
    }

    // Store ALL results, but only render first 6
    allResults = data.Search
      .filter((item) => item.Type === "movie")
      .slice(0, RESULTS_PER_PAGE);

    applySort();
  } catch (err) {
    console.error(err);
    loadingEl.classList.add("hidden");
    errorEl.textContent = "Something went wrong. Please try again.";
  }
}

function applySort() {
  const sortBy = sortSelect.value;

  if (sortBy === "title") {
    allResults.sort((a, b) => a.Title.localeCompare(b.Title));
  }

  if (sortBy === "title-desc") {
    allResults.sort((a, b) => b.Title.localeCompare(a.Title));
  }

  if (sortBy === "year-desc") {
    allResults.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  }

  if (sortBy === "year-asc") {
    allResults.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  }

  renderResults();
}

function renderResults() {
  resultsEl.innerHTML = "";

  allResults.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "card";

    const posterHTML =
      movie.Poster && movie.Poster !== "N/A"
        ? `<img src="${movie.Poster}" alt="${movie.Title}" />`
        : "";

    card.innerHTML = `
      ${posterHTML}
      <div class="card-content">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
      </div>
    `;

    const img = card.querySelector("img");
    if (img) {
      img.onerror = () => img.remove(); // zero-image fallback
    }

    card.addEventListener("click", () => {
      window.open(
        `https://www.imdb.com/title/${movie.imdbID}/`,
        "_blank"
      );
    });

    resultsEl.appendChild(card);
  });
}

/* --------------------------------
   Home Reset
--------------------------------- */

function resetHome() {
  resultsEl.innerHTML = "";
  errorEl.textContent = "";
  loadingEl.classList.add("hidden");

  searchInput.value = "";
  sortSelect.value = "";

  allResults = [];

  heroEl.classList.remove("compact");
  heroTitle.classList.remove("hidden");
}