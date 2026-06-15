// -------------------- Global Variables --------------------

let current = 0;

let questions = [];

let answers = [];

let timeSpent = [];

let reviewMode = false;

let masterTime;

let questionTime;

let masterInterval;

let questionInterval;


// -------------------- Load Questions --------------------

fetch("questions.json")

.then(response => response.json())

.then(data => {

    questions = data;

    answers = new Array(questions.length).fill(null);

    timeSpent = new Array(questions.length).fill(0);

    // Master timer = 5 minutes per question

    masterTime = questions.length * 5 * 60;

    startMasterTimer();

    loadQuestion();

});


// -------------------- Format Time --------------------

function formatTime(time) {

    let hrs = Math.floor(time / 3600);

    let mins = Math.floor((time % 3600) / 60);

    let secs = time % 60;

    hrs = hrs.toString().padStart(2, '0');

    mins = mins.toString().padStart(2, '0');

    secs = secs.toString().padStart(2, '0');

    return hrs + ":" + mins + ":" + secs;

}


// -------------------- Master Timer --------------------

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


// -------------------- Question Timer --------------------

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


// -------------------- Load Question --------------------

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


// -------------------- Submit Answer --------------------

function submitAnswer() {

    let selected =

        document.querySelector('input[name="answer"]:checked');

    if (selected) {

        answers[current] = parseInt(selected.value);

    }

    clearInterval(questionInterval);

    autoNext();

}


// -------------------- Skip Question --------------------

function skipQuestion() {

    clearInterval(questionInterval);

    autoNext();

}
