import { searchLocalCity, resolveCitySelection } from "./weather-logic.js";

export function initSearchUI({ cities, onCitySelected }) {
  const input = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");
  const resultsBox = document.getElementById("search-results");

  let lastSearchResults = [];

  function handleSearch() {
    const query = input.value.trim();

    if (!query) {
      resultsBox.innerHTML = "";
      return;
    }

    const results = searchLocalCity(query, cities);
    lastSearchResults = results;

    if (results.length === 0) {
      resultsBox.innerHTML =
        "<div class='search-result-item'>Kota tidak ditemukan</div>";
      return;
    }

    resultsBox.innerHTML = results
      .map(
        (r, i) => `
        <div class="search-result-item" data-index="${i}">
          ${r.name}${r.admin1 ? ", " + r.admin1 : ""}
        </div>
      `,
      )
      .join("");
  }

  searchBtn.addEventListener("click", handleSearch);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSearch();
  });

  resultsBox.addEventListener("click", (event) => {
    const item = event.target.closest("[data-index]");
    if (!item) return;

    const index = Number(item.dataset.index);
    const city = resolveCitySelection(index, lastSearchResults);

    if (!city) {
      console.error("Pilihan kota tidak valid:", index);
      return;
    }

    resultsBox.innerHTML = "";
    input.value = "";
    onCitySelected(city);
  });
}
