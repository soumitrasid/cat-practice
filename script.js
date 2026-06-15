let current = 0;
let questions = [];
let answers = [];
let timeSpent = [];

let reviewMode = false;

let masterTime;
let questionTime;

let masterInterval;
let questionInterval;


// -------------------- LOAD QUESTIONS --------------------

fetch("questions.json")
.then(response => response.json())
.then(data => {

    questions = data;

    answers = new Array(questions.length).fill(null);

    timeSpent = new Array(questions.length).fill(0);

    // Master time = 5 min per question
    masterTime = questions.length * 5 * 60;

    startMasterTimer();

    loadQuestion();

});


// -------------------- FORMAT TIME --------------------

function formatTime(time) {

    let hrs = Math.floor(time / 3600);
    let mins = Math.floor((time % 3600) / 60);
    let secs = time % 60;

    hrs = hrs.toString().padStart(2, '0');
    mins = mins.toString().padStart(2, '0');
    secs = secs.toString().padStart(2, '0');

    return hrs + ":" + mins + ":" + secs;

}


// -------------------- MASTER TIMER --------------------

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


// -------------------- QUESTION TIMER --------------------

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


// -------------------- LOAD QUESTION --------------------

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


// -------------------- SUBMIT ANSWER --------------------

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


// -------------------- SKIP QUESTION --------------------

function skipQuestion() {

    clearInterval(questionInterval);

    autoNext();

}


// -------------------- AUTO NEXT --------------------

function autoNext() {

    if (current < questions.length - 1) {

        current++;

        loadQuestion();

    }

    else {

        enterReviewMode();

    }

}


// -------------------- REVIEW MODE --------------------

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


// -------------------- PREVIOUS QUESTION --------------------

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


// -------------------- NEXT QUESTION --------------------

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


// -------------------- FINISH TEST --------------------

function finishTest() {

    clearInterval(masterInterval);

    clearInterval(questionInterval);

    let attempted = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    let totalScore = 0;

    let report = `
    <h1>CAT Test Report</h1>

    <table border="1"
           cellpadding="10"
           cellspacing="0">

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

        let correctIndex = questions[i].answer;

        let correctAnswer =
            questions[i].options[correctIndex];

        let candidateAnswer = "No Answer";

        let marks = 0;

        let result = "-";

        let rowColor = "#ffffcc";

        if (answers[i] != null) {

            attempted++;

            candidateAnswer =
                questions[i].options[answers[i]];

            if (answers[i] === correctIndex) {

                correct++;

                marks = 3;

                totalScore += 3;

                result = "✅";

                rowColor = "#ccffcc";

            }

            else {

                wrong++;

                marks = -1;

                totalScore -= 1;

                result = "❌";

                rowColor = "#ffcccc";

            }

        }

        else {

            skipped++;

        }

        let mins =
            Math.floor(timeSpent[i] / 60);

        let secs =
            timeSpent[i] % 60;

        report += `

        <tr style="background:${rowColor}">

        <td>${i + 1}</td>

        <td>${candidateAnswer}</td>

        <td>${correctAnswer}</td>

        <td>${result}</td>

        <td>${marks}</td>

        <td>${mins}m ${secs}s</td>

        <td>5m</td>

        </tr>
        `;
    }

    report += "</table>";

    let accuracy = 0;

    if (attempted > 0) {

        accuracy =
            (correct / attempted * 100).toFixed(2);

    }

    document.body.innerHTML = `

    <h1>CAT Test Summary</h1>

    <h2>Total Questions : ${questions.length}</h2>

    <h2>Attempted : ${attempted}</h2>

    <h2>Correct : ${correct}</h2>

    <h2>Wrong : ${wrong}</h2>

    <h2>Skipped : ${skipped}</h2>

    <h2>Raw Score : ${totalScore}</h2>

    <h2>Accuracy : ${accuracy}%</h2>

    <hr>

    ${report}

    `;
}
