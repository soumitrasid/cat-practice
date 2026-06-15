// ===================================
// Global Variables
// ===================================

let questions = [];

let currentQuestion = 0;

let userAnswers = [];

let questionTimes = [];

let questionStartTime = Date.now();

let masterTimeLeft = 0;

let questionTimeLeft = 300;

let masterTimerInterval;

let questionTimerInterval;


// ===================================
// Shuffle Array
// ===================================

function shuffleArray(arr) {

    let a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}


// ===================================
// Load Master Question Bank
// ===================================

fetch("questions_master.json")

.then(response => {

    if (!response.ok) {

        throw new Error("Cannot load questions_master.json");
    }

    return response.json();

})

.then(data => {

    // Separate by difficulty

    let easyQuestions =
        data.filter(q => q.difficulty === "Easy");

    let mediumQuestions =
        data.filter(q => q.difficulty === "Medium");

    let hardQuestions =
        data.filter(q => q.difficulty === "Hard");


    // Randomly choose

    easyQuestions =
        shuffleArray(easyQuestions).slice(0,10);

    mediumQuestions =
        shuffleArray(mediumQuestions).slice(0,10);

    hardQuestions =
        shuffleArray(hardQuestions).slice(0,10);


    // Create final paper

    questions = [

        ...easyQuestions,

        ...mediumQuestions,

        ...hardQuestions

    ];


    // Shuffle paper

    questions = shuffleArray(questions);


    // Initialize arrays

    userAnswers =
        Array(questions.length).fill(null);

    questionTimes =
        Array(questions.length).fill(0);


    // 5 minutes per question

    masterTimeLeft =
        questions.length * 300;


    createPalette();

    loadQuestion();

    startMasterTimer();

    startQuestionTimer();

})

.catch(error => {

    console.error(error);

    document.getElementById("question").innerHTML =

        "Error loading questions_master.json";

});
// ===================================
// Load Question
// ===================================

function loadQuestion() {

    let q = questions[currentQuestion];

    document.getElementById("questionNumber").innerHTML =
        `Question ${currentQuestion + 1}`;

    document.getElementById("question").innerHTML =
        q.question;

    let html = "";

    for (let i = 0; i < q.options.length; i++) {

        let checked = "";

        if (userAnswers[currentQuestion] === i)
            checked = "checked";

        html +=
        `
        <p>
        <label>
        <input type="radio"
               name="option"
               value="${i}"
               ${checked}>
        ${q.options[i]}
        </label>
        </p>
        `;
    }

    document.getElementById("options").innerHTML =
        html;

    updatePalette();

    updateButtons();

}


// ===================================
// Create Palette
// ===================================

function createPalette() {

    let html = "";

    for (let i = 0; i < questions.length; i++) {

        html +=

        `<button
            class="paletteButton unansweredQuestion"
            id="palette${i}"
            onclick="jumpToQuestion(${i})">

            ${i+1}

        </button>`;
    }

    document.getElementById("palette").innerHTML =
        html;

}


// ===================================
// Update Palette
// ===================================

function updatePalette() {

    for (let i = 0; i < questions.length; i++) {

        let box =
            document.getElementById(`palette${i}`);

        box.className = "paletteButton";

        if (userAnswers[i] !== null)
            box.classList.add("answeredQuestion");

        else
            box.classList.add("unansweredQuestion");

        if (i === currentQuestion)
            box.classList.add("currentQuestion");

    }

}


// ===================================
// Jump To Question
// ===================================

function jumpToQuestion(index) {

    currentQuestion = index;

    questionStartTime = Date.now();

    questionTimeLeft = 300;

    loadQuestion();

}


// ===================================
// Format Time
// ===================================

function formatTime(seconds) {

    let hrs =
        String(Math.floor(seconds/3600))
        .padStart(2,'0');

    let mins =
        String(Math.floor((seconds%3600)/60))
        .padStart(2,'0');

    let secs =
        String(seconds%60)
        .padStart(2,'0');

    return `${hrs}:${mins}:${secs}`;

}


// ===================================
// Master Timer
// ===================================

function startMasterTimer() {

    masterTimerInterval = setInterval(() => {

        masterTimeLeft--;

        document.getElementById("masterTimer")
        .innerHTML =

        "Master Timer : " +
        formatTime(masterTimeLeft);

        if (masterTimeLeft <= 0) {

            clearInterval(masterTimerInterval);

            finishTest();

        }

    },1000);

}


// ===================================
// Question Timer
// ===================================

function startQuestionTimer() {

    questionTimerInterval = setInterval(() => {

        questionTimeLeft--;

        questionTimes[currentQuestion]++;

        document.getElementById("questionTimer")
        .innerHTML =

        "Question Timer : " +
        formatTime(questionTimeLeft);


        if (questionTimeLeft <= 0) {

            questionTimeLeft = 300;

            if (currentQuestion <
                questions.length - 1) {

                currentQuestion++;

                loadQuestion();

            }

        }

    },1000);

}


// ===================================
// Update Buttons
// ===================================

function updateButtons() {

    document.getElementById("prevBtn").disabled =
        currentQuestion === 0;

    document.getElementById("nextBtn").disabled =
        currentQuestion === questions.length - 1;


    let answeredCount =
        userAnswers.filter(
            x => x !== null
        ).length;


    document.getElementById("finishBtn")
    .disabled =

        answeredCount === 0;

}
// ===================================
// Submit Answer
// ===================================

function submitAnswer() {

    let selected =
        document.querySelector(
            'input[name="option"]:checked'
        );

    if (!selected) {

        alert("Please select an answer.");

        return;
    }

    userAnswers[currentQuestion] =
        parseInt(selected.value);

    updatePalette();

    updateButtons();


    // Move automatically to next question

    if (currentQuestion <
        questions.length - 1) {

        currentQuestion++;

        questionTimeLeft = 300;

        loadQuestion();

    }

}


// ===================================
// Skip Question
// ===================================

function skipQuestion() {

    if (currentQuestion <
        questions.length - 1) {

        currentQuestion++;

        questionTimeLeft = 300;

        loadQuestion();

    }

}


// ===================================
// Previous Question
// ===================================

function previousQuestion() {

    if (currentQuestion > 0) {

        currentQuestion--;

        questionTimeLeft = 300;

        loadQuestion();

    }

}


// ===================================
// Next Question
// ===================================

function nextQuestion() {

    if (currentQuestion <
        questions.length - 1) {

        currentQuestion++;

        questionTimeLeft = 300;

        loadQuestion();

    }

}


// ===================================
// Finish Test
// ===================================

function finishTest() {

    clearInterval(masterTimerInterval);

    clearInterval(questionTimerInterval);

    generateReport();

}


// ===================================
// Review Mode
// ===================================

function reviewQuestion(index) {

    currentQuestion = index;

    loadQuestion();

}


// ===================================
// Keyboard Shortcuts
// ===================================

document.addEventListener(

    "keydown",

    function(event) {

        if (event.key === "ArrowRight") {

            nextQuestion();

        }

        if (event.key === "ArrowLeft") {

            previousQuestion();

        }

    }

);


// ===================================
// Finish Button Activation
// ===================================

document.addEventListener(

    "change",

    function(event) {

        if (

            event.target.name === "option"

        ) {

            document.getElementById(
                "finishBtn"
            ).disabled = false;

        }

    }

);
// ===================================
// Generate Report
// ===================================

function generateReport() {

    let totalMarks = 0;

    let correctCount = 0;

    let wrongCount = 0;

    let skippedCount = 0;

    let totalTime = 0;

    let topicStats = {};

    let difficultyStats = {};

    let reportHTML = "<h1>TEST REPORT</h1>";


    // ===================================
    // Summary Calculation
    // ===================================

    for (let i = 0; i < questions.length; i++) {

        let q = questions[i];

        let topic = q.topic;

        let difficulty = q.difficulty;

        if (!topicStats[topic]) {

            topicStats[topic] = {

                correct:0,

                total:0

            };

        }

        if (!difficultyStats[difficulty]) {

            difficultyStats[difficulty] = {

                correct:0,

                total:0

            };

        }

        topicStats[topic].total++;

        difficultyStats[difficulty].total++;


        if (userAnswers[i] === null) {

            skippedCount++;

        }

        else if (

            userAnswers[i] === q.answer

        ) {

            totalMarks += 3;

            correctCount++;

            topicStats[topic].correct++;

            difficultyStats[difficulty].correct++;

        }

        else {

            totalMarks -= 1;

            wrongCount++;

        }

        totalTime += questionTimes[i];

    }


    // ===================================
    // Summary Section
    // ===================================

    reportHTML += `

    <h2>Summary</h2>

    <table border="1">

    <tr>

    <th>Total Questions</th>

    <th>Correct</th>

    <th>Wrong</th>

    <th>Skipped</th>

    <th>Total Marks</th>

    </tr>

    <tr>

    <td>${questions.length}</td>

    <td>${correctCount}</td>

    <td>${wrongCount}</td>

    <td>${skippedCount}</td>

    <td>${totalMarks}</td>

    </tr>

    </table>

    <br>
    `;


    let accuracy =

        (
            correctCount /

            (correctCount + wrongCount || 1)

        ) * 100;


    reportHTML +=

    `<b>Accuracy :</b>

    ${accuracy.toFixed(2)} %

    <br><br>

    <b>Average Time per Question :</b>

    ${(totalTime/questions.length/60)
    .toFixed(2)}

    min

    <br><br>
    `;


    // ===================================
    // Topic Analysis
    // ===================================

    reportHTML +=

    "<h2>Topic Analysis</h2>";

    reportHTML +=

    "<table border='1'>";

    reportHTML +=

    "<tr><th>Topic</th><th>Correct</th></tr>";



    for (let topic in topicStats) {

        reportHTML +=

        `<tr>

        <td>${topic}</td>

        <td>

        ${topicStats[topic].correct}

        /

        ${topicStats[topic].total}

        </td>

        </tr>`;

    }

    reportHTML += "</table><br>";


    // ===================================
    // Difficulty Analysis
    // ===================================

    reportHTML +=

    "<h2>Difficulty Analysis</h2>";

    reportHTML +=

    "<table border='1'>";

    reportHTML +=

    "<tr><th>Difficulty</th><th>Correct</th></tr>";



    for (let d in difficultyStats) {

        reportHTML +=

        `<tr>

        <td>${d}</td>

        <td>

        ${difficultyStats[d].correct}

        /

        ${difficultyStats[d].total}

        </td>

        </tr>`;

    }

    reportHTML += "</table><br>";


    // ===================================
    // Detailed Report
    // ===================================

    reportHTML +=

    "<h2>Detailed Question Report</h2>";


    for (let i = 0; i < questions.length; i++) {

        let q = questions[i];

        let status = "";

        let marks = 0;

        if (userAnswers[i] === null) {

            status = "Skipped";

            marks = 0;

        }

        else if (

            userAnswers[i] === q.answer

        ) {

            status = "Correct";

            marks = 3;

        }

        else {

            status = "Wrong";

            marks = -1;

        }


        let candidateAnswer =

            userAnswers[i] === null

            ?

            "Not Attempted"

            :

            q.options[userAnswers[i]];


        let correctAnswer =

            q.options[q.answer];


        reportHTML +=

        `

        <hr>

        <h3>

        Question ${i+1}

        </h3>

        <p>

        <b>Topic:</b>

        ${q.topic}

        <br>

        <b>Difficulty:</b>

        ${q.difficulty}

        </p>

        <p>

        ${q.question}

        </p>

        <p>

        <b>Your Answer:</b>

        ${candidateAnswer}

        </p>

        <p>

        <b>Correct Answer:</b>

        ${correctAnswer}

        </p>

        <p>

        <b>Status:</b>

        ${status}

        </p>

        <p>

        <b>Marks:</b>

        ${marks}

        </p>

        <p>

        <b>Time Spent:</b>

        ${(questionTimes[i]/60).toFixed(2)}

        min

        </p>

        <p>

        <b>Target Time:</b>

        5 min

        </p>

        `;

    }


    // ===================================
    // Show Report
    // ===================================

    document.body.innerHTML =

        reportHTML;

}
