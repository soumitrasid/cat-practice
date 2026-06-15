// =========================
// Global Variables
// =========================

let current = 0;

let questions = [];

let answers = [];

let timeSpent = [];

let reviewMode = false;

let masterTime;

let questionTime;

let masterInterval;

let questionInterval;


// =========================
// Load Questions
// =========================

fetch("questions.json")
.then(response => response.json())
.then(data => {

    questions = data;

    answers = new Array(questions.length).fill(null);

    timeSpent = new Array(questions.length).fill(0);

    // 5 minutes per question

    masterTime = questions.length * 5 * 60;

    startMasterTimer();

    loadQuestion();

});


// =========================
// Format Time
// =========================

function formatTime(time) {

    let hrs = Math.floor(time / 3600);

    let mins = Math.floor((time % 3600) / 60);

    let secs = time % 60;

    hrs = hrs.toString().padStart(2, '0');

    mins = mins.toString().padStart(2, '0');

    secs = secs.toString().padStart(2, '0');

    return hrs + ":" + mins + ":" + secs;

}


// =========================
// Master Timer
// =========================

function startMasterTimer() {

    masterInterval = setInterval(function () {

        document.getElementById("masterTimer").innerHTML =
            "Master Timer : " + formatTime(masterTime);

        masterTime--;

        if (masterTime < 0) {

            finishTest();

        }

    }, 1000);

}


// =========================
// Question Timer
// =========================

function startQuestionTimer() {

    clearInterval(questionInterval);

    questionTime = 300;

    questionInterval = setInterval(function () {

        document.getElementById("questionTimer").innerHTML =
            "Question Timer : " + formatTime(questionTime);

        timeSpent[current]++;

        questionTime--;

        if (questionTime < 0) {

            clearInterval(questionInterval);

            autoNext();

        }

    }, 1000);

}


// =========================
// Load Question
// =========================

function loadQuestion() {

    document.getElementById("questionNumber").innerHTML =
        "Question " + (current + 1) + " of " + questions.length;

    document.getElementById("question").innerHTML =
        questions[current].question;

    let html = "";

    questions[current].options.forEach((option, i) => {

        let checked = "";

        if (answers[current] === i) {

            checked = "checked";

        }

        html += `

        <p>

            <input
                type="radio"
                name="answer"
                value="${i}"
                ${checked}>

            ${option}

        </p>

        `;

    });

    document.getElementById("options").innerHTML = html;

    createPalette();

    if (!reviewMode) {

        startQuestionTimer();

    }

}
// =========================
// Submit Answer
// =========================

function submitAnswer() {

    let selected =
        document.querySelector('input[name="answer"]:checked');

    if (selected) {

        answers[current] =
            parseInt(selected.value);

    }

    clearInterval(questionInterval);

    autoNext();

}


// =========================
// Skip Question
// =========================

function skipQuestion() {

    clearInterval(questionInterval);

    autoNext();

}


// =========================
// Automatic Next Question
// =========================

function autoNext() {

    if (current < questions.length - 1) {

        current++;

        loadQuestion();

    }

    else {

        enterReviewMode();

    }

}


// =========================
// Enter Review Mode
// =========================

function enterReviewMode() {

    reviewMode = true;

    clearInterval(questionInterval);

    document.getElementById("questionTimer").innerHTML =
        "Review Mode";

    current = 0;

    document.getElementById("prevBtn").disabled = false;

    document.getElementById("nextBtn").disabled = false;

    document.getElementById("finishBtn").disabled = false;

    loadQuestion();

}


// =========================
// Previous Question
// =========================

function previousQuestion() {

    let selected =
        document.querySelector('input[name="answer"]:checked');

    if (selected) {

        answers[current] =
            parseInt(selected.value);

    }

    if (current > 0) {

        current--;

        loadQuestion();

    }

}


// =========================
// Next Question
// =========================

function nextQuestion() {

    let selected =
        document.querySelector('input[name="answer"]:checked');

    if (selected) {

        answers[current] =
            parseInt(selected.value);

    }

    if (current < questions.length - 1) {

        current++;

        loadQuestion();

    }

}


// =========================
// Create Question Palette
// =========================

function createPalette() {

    let html = "";

    for (let i = 0; i < questions.length; i++) {

        let className = "unansweredQuestion";

        if (i === current) {

            className = "currentQuestion";

        }

        else if (answers[i] !== null) {

            className = "answeredQuestion";

        }

        html += `

        <button
            class="paletteButton ${className}"
            onclick="goToQuestion(${i})">

            ${i + 1}

        </button>

        `;

    }

    document.getElementById("palette").innerHTML = html;

}


// =========================
// Jump To Any Question
// =========================

function goToQuestion(index) {

    let selected =
        document.querySelector('input[name="answer"]:checked');

    if (selected) {

        answers[current] =
            parseInt(selected.value);

    }

    current = index;

    loadQuestion();

}
// =========================
// Finish Test
// =========================

function finishTest() {

    clearInterval(masterInterval);

    clearInterval(questionInterval);

    // Save current answer before generating report

    let selected =
        document.querySelector('input[name="answer"]:checked');

    if (selected) {

        answers[current] =
            parseInt(selected.value);

    }

    let attempted = 0;

    let correct = 0;

    let wrong = 0;

    let skipped = 0;

    let totalScore = 0;

    let report = `

    <h1>CAT Test Report</h1>

    <table>

    <tr>

        <th>Q.No.</th>

        <th>Your Answer</th>

        <th>Correct Answer</th>

        <th>Result</th>

        <th>Marks</th>

        <th>Time Spent</th>

        <th>Target</th>

    </tr>

    `;


    for (let i = 0; i < questions.length; i++) {

        let correctIndex =
            questions[i].answer;

        let correctAnswer =
            questions[i].options[correctIndex];

        let candidateAnswer =
            "No Answer";

        let result = "-";

        let marks = 0;

        let rowClass = "skipped";


        if (answers[i] !== null) {

            attempted++;

            candidateAnswer =
                questions[i].options[answers[i]];

            if (answers[i] === correctIndex) {

                correct++;

                totalScore += 3;

                marks = 3;

                result = "✅";

                rowClass = "correct";

            }

            else {

                wrong++;

                totalScore -= 1;

                marks = -1;

                result = "❌";

                rowClass = "wrong";

            }

        }

        else {

            skipped++;

        }


        let minutes =
            Math.floor(timeSpent[i] / 60);

        let seconds =
            timeSpent[i] % 60;


        report += `

        <tr class="${rowClass}">

            <td>${i + 1}</td>

            <td>${candidateAnswer}</td>

            <td>${correctAnswer}</td>

            <td>${result}</td>

            <td>${marks}</td>

            <td>${minutes}m ${seconds}s</td>

            <td>5m</td>

        </tr>

        `;

    }

    report += "</table>";


    let accuracy = 0;

    if (attempted > 0) {

        accuracy =
            (correct / attempted * 100)
            .toFixed(2);

    }


    let summary = `

    <div class="summary">

        <h1>CAT Test Summary</h1>

        <h2>Total Questions : ${questions.length}</h2>

        <h2>Attempted : ${attempted}</h2>

        <h2>Correct : ${correct}</h2>

        <h2>Wrong : ${wrong}</h2>

        <h2>Skipped : ${skipped}</h2>

        <h2>Raw Score : ${totalScore}</h2>

        <h2>Accuracy : ${accuracy}%</h2>

    </div>

    <hr>

    `;


    document.body.innerHTML =
        summary + report;

}
