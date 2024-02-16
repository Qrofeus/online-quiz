const CATEGORIESURL = 'https://opentdb.com/api_category.php';
let correctAnswers = 0


// Page setup
document.addEventListener("DOMContentLoaded", function() {
    // Fetch categories from API
    fetch(CATEGORIESURL)
        .then(response => response.json())
        .then(data => {
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

        if (selectedCategory !== '' && selectedDifficulty !== '') {
            const gameCategoryID = document.getElementById('selectedCategory').getAttribute('data-id');
            fetchQuestions(gameCategoryID, selectedDifficulty);
        } else {
            alert('Please select a category and a difficulty level.');
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
});

// Click listener for categories selection
function selectCategory(categoryName, categoryId) {
    document.getElementById('selectedCategory').innerText = categoryName;
    document.getElementById('selectedCategory').setAttribute('data-id', categoryId);
}

async function fetchQuestions(gameCategoryID, gameDifficulty) {
    const apiUrl = `https://opentdb.com/api.php?amount=20&category=${gameCategoryID}&difficulty=${gameDifficulty}&type=multiple`;
    console.log(apiUrl);

    await fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const questions = data.results;
            console.log(questions);

            if(!questions.length) {
                throw new Error("Zero questions returned");
            }

            const gameBoard = document.getElementById('gameBoard');
            const gameSelection = document.getElementById('gameSelection');

            gameSelection.classList.add('hidden');
            gameBoard.classList.remove('hidden');

            let questionIndex = 0;
            const questionText = document.getElementById('question');
            const option1 = document.getElementById('option1');
            const option2 = document.getElementById('option2');
            const option3 = document.getElementById('option3');
            const option4 = document.getElementById('option4');

            let correctChoice = '';
            option1.addEventListener('click', handleAnswer);
            option2.addEventListener('click', handleAnswer);
            option3.addEventListener('click', handleAnswer);
            option4.addEventListener('click', handleAnswer);

            function handleAnswer(event) {
                const selectedAnswer = event.target.innerHTML;
                if (selectedAnswer === correctChoice) {
                    correctAnswers++;
                    alert('Correct!');
                } else {
                    alert('Incorrect!');
                }
                console.log(selectedAnswer, correctChoice);
                questionIndex++;
                displayQuestion(); // Display next question
            }

            function displayQuestion() {
                if (questionIndex < questions.length) {
                    const question = questions[questionIndex];
                    questionText.innerHTML = `Question ${questionIndex + 1}: ${question.question}`;

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
                    alert('Quiz completed!');
                    console.log(`${correctAnswers}/20`);
                }
            }
            displayQuestion();
        })
        .catch(error => console.error('Error fetching questions:', error));
}

function decodeHtmlEntities(html) {
    return html.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
}


// Alert Messages
function showSuccessAlert() {
    const successAlert = document.getElementById('success');
    successAlert.classList.remove('hidden');
    setTimeout(() => {
        successAlert.classList.add('hidden');
    }, 5000);
}

function showErrorAlert() {
    const failureAlert = document.getElementById('failure');
    failureAlert.classList.remove('hidden');
    setTimeout(() => {
        failureAlert.classList.add('hidden');
    }, 5000);
}

function showWarningAlert() {
    const warningAlert = document.getElementById('warning');
    warningAlert.classList.remove('hidden');
    setTimeout(() => {
        warningAlert.classList.add('hidden');
    }, 5000)
}

function showHelpAlert() {
    const helpAlert = document.getElementById('helpAlert');
    helpAlert.classList.remove('hidden');
    setTimeout(() => {
        helpAlert.classList.add('hidden');
    }, 10000);
}
