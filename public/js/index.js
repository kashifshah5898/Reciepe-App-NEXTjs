import * as services from "./services/recipe-services.js";

// This function will be called when the page is loaded
document.addEventListener("DOMContentLoaded", async () => {
  window.loadPage = loadPage;
  window.deleteRecipe = deleteRecipe;
  window.addRecipe = addRecipe;
  await loadRecipes();
});
// We will use this variable to store all recipes
let recipes = [];

// We will use this variable to store all dom elements that we will use in our app
const mainContent = document.querySelector("#main-content");

let recipesCards;
let form;

// This will help us to load the page dynamically
// and also to pass the id of the recipe to be updated
async function loadPage(pageUrl, id) {
  const page = await fetch(pageUrl);
  const pageHTMLContent = await page.text();
  mainContent.innerHTML = pageHTMLContent;

  // check if we are in the recipes page or the form page

  if (pageUrl == "pages/recipes.html") {
    recipesCards = document.querySelector("#recipe-cards");
    displayRecipes();
  } else if (pageUrl == "pages/form.html") {
    form = document.querySelector("#recipe-form");

    // check if we are in add mode or edit mode
    if (!id) {
      form.addEventListener("submit", addRecipe);
    } else {
      // get the recipe from the service
      let recipe;
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      fetch(`http://localhost:3000/api/recipes/recipe-repo?id=${id}`, requestOptions)
        .then((response) => response.text())
        .then((result) => (recipe = result))
        .catch((error) => alert("error", error));

      // fill the form with the recipe data
      for (const key in recipe) form[key].value = recipe[key];

      // change the button text
      form.querySelector("#submit-recipe-btn").value = "Update Recipe";

      // add the event listener to the form
      form.addEventListener("submit", (e) => updateRecipe(e, id));
    }
  }
}

// This function will be called when the user clicks on the delete button
// or when the app is loaded for the first time
async function loadRecipes() {
  await loadPage("pages/recipes.html");
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch("http://localhost:3000/api/recipes/recipe-repo", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      let result1 = JSON.parse(result);
      recipes = result1.data;
      displayRecipes();
    })
    .catch((error) => alert("error", error));
}

async function displayRecipes() {
  const pageHTMLContent = recipes.map((recipe) => recipeToCard(recipe)).join(" ");
  recipesCards.innerHTML = pageHTMLContent;
}

function recipeToCard(recipe) {
  return `<div class="recipe-card">
                    <img src="${recipe.image}" class="card-img" />
                    <div class="description">
                        <h1>${recipe.name}</h1>
                        <h3>${recipe.region}</h3>
                        <hr>
                        <h2>Instructions for ${recipe.id}</h2>
                        <p class="instructions">${recipe.instructions}
                        </p>
                    </div>
                    <div class="action-btns">
                        <button class="btn-update" onclick="loadPage('pages/form.html', ${recipe.id})"> <i class="fa fa-pencil">Update</i></button>
                        <button class="btn-delete" onclick="deleteRecipe(${recipe.id})"> <i class="fa fa-trash"> Delete </i></button>
                    </div>
                </div>
        `;
}

async function deleteRecipe(id) {
  var requestOptions = {
    method: "DELETE",
    redirect: "follow",
  };

  fetch(`http://localhost:3000/api/recipes/recipe-repo?id=${id}`, requestOptions)
    .then((response) => response.text())
    .then((result) => loadRecipes())
    .catch((error) => alert("error", error));
}

async function addRecipe(e) {
  e.preventDefault();
  const recipe = formToObject(e.target);

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(recipe);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("http://localhost:3000/api/recipes/recipe-repo", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      loadRecipes();
    })
    .catch((error) => alert("error", error));
}

async function updateRecipe(e, id) {
  e.preventDefault();
  const recipe = formToObject(e.target);
  console.log("reachd");

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(recipe);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(`http://localhost:3000/api/recipes/recipe-repo?id=${id}`, requestOptions)
    .then((response) => response.text())
    .then((result) => loadRecipes())
    .catch((error) => alert("error", error));
}

function formToObject(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData) data[key] = value;

  return data;
}
