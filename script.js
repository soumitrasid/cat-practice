// =====================================
// GLOBAL VARIABLES
// =====================================

let questions = [];

let currentQuestion = 0;

let userAnswers = [];

let questionTimes = [];

let currentQuestionStartTime = Date.now();

let masterTimeLeft = 0;

let questionTimeLeft = 300;

let masterTimerInterval;

let questionTimerInterval;


// =====================================
// SHUFFLE FUNCTION
// =====================================

function shuffleArray(arr) {

    let a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        [a[i], a[j]] = [a[j], a[i]];

    }

    return a;

}


// =====================================
// SAVE TIME OF CURRENT QUESTION
// =====================================

function saveCurrentQuestionTime() {

    let now = Date.now();

    let secondsSpent =

        Math.floor(

            (now - currentQuestionStartTime) / 1000

        );

    questionTimes[currentQuestion] +=

        secondsSpent;

    currentQuestionStartTime = now;

}


// =====================================
// SMART QUESTION SELECTION
// =====================================

function selectQuestions(data) {

    let easyQuestions =

        shuffleArray(

            data.filter(

                q => q.difficulty === "Easy"

            )

        );



    let mediumQuestions =

        shuffleArray(

            data.filter(

                q => q.difficulty === "Medium"

            )

        );



    let hardQuestions =

        shuffleArray(

            data.filter(

                q => q.difficulty === "Hard"

            )

        );


    let selected = [];


    // Safe selection

    selected.push(

        ...easyQuestions.slice(

            0,

            Math.min(10, easyQuestions.length)

        )

    );


    selected.push(

        ...mediumQuestions.slice(

            0,

            Math.min(10, mediumQuestions.length)

        )

    );


    selected.push(

        ...hardQuestions.slice(

            0,

            Math.min(10, hardQuestions.length)

        )

    );


    // Fill remaining slots

    let remainingPool =

        shuffleArray(

            data.filter(

                q => !selected.includes(q)

            )

        );


    while (

        selected.length < 30 &&

        remainingPool.length > 0

    ) {

        selected.push(

            remainingPool.shift()

        );

    }


    return shuffleArray(selected);

}


// =====================================
// LOAD QUESTION BANK
// =====================================
if (!restoreProgress()) {

    fetch("questions_master.json")

    .then(response => response.json())

    .then(data => {

        questions = selectQuestions(data);

        userAnswers =
            Array(questions.length).fill(null);

        questionTimes =
            Array(questions.length).fill(0);

        masterTimeLeft =
            questions.length * 300;

        createPalette();

        loadQuestion();

        startMasterTimer();

        startQuestionTimer();

    });

}
fetch("questions_master.json")

.then(response => {

    if (!response.ok) {

        throw new Error(

            "Cannot load questions_master.json"

        );

    }

    return response.json();

})

.then(data => {

    questions = selectQuestions(data);


    userAnswers =

        Array(

            questions.length

        ).fill(null);


    questionTimes =

        Array(

            questions.length

        ).fill(0);


    masterTimeLeft =

        questions.length * 300;


    createPalette();

    loadQuestion();

    startMasterTimer();

    startQuestionTimer();

})

.catch(error => {

    console.error(error);

    document.getElementById(

        "question"

    ).innerHTML =

    "Error loading questions_master.json";

});
// =====================================
// LOAD QUESTION
// =====================================

function loadQuestion() {

    let q = questions[currentQuestion];

    document.getElementById(
        "questionNumber"
    ).innerHTML =

    `Question ${currentQuestion + 1}`;

    document.getElementById(
        "question"
    ).innerHTML =

    q.question;


    let html = "";


    for (

        let i = 0;

        i < q.options.length;

        i++

    ) {

        let checked = "";


        if (

            userAnswers[currentQuestion] === i

        ) {

            checked = "checked";

        }


        html +=

        `

        <p>

        <label>

        <input

            type="radio"

            name="option"

            value="${i}"

            ${checked}

        >

        ${q.options[i]}

        </label>

        </p>

        `;

    }


    document.getElementById(

        "options"

    ).innerHTML =

    html;


    updatePalette();

    updateButtons();

}


// =====================================
// CREATE PALETTE
// =====================================

function createPalette() {

    let html = "";


    for (

        let i = 0;

        i < questions.length;

        i++

    ) {

        html +=

        `

        <button

            class="paletteButton unansweredQuestion"

            id="palette${i}"

            onclick="jumpToQuestion(${i})"

        >

            ${i+1}

        </button>

        `;

    }


    document.getElementById(

        "palette"

    ).innerHTML =

    html;

}


// =====================================
// UPDATE PALETTE
// =====================================

function updatePalette() {

    for (

        let i = 0;

        i < questions.length;

        i++

    ) {

        let box =

            document.getElementById(

                `palette${i}`

            );


        box.className =

            "paletteButton";


        if (

            userAnswers[i] !== null

        ) {

            box.classList.add(

                "answeredQuestion"

            );

        }

        else {

            box.classList.add(

                "unansweredQuestion"

            );

        }


        if (

            i === currentQuestion

        ) {

            box.classList.add(

                "currentQuestion"

            );

        }

    }

}


// =====================================
// JUMP TO QUESTION
// =====================================

function jumpToQuestion(index) {

    saveCurrentQuestionTime();

    currentQuestion = index;

    currentQuestionStartTime = Date.now();

    questionTimeLeft = 300;

    loadQuestion();

}


// =====================================
// FORMAT TIME
// =====================================

function formatTime(seconds) {

    let hrs =

        String(

            Math.floor(seconds/3600)

        ).padStart(2,'0');


    let mins =

        String(

            Math.floor(

                (seconds%3600)/60

            )

        ).padStart(2,'0');


    let secs =

        String(

            seconds%60

        ).padStart(2,'0');


    return

        `${hrs}:${mins}:${secs}`;

}


// =====================================
// MASTER TIMER
// =====================================

function startMasterTimer() {

    masterTimerInterval =

        setInterval(

        function() {

            masterTimeLeft--;


            document.getElementById(

                "masterTimer"

            ).innerHTML =

            "Master Timer : " +

            formatTime(

                masterTimeLeft

            );


            if (

                masterTimeLeft <= 0

            ) {

                finishTest();

            }

        },

        1000

    );

}


// =====================================
// QUESTION TIMER
// =====================================

function startQuestionTimer() {

    questionTimerInterval =

        setInterval(

        function() {

            questionTimeLeft--;


            document.getElementById(

                "questionTimer"

            ).innerHTML =

            "Question Timer : " +

            formatTime(

                questionTimeLeft

            );


            if (

                questionTimeLeft <= 0

            ) {

                saveCurrentQuestionTime();


                if (

                    currentQuestion

                    <

                    questions.length - 1

                ) {

                    currentQuestion++;

                    questionTimeLeft = 300;

                    currentQuestionStartTime = Date.now();

                    loadQuestion();

                }

                else {

                    finishTest();

                }

            }

        },

        1000

    );

}


// =====================================
// UPDATE BUTTONS
// =====================================

function updateButtons() {

    document.getElementById(

        "prevBtn"

    ).disabled =

        currentQuestion === 0;


    document.getElementById(

        "nextBtn"

    ).disabled =

        currentQuestion ===

        questions.length - 1;


    let answeredCount =

        userAnswers.filter(

            x => x !== null

        ).length;


    document.getElementById(

        "finishBtn"

    ).disabled =

        answeredCount === 0;

}
// =====================================
// SUBMIT ANSWER
// =====================================

function submitAnswer() {

    let selected =

        document.querySelector(

            'input[name="option"]:checked'

        );


    if (!selected) {

        alert(

            "Please select an answer."

        );

        return;

    }


    saveCurrentQuestionTime();


    userAnswers[currentQuestion] =

        parseInt(

            selected.value

        );


    updatePalette();

    updateButtons();


    // Auto move

    if (

        currentQuestion <

        questions.length - 1

    ) {

        currentQuestion++;

        currentQuestionStartTime =

            Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

    else {

        finishTest();

    }

}



// =====================================
// SKIP QUESTION
// =====================================

function skipQuestion() {

    saveCurrentQuestionTime();


    if (

        currentQuestion <

        questions.length - 1

    ) {

        currentQuestion++;

        currentQuestionStartTime =

            Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

    else {

        finishTest();

    }

}



// =====================================
// PREVIOUS QUESTION
// =====================================

function previousQuestion() {

    if (

        currentQuestion > 0

    ) {

        saveCurrentQuestionTime();

        currentQuestion--;

        currentQuestionStartTime =

            Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

}



// =====================================
// NEXT QUESTION
// =====================================

function nextQuestion() {

    if (

        currentQuestion <

        questions.length - 1

    ) {

        saveCurrentQuestionTime();

        currentQuestion++;

        currentQuestionStartTime =

            Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

}



// =====================================
// FINISH TEST
// =====================================

function finishTest() {

    saveCurrentQuestionTime();

    clearInterval(

        masterTimerInterval

    );

    clearInterval(

        questionTimerInterval

    );

    generateReport();

}



// =====================================
// REVIEW MODE
// =====================================

function reviewQuestion(index) {

    currentQuestion = index;

    loadQuestion();

}



// =====================================
// KEYBOARD SHORTCUTS
// =====================================

document.addEventListener(

    "keydown",

    function(event) {

        // Right Arrow

        if (

            event.key ===

            "ArrowRight"

        ) {

            nextQuestion();

        }


        // Left Arrow

        if (

            event.key ===

            "ArrowLeft"

        ) {

            previousQuestion();

        }


        // Finish test

        if (

            event.key ===

            "f"

        ) {

            finishTest();

        }

    }

);



// =====================================
// ENABLE FINISH BUTTON
// =====================================

document.addEventListener(

    "change",

    function(event) {

        if (

            event.target.name ===

            "option"

        ) {

            document.getElementById(

                "finishBtn"

            ).disabled = false;

        }

    }

);



// =====================================
// REVIEW ALL QUESTIONS
// =====================================

function reviewAll() {

    currentQuestion = 0;

    loadQuestion();

}
// =====================================
// GENERATE REPORT
// =====================================

function generateReport() {

    let totalMarks = 0;

    let correctCount = 0;

    let wrongCount = 0;

    let skippedCount = 0;

    let totalTime = 0;

    let topicStats = {};

    let difficultyStats = {};

    let reportHTML = "";


    // =====================================
    // CALCULATE RESULTS
    // =====================================

    for (

        let i = 0;

        i < questions.length;

        i++

    ) {

        let q = questions[i];

        let topic = q.topic;

        let difficulty = q.difficulty;


        if (

            !topicStats[topic]

        ) {

            topicStats[topic] = {

                correct:0,

                total:0,

                time:0

            };

        }


        if (

            !difficultyStats[difficulty]

        ) {

            difficultyStats[difficulty] = {

                correct:0,

                total:0

            };

        }


        topicStats[topic].total++;

        topicStats[topic].time +=

            questionTimes[i];


        difficultyStats[difficulty].total++;


        if (

            userAnswers[i] === null

        ) {

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


        totalTime +=

            questionTimes[i];

    }


    // =====================================
    // ACCURACY
    // =====================================

    let accuracy =

        (

            correctCount /

            (

                correctCount +

                wrongCount ||

                1

            )

        )

        *100;


    // =====================================
    // SUMMARY
    // =====================================

    reportHTML +=

    `

    <h1>

    TEST REPORT

    </h1>


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

    <b>

    Accuracy :

    </b>

    ${accuracy.toFixed(2)} %

    <br><br>

    <b>

    Average Time per Question :

    </b>

    ${(totalTime/questions.length/60).toFixed(2)}

    min

    <br><br>

    `;


    // =====================================
    // TOPIC ANALYSIS
    // =====================================

    reportHTML +=

    "<h2>Topic Analysis</h2>";

    reportHTML +=

    "<table border='1'>";

    reportHTML +=

    "<tr><th>Topic</th><th>Correct</th><th>Avg Time</th></tr>";


    for (

        let topic in topicStats

    ) {

        let avgTime =

            (

                topicStats[topic].time

                /

                topicStats[topic].total

                /

                60

            )

            .toFixed(2);


        reportHTML +=

        `

        <tr>

        <td>

        ${topic}

        </td>

        <td>

        ${topicStats[topic].correct}

        /

        ${topicStats[topic].total}

        </td>

        <td>

        ${avgTime}

        min

        </td>

        </tr>

        `;

    }

    reportHTML +=

    "</table><br>";


    // =====================================
    // DIFFICULTY ANALYSIS
    // =====================================

    reportHTML +=

    "<h2>Difficulty Analysis</h2>";

    reportHTML +=

    "<table border='1'>";

    reportHTML +=

    "<tr><th>Difficulty</th><th>Correct</th></tr>";


    for (

        let d in difficultyStats

    ) {

        reportHTML +=

        `

        <tr>

        <td>

        ${d}

        </td>

        <td>

        ${difficultyStats[d].correct}

        /

        ${difficultyStats[d].total}

        </td>

        </tr>

        `;

    }

    reportHTML +=

    "</table><br>";


    // =====================================
    // DETAILED REPORT
    // =====================================

    reportHTML +=

    "<h2>Detailed Report</h2>";


    for (

        let i = 0;

        i < questions.length;

        i++

    ) {

        let q = questions[i];

        let status = "";

        let marks = 0;

        let colour = "#fff8dc";


        if (

            userAnswers[i] === null

        ) {

            status = "Skipped";

            marks = 0;

            colour = "#fff3cd";

        }

        else if (

            userAnswers[i] === q.answer

        ) {

            status = "Correct";

            marks = 3;

            colour = "#d4edda";

        }

        else {

            status = "Wrong";

            marks = -1;

            colour = "#f8d7da";

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

        <div

        style="

        background:${colour};

        padding:15px;

        margin:20px;

        border-radius:10px;

        "

        >

        <h3>

        Question ${i+1}

        </h3>

        <b>

        Topic :

        </b>

        ${q.topic}

        <br>

        <b>

        Difficulty :

        </b>

        ${q.difficulty}

        <br><br>

        ${q.question}

        <br><br>

        <b>

        Your Answer :

        </b>

        ${candidateAnswer}

        <br><br>

        <b>

        Correct Answer :

        </b>

        ${correctAnswer}

        <br><br>

        <b>

        Result :

        </b>

        ${status}

        <br><br>

        <b>

        Marks :

        </b>

        ${marks}

        <br><br>

        <b>

        Time Spent :

        </b>

        ${(questionTimes[i]/60).toFixed(2)}

        min

        <br><br>

        <b>

        Target Time :

        </b>

        5 min

        </div>

        `;

    }


    // =====================================
    // SHOW REPORT
    // =====================================

    document.getElementById(

        "report"

    ).innerHTML =

    reportHTML;


    document.getElementById(

        "question"

    ).style.display =

    "none";


    document.getElementById(

        "options"

    ).style.display =

    "none";


    document.getElementById(

        "palette"

    ).style.display =

    "none";

}
// =====================================
// AUTO SAVE
// =====================================

function saveProgress() {

    let state = {

        currentQuestion,

        userAnswers,

        questionTimes,

        masterTimeLeft,

        questionTimeLeft,

        questions

    };

    localStorage.setItem(

        "CAT_TEST_PROGRESS",

        JSON.stringify(state)

    );

}



// =====================================
// RESTORE TEST
// =====================================

function restoreProgress() {

    let saved =

        localStorage.getItem(

            "CAT_TEST_PROGRESS"

        );

    if (!saved) {

        return false;

    }

    let state =

        JSON.parse(saved);


    questions = state.questions;

    currentQuestion = state.currentQuestion;

    userAnswers = state.userAnswers;

    questionTimes = state.questionTimes;

    masterTimeLeft = state.masterTimeLeft;

    questionTimeLeft = state.questionTimeLeft;


    createPalette();

    loadQuestion();

    startMasterTimer();

    startQuestionTimer();

    return true;

}



// =====================================
// SAVE EVERY 10 SECONDS
// =====================================

setInterval(

    saveProgress,

    10000

);



// =====================================
// CLEAR SAVED TEST
// =====================================

function clearSavedProgress() {

    localStorage.removeItem(

        "CAT_TEST_PROGRESS"

    );

}



// =====================================
// RESET TEST
// =====================================

function resetTest() {

    clearSavedProgress();

    location.reload();

}



// =====================================
// DOWNLOAD REPORT
// =====================================

function downloadReport() {

    let reportContent =

        document.getElementById(

            "report"

        ).innerHTML;


    let html =

        `

        <html>

        <head>

        <title>

        CAT Report

        </title>

        </head>

        <body>

        ${reportContent}

        </body>

        </html>

        `;


    let blob =

        new Blob(

            [html],

            {

                type:

                "text/html"

            }

        );


    let link =

        document.createElement(

            "a"

        );


    link.href =

        URL.createObjectURL(

            blob

        );


    link.download =

        "CAT_Report.html";


    link.click();

}



// =====================================
// MODIFY finishTest()
// Replace your old finishTest()
// with this version
// =====================================

function finishTest() {

    saveCurrentQuestionTime();

    clearInterval(

        masterTimerInterval

    );

    clearInterval(

        questionTimerInterval

    );

    clearSavedProgress();

    generateReport();

}



// =====================================
// ADD BUTTONS TO REPORT
// =====================================

function addReportButtons() {

    let html =

        `

        <br><br>

        <button

        onclick="downloadReport()">

        Download Report

        </button>


        <button

        onclick="resetTest()">

        New Test

        </button>

        `;


    document.getElementById(

        "report"

    ).innerHTML += html;

}
