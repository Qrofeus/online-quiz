const categoriesURL = 'https://opentdb.com/api_category.php';
const questionURL = `https://opentdb.com/api.php?amount=20&category=25&difficulty=${categoriesURL}&type=multiple`;

let gameCategory = "";
let gameDifficulty = "";

async function getTriviaCategories() {
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();

        if (data && data.trivia_categories) {
            return data.trivia_categories;
        } else {
            throw new Error('Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return [];
    }
}

async function displayTriviaCategories(categories) {
    const parentElement = document.getElementById('categories');
    if (!parentElement) {
        console.error('Parent element not found');
        return;
    }

    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('button');
        categoryDiv.textContent = category.name;
        parentElement.appendChild(categoryDiv);
    });
}

function addClickListenerToCategories() {
    const categoryContainer = document.getElementById('categories');
    const selectedCategoryElement = document.getElementById('selectedCategory');

    categoryContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('button')) {
            gameCategory = event.target.textContent;
            selectedCategoryElement.textContent = gameCategory;
        }
    });
}

function addClickListenerToDifficulties() {
    const categoryContainer = document.getElementById('difficulty');
    const selectedDifficultyElement = document.getElementById('selectedDifficulty');

    categoryContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('button')) {
            gameDifficulty = event.target.textContent;
            selectedDifficultyElement.textContent = gameDifficulty;
        }
    });
}


async function mainFunction() {
    const categories = await getTriviaCategories()
        .catch(error => {
            console.error('Error:', error);
        });
    await displayTriviaCategories(categories)
        .catch(error => {
            console.error('Error displaying categories:', error);
        });
    addClickListenerToCategories();
    addClickListenerToDifficulties();
}

mainFunction();

