// ======================================
// CAT Practice Script V3
// ======================================

// Global Variables

let questions = [];

let currentQuestion = 0;

let userAnswers = [];

let questionTimes = [];

let questionStartTime = Date.now();

let masterTimeLeft = 0;

let questionTimeLeft = 300;

let masterTimerInterval;

let questionTimerInterval;


// ======================================
// Shuffle Array
// ======================================

function shuffleArray(arr) {

    let a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        [a[i], a[j]] = [a[j], a[i]];

    }

    return a;
}


// ======================================
// Save Time Spent
// ======================================

function saveTimeSpent() {

    let now = Date.now();

    let spent =

        Math.floor(

            (now - questionStartTime)

            / 1000

        );

    questionTimes[currentQuestion] +=

        spent;

    questionStartTime = now;

}


// ======================================
// Load Questions
// ======================================

fetch("questions.json")

.then(response => {

    if (!response.ok) {

        throw new Error(

            "Cannot load questions.json"

        );

    }

    return response.json();

})

.then(data => {

    // Separate by difficulty
let easyQuestions = shuffleArray(
    data.filter(q => q.difficulty === "Easy")
).slice(0, 10);

let mediumQuestions = shuffleArray(
    data.filter(q => q.difficulty === "Medium")
).slice(0, 10);

let hardQuestions = shuffleArray(
    data.filter(q => q.difficulty === "Hard")
).slice(0, 10);

questions = shuffleArray([
    ...easyQuestions,
    ...mediumQuestions,
    ...hardQuestions
]);

// Combine and shuffle again
questions =
    shuffleArray([
        ...easyQuestions,
        ...mediumQuestions,
        ...hardQuestions
    ]);


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

    "Error loading questions.json";

});
// ======================================
// Load Question
// ======================================

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
            userAnswers[currentQuestion]
            === i
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
    ).innerHTML = html;


    updatePalette();

    updateButtons();

}



// ======================================
// Create Palette
// ======================================

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
    ).innerHTML = html;

}



// ======================================
// Update Palette
// ======================================

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



// ======================================
// Jump To Question
// ======================================

function jumpToQuestion(index) {

    saveTimeSpent();

    currentQuestion = index;

    questionStartTime = Date.now();

    questionTimeLeft = 300;

    loadQuestion();

}



// ======================================
// Format Time
// ======================================

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



// ======================================
// Master Timer
// ======================================

function startMasterTimer() {

    masterTimerInterval =

        setInterval(

        function() {

            masterTimeLeft--;


            document.getElementById(
                "masterTimer"
            ).innerHTML =

            "Master Timer : "

            +

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



// ======================================
// Question Timer
// ======================================

function startQuestionTimer() {

    questionTimerInterval =

        setInterval(

        function() {

            questionTimeLeft--;


            document.getElementById(
                "questionTimer"
            ).innerHTML =

            "Question Timer : "

            +

            formatTime(
                questionTimeLeft
            );


            if (

                questionTimeLeft <= 0

            ) {

                saveTimeSpent();


                if (

                    currentQuestion

                    <

                    questions.length - 1

                ) {

                    currentQuestion++;

                    questionTimeLeft = 300;

                    questionStartTime = Date.now();

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



// ======================================
// Update Buttons
// ======================================

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
// ======================================
// Submit Answer
// ======================================

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


    saveTimeSpent();


    userAnswers[currentQuestion] =

        parseInt(

            selected.value

        );


    updatePalette();

    updateButtons();


    // Move to next question

    if (

        currentQuestion <

        questions.length - 1

    ) {

        currentQuestion++;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

    else {

        finishTest();

    }

}



// ======================================
// Skip Question
// ======================================

function skipQuestion() {

    saveTimeSpent();


    if (

        currentQuestion <

        questions.length - 1

    ) {

        currentQuestion++;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

    else {

        finishTest();

    }

}



// ======================================
// Previous Question
// ======================================

function previousQuestion() {

    if (

        currentQuestion > 0

    ) {

        saveTimeSpent();

        currentQuestion--;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

}



// ======================================
// Next Question
// ======================================

function nextQuestion() {

    if (

        currentQuestion <

        questions.length - 1

    ) {

        saveTimeSpent();

        currentQuestion++;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

}



// ======================================
// Finish Test
// ======================================

function finishTest() {

    saveTimeSpent();

    clearInterval(masterTimerInterval);

    clearInterval(questionTimerInterval);

    clearSavedProgress();

    generateReport();

}


// ======================================
// Review Question
// ======================================

function reviewQuestion(index) {

    currentQuestion = index;

    loadQuestion();

}



// ======================================
// Keyboard Shortcuts
// ======================================

document.addEventListener(

    "keydown",

    function(event) {


        // Next Question

        if (

            event.key ===

            "ArrowRight"

        ) {

            nextQuestion();

        }


        // Previous Question

        if (

            event.key ===

            "ArrowLeft"

        ) {

            previousQuestion();

        }


        // Finish Test

        if (

            event.key ===

            "f"

        ) {

            finishTest();

        }

    }

);



// ======================================
// Enable Finish Button
// ======================================

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



// ======================================
// Review Entire Test
// ======================================

function reviewAll() {

    currentQuestion = 0;

    loadQuestion();

}

    // Move to next question

    if (

        currentQuestion <

        questions.length - 1

    ) {

        currentQuestion++;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

    else {

        finishTest();

    }

}



// ======================================
// Skip Question
// ======================================

function skipQuestion() {

    saveTimeSpent();


    if (

        currentQuestion <

        questions.length - 1

    ) {

        currentQuestion++;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

    else {

        finishTest();

    }

}



// ======================================
// Previous Question
// ======================================

function previousQuestion() {

    if (

        currentQuestion > 0

    ) {

        saveTimeSpent();

        currentQuestion--;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

}



// ======================================
// Next Question
// ======================================

function nextQuestion() {

    if (

        currentQuestion <

        questions.length - 1

    ) {

        saveTimeSpent();

        currentQuestion++;

        questionStartTime = Date.now();

        questionTimeLeft = 300;

        loadQuestion();

    }

}



// ======================================
// Finish Test
// ======================================

function finishTest() {

    saveTimeSpent();


    clearInterval(

        masterTimerInterval

    );


    clearInterval(

        questionTimerInterval

    );


    generateReport();

}



// ======================================
// Review Question
// ======================================

function reviewQuestion(index) {

    currentQuestion = index;

    loadQuestion();

}



// ======================================
// Keyboard Shortcuts
// ======================================

document.addEventListener(

    "keydown",

    function(event) {


        // Next Question

        if (

            event.key ===

            "ArrowRight"

        ) {

            nextQuestion();

        }


        // Previous Question

        if (

            event.key ===

            "ArrowLeft"

        ) {

            previousQuestion();

        }


        // Finish Test

        if (

            event.key ===

            "f"

        ) {

            finishTest();

        }

    }

);



// ======================================
// Enable Finish Button
// ======================================

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



// ======================================
// Review Entire Test
// ======================================

function reviewAll() {

    currentQuestion = 0;

    loadQuestion();

}
// ======================================
// Generate Report
// ======================================

function generateReport() {

    let totalMarks = 0;

    let correctCount = 0;

    let wrongCount = 0;

    let skippedCount = 0;

    let totalTime = 0;

    let topicStats = {};

    let difficultyStats = {};

    let reportHTML = "";


    // ======================================
    // Calculate Statistics
    // ======================================

    for (

        let i = 0;

        i < questions.length;

        i++

    ) {

        let q = questions[i];

        let topic =

            q.topic || "General";

        let difficulty =

            q.difficulty || "Unknown";


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

            correctCount++;

            totalMarks += 3;

            topicStats[topic].correct++;

            difficultyStats[difficulty].correct++;

        }

        else {

            wrongCount++;

            totalMarks -= 1;

        }


        totalTime +=

            questionTimes[i];

    }


    // ======================================
    // Accuracy
    // ======================================

    let accuracy =

        (

            correctCount /

            (

                correctCount +

                wrongCount ||

                1

            )

        ) * 100;


    // ======================================
    // Summary
    // ======================================

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


    // ======================================
    // Topic Analysis
    // ======================================

    reportHTML +=

    "<h2>Topic Analysis</h2>";

    reportHTML +=

    "<table border='1'>";

    reportHTML +=

    "<tr><th>Topic</th><th>Correct</th><th>Average Time</th></tr>";


    for (

        let topic in topicStats

    ) {

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

        ${(topicStats[topic].time/topicStats[topic].total/60).toFixed(2)}

        min

        </td>

        </tr>

        `;

    }

    reportHTML +=

    "</table><br>";


    // ======================================
    // Difficulty Analysis
    // ======================================

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


    // ======================================
    // Detailed Report
    // ======================================

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

        let colour = "#fff3cd";


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

        margin:15px;

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

        </div>

        `;

    }


    // ======================================
    // Display Report
    // ======================================

    document.getElementById(

        "report"

    ).innerHTML =

    reportHTML;
    addReportButtons();

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
