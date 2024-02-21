const CATEGORIESURL = 'https://opentdb.com/api_category.php';
const WAIT_TIME = 2000;
const MAX_QUESTIONS = 10;

let correctAnswers = 0

// Theme Selector
const rootElement = document.documentElement;
const themeIcon = document.getElementById("themeIcon");

// Theme Switch functions
const enable_dark_mode = () => {
    rootElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeIcon.children[0].setAttribute("href", "#sun");
};

const disable_dark_mode = () => {
    rootElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    themeIcon.children[0].setAttribute("href", "#moon");
};

function switch_theme() {
    let data_theme = rootElement.getAttribute("data-theme");

    if (data_theme === "light") enable_dark_mode();
    else disable_dark_mode();
};


// Page setup
document.addEventListener("DOMContentLoaded", function () {
    // Show loading categories alert
    document.getElementById("loadCategoriesAlert").classList.remove("hidden");
    // Fetch categories from API
    fetch(CATEGORIESURL)
        .then(response => response.json())
        .then(data => {
            // Hide loading categories alert
            document.getElementById("loadCategoriesAlert").classList.add("hidden");
            showSuccessAlert();

            const categories = data.trivia_categories;
            const categoriesDiv = document.getElementById('categories');
            categories.forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'optionsButton';
                categoryDiv.innerText = category.name;
                categoryDiv.setAttribute('data-id', category.id);
                categoryDiv.addEventListener('click', () => selectCategory(category.name, category.id));
                categoriesDiv.appendChild(categoryDiv);
            });
        });

    // Click listener for Start Quiz button
    document.getElementById('startQuiz').addEventListener('click', () => {
        const selectedCategory = document.getElementById('selectedCategory').innerText.trim();
        const selectedDifficulty = document.getElementById('selectedDifficulty').innerText.trim().toLowerCase();

        if (selectedCategory !== 'Select a category' && selectedDifficulty !== 'Select a difficulty') {
            const gameCategoryID = document.getElementById('selectedCategory').getAttribute('data-id');
            fetchQuestions(gameCategoryID, selectedDifficulty);
        } else {
            showSelectionWarning();
        }
    });

    // Click listener for difficulties selection
    const difficultiesContainer = document.getElementById('difficulties');
    const selectedDifficultyElement = document.getElementById('selectedDifficulty');

    difficultiesContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('optionsButton')) {
            gameDifficulty = event.target.textContent;
            selectedDifficultyElement.textContent = gameDifficulty;
        }
    });

    themeIcon.addEventListener('click', switch_theme);
    document.getElementById("tryAgain").addEventListener('click', resetQuiz);
});


// Click listener for categories selection
function selectCategory(categoryName, categoryId) {
    document.getElementById('selectedCategory').innerText = categoryName;
    document.getElementById('selectedCategory').setAttribute('data-id', categoryId);
}

async function fetchQuestions(gameCategoryID, gameDifficulty) {
    document.getElementById("loadQuestionsAlert").classList.remove("hidden");
    const apiUrl = `https://opentdb.com/api.php?amount=${MAX_QUESTIONS}&category=${gameCategoryID}&difficulty=${gameDifficulty}&type=multiple`;

    await fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("loadQuestionsAlert").classList.add("hidden");
            const questions = data.results;

            if (!questions.length) {
                throw new Error(`OpenTDB couldn't provide ${MAX_QUESTIONS} questions for the current selection. Category: ${gameCategoryID}, Difficulty: ${gameDifficulty}`);
            }

            showSuccessAlert();
            document.getElementById('gameSelection').classList.add('hidden');

            const gameBoard = document.getElementById('gameBoard');
            gameBoard.classList.remove('hidden');

            let questionIndex = 0;
            const questionText = document.getElementById('question');
            const option1 = document.getElementById('option1');
            const option2 = document.getElementById('option2');
            const option3 = document.getElementById('option3');
            const option4 = document.getElementById('option4');
            const submitButton = document.getElementById("submit");

            let correctChoice = '';
            let selectedAnswer = '';
            option1.addEventListener('click', selectOption);
            option2.addEventListener('click', selectOption);
            option3.addEventListener('click', selectOption);
            option4.addEventListener('click', selectOption);
            submitButton.addEventListener('click', checkAnswer);

            function selectOption(event) {
                resetOptionSelection();
                selectedAnswer = event.target.innerHTML;
                event.target.setAttribute("data-selected", true);
            }

            function checkAnswer() {
                if (selectedAnswer === '') {
                    showQuestionWarning();
                    return;
                }

                if (selectedAnswer === correctChoice) {
                    correctAnswers++;
                    showCorrectAlert();
                }
                else {
                    showWrongAlert();
                }
                questionIndex++;
                displayQuestion();
            }

            function resetOptionSelection() {
                option1.setAttribute("data-selected", false);
                option2.setAttribute("data-selected", false);
                option3.setAttribute("data-selected", false);
                option4.setAttribute("data-selected", false);
                selectedAnswer = '';
            }

            function displayQuestion() {
                if (questionIndex < questions.length) {
                    resetOptionSelection();

                    const question = questions[questionIndex];
                    questionText.innerHTML = `Q${questionIndex + 1}/${MAX_QUESTIONS}: ${question.question}`;

                    // Shuffle options
                    const options = [question.correct_answer, ...question.incorrect_answers];
                    options.sort(() => Math.random() - 0.5);

                    option1.innerHTML = options[0];
                    option2.innerHTML = options[1];
                    option3.innerHTML = options[2];
                    option4.innerHTML = options[3];

                    // Record correct choice
                    correctChoice = decodeHtmlEntities(question.correct_answer);
                } else {
                    // All questions answered
                    gameBoard.classList.add("hidden");
                    showResults();
                }
            }
            displayQuestion();
        })
        .catch((error) => {
            showErrorAlert();
            console.error('Error:', error);
        });
}

function showResults() {
    document.getElementById("results").classList.remove("hidden");
    document.getElementById("resultText").innerText = `${correctAnswers} / ${MAX_QUESTIONS}`;
}

function resetQuiz() {
    document.getElementById("results").classList.add("hidden");
    document.getElementById("gameSelection").classList.remove("hidden");
}

function decodeHtmlEntities(html) {
    return html.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
}


// Alert Messages
function showSuccessAlert() {
    const successAlert = document.getElementById('success');
    successAlert.classList.remove('hidden');
    setTimeout(() => {
        successAlert.classList.add('hidden');
    }, WAIT_TIME);
}

function showErrorAlert() {
    const failureAlert = document.getElementById('failure');
    failureAlert.classList.remove('hidden');
    setTimeout(() => {
        failureAlert.classList.add('hidden');
    }, WAIT_TIME);
}

function showSelectionWarning() {
    const selectionWarning = document.getElementById("selectionWarning");
    selectionWarning.classList.remove("hidden");
    setTimeout(() => {
        selectionWarning.classList.add("hidden");
    }, WAIT_TIME);
}

function showQuestionWarning() {
    const questionWarning = document.getElementById("questionWarning");
    questionWarning.classList.remove("hidden");
    setTimeout(() => {
        questionWarning.classList.add("hidden");
    }, WAIT_TIME);
}

function showCorrectAlert() {
    const correctAlert = document.getElementById("correct");
    correctAlert.classList.remove("hidden");
    setTimeout(() => {
        correctAlert.classList.add("hidden");
    }, WAIT_TIME);
}

function showWrongAlert() {
    const wrongAlert = document.getElementById("wrong");
    wrongAlert.classList.remove("hidden");
    setTimeout(() => {
        wrongAlert.classList.add("hidden");
    }, WAIT_TIME);
}
