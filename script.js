let current = 0;
let questions = [];
let answers = [];

let reviewMode = false;

let masterTime;
let questionTime;

let masterInterval;
let questionInterval;

// -------------------------
// Load questions
// -------------------------

fetch("questions.json")
.then(response => response.json())
.then(data => {

    questions = data;

    answers = new Array(questions.length).fill(null);

    // 5 minutes per question
    masterTime = questions.length * 5 * 60;

    startMasterTimer();

    loadQuestion();

});

// -------------------------

function formatTime(time) {

    let hrs = Math.floor(time / 3600);
    let mins = Math.floor((time % 3600) / 60);
    let secs = time % 60;

    hrs = hrs.toString().padStart(2, '0');
    mins = mins.toString().padStart(2, '0');
    secs = secs.toString().padStart(2, '0');

    return hrs + ":" + mins + ":" + secs;
}

// -------------------------

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

// -------------------------

function startQuestionTimer() {

    clearInterval(questionInterval);

    // 5 minutes
    questionTime = 5 * 60;

    questionInterval = setInterval(function () {

        document.getElementById("questionTimer").innerHTML =
            "Question Timer : " + formatTime(questionTime);

        questionTime--;

        if (questionTime < 0) {

            autoNext();

        }

    }, 1000);

}

// -------------------------

function loadQuestion() {

    document.getElementById("questionNumber").innerHTML =
        "Question " + (current + 1) + " of " + questions.length;

    document.getElementById("question").innerHTML =
        questions[current].question;

    let html = "";

    questions[current].options.forEach((option, i) => {

        let checked = "";

        if (answers[current] === i)
            checked = "checked";

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

    if (!reviewMode)
        startQuestionTimer();

}

// -------------------------

function submitAnswer() {

    let selected =
        document.querySelector('input[name="answer"]:checked');

    if (selected)
        answers[current] = parseInt(selected.value);

    clearInterval(questionInterval);

    autoNext();

}

// -------------------------

function skipQuestion() {

    clearInterval(questionInterval);

    autoNext();

}

// -------------------------

function autoNext() {

    if (current < questions.length - 1) {

        current++;

        loadQuestion();

    }

    else {

        enterReviewMode();

    }

}

// -------------------------

function enterReviewMode() {

    reviewMode = true;

    clearInterval(questionInterval);

    document.getElementById("questionTimer").innerHTML =
        "Review Mode";

    current = 0;

    document.getElementById("prevBtn").disabled = false;
    document.getElementById("nextBtn").disabled = false;

    loadQuestion();

}

// -------------------------

function previousQuestion() {

    if (current > 0) {

        current--;

        loadQuestion();

    }

}

// -------------------------

function nextQuestion() {

    let selected =
        document.querySelector('input[name="answer"]:checked');

    if (selected)
        answers[current] = parseInt(selected.value);

    if (current < questions.length - 1) {

        current++;

        loadQuestion();

    }

    else {

        finishTest();

    }

}

// -------------------------

function finishTest() {

    clearInterval(masterInterval);
    clearInterval(questionInterval);

    let score = 0;

    for (let i = 0; i < questions.length; i++) {

        if (answers[i] === questions[i].answer)
            score++;

    }

    document.body.innerHTML =

        "<h1>Test Finished</h1>" +
        "<h2>Score : " + score + " / " + questions.length + "</h2>";

}
