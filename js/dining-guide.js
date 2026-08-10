(() => {
  const restaurantDataUrl = "data/dining/restaurants.json";
  const cityButtons = Array.from(document.querySelectorAll(".city-filter"));
  const filterButtons = Array.from(document.querySelectorAll(".restaurant-filter"));
  const citySections = {
    bordeaux: document.getElementById("bordeaux"),
    saintEmilion: document.getElementById("saint-emilion"),
    strasbourg: document.getElementById("strasbourg")
  };
  const status = document.querySelector(".filter-status");
  const labels = {
    traditional: "Regional & traditional",
    modern: "Modern",
    value: "Best value",
    atmosphere: "Great atmosphere",
    "price-low": "$ · Moderate",
    "price-high": "$$ / $$"
  };
  const cityNames = {
    bordeaux: "Bordeaux",
    saintEmilion: "Saint-Émilion",
    strasbourg: "Strasbourg"
  };
  const detailId = new URLSearchParams(window.location.search).get("id");
  let activeCity = "bordeaux";
  let activeFilter = null;

  function renderRestaurantCards(restaurants) {
    Object.values(citySections).forEach(section => {
      section.querySelector(".restaurant-grid").innerHTML = "";
    });

    restaurants
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .forEach(restaurant => {
        const section = citySections[restaurant.city];
        if (!section) return;
        section.querySelector(".restaurant-grid").insertAdjacentHTML("beforeend", restaurant.html);
      });
  }

  function renderDetailPage(restaurants) {
    const restaurant = restaurants.find(item => item.id === detailId);
    document.body.classList.add("detail-mode");
    document.querySelector("header h1").textContent = restaurant ? restaurant.name : "Restaurant Not Found";
    document.querySelector("header .sub").textContent = restaurant
      ? (cityNames[restaurant.city] || restaurant.city) + " · Rank #" + restaurant.rank + " · Restaurant details"
      : "Return to the dining list and choose another restaurant.";

    Object.values(citySections).forEach(section => {
      section.hidden = true;
      section.querySelector(".restaurant-grid").innerHTML = "";
    });

    if (!restaurant) {
      const section = citySections.bordeaux;
      section.hidden = false;
      section.querySelector("h2").textContent = "Restaurant Not Found";
      section.querySelector("p").textContent = "That restaurant could not be found in the current dining data.";
      section.querySelector(".restaurant-grid").innerHTML = '<div class="detail-actions"><a class="go-back" href="DiningGuide.html">← Go Back</a></div>';
      return;
    }

    const section = citySections[restaurant.city] || citySections.bordeaux;
    section.hidden = false;
    section.querySelector(".city-kicker").textContent = "Restaurant detail";
    section.querySelector("h2").textContent = restaurant.name;
    section.querySelector("p").textContent = (cityNames[restaurant.city] || restaurant.city) + " · Unified rank #" + restaurant.rank;
    section.querySelector(".restaurant-grid").innerHTML = '<div class="detail-actions"><a class="go-back" href="DiningGuide.html">← Go Back</a></div>' + restaurant.html;
  }

  function render(scrollToCity = false) {
    cityButtons.forEach(button => {
      const selected = button.dataset.city === activeCity;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    Object.entries(citySections).forEach(([city, section]) => {
      const selectedCity = city === activeCity;
      section.hidden = !selectedCity;
      section.querySelectorAll(".restaurant").forEach(card => {
        const tags = (card.dataset.tags || "").split(" ");
        const matches = activeFilter === null ? true : tags.includes(activeFilter);
        card.hidden = !selectedCity || !matches;
      });
    });

    const cityLabel = cityNames[activeCity] || activeCity;
    const visible = citySections[activeCity].querySelectorAll(".restaurant:not([hidden])").length;
    const filterLabel = activeFilter === null ? "All restaurants" : labels[activeFilter];
    status.textContent = "Showing " + cityLabel + " · " + filterLabel + " · " + visible + " restaurants";
    if (scrollToCity) citySections[activeCity].scrollIntoView({behavior:"smooth", block:"start"});
  }

  async function init() {
    try {
      const response = await fetch(restaurantDataUrl);
      if (!response.ok) throw new Error("Unable to load restaurant data");
      const restaurants = await response.json();
      if (detailId) {
        renderDetailPage(restaurants);
        return;
      }
      renderRestaurantCards(restaurants);
      render(false);
    } catch (error) {
      status.textContent = "Restaurant data could not be loaded. Refresh the page or try again later.";
      console.error(error);
    }

    cityButtons.forEach(button => button.addEventListener("click", () => {
      activeCity = button.dataset.city;
      render(true);
    }));
    filterButtons.forEach(button => button.addEventListener("click", () => {
      activeFilter = activeFilter === button.dataset.filter ? null : button.dataset.filter;
      render(false);
    }));
    document.querySelectorAll("[data-city-nav]").forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      activeCity = link.dataset.cityNav;
      render(true);
    }));
  }

  init();
})();
