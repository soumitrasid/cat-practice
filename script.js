// ======================================
// CAT Practice Script V5
// Uses all questions in JSON order; optional Timer ON/OFF switch
// ======================================

// Global Variables
let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let questionTimes = [];
let questionStartTime = Date.now();

let masterTimeLeft = 0;
let questionTimeLeft = 300;

let masterTimerInterval = null;
let questionTimerInterval = null;

let timerEnabled = false; // Timer is OFF by default
let testFinished = false;
let reviewMode = false;

// ======================================
// Format Time
// ======================================
function formatTime(seconds) {
    seconds = Math.max(0, seconds);

    let hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    let mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    let secs = String(seconds % 60).padStart(2, "0");

    return `${hrs}:${mins}:${secs}`;
}

// ======================================
// Create Timer Switch
// ======================================
function createTimerSwitch() {
    // Avoid creating the switch more than once
    if (document.getElementById("timerSwitchContainer")) return;

    const container = document.createElement("div");
    container.id = "timerSwitchContainer";
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 12px 15px;
        margin: 12px 0;
        background: #f2f6fc;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-family: Arial, sans-serif;
    `;

    container.innerHTML = `
        <label for="timerSwitch" style="font-weight: bold; cursor: pointer;">
            Enable Timer
        </label>

        <label style="
            position: relative;
            display: inline-block;
            width: 48px;
            height: 25px;
            cursor: pointer;
        ">
            <input
                type="checkbox"
                id="timerSwitch"
                style="opacity: 0; width: 0; height: 0;"
            >
            <span id="timerSwitchSlider" style="
                position: absolute;
                inset: 0;
                background: #9ca3af;
                border-radius: 25px;
                transition: 0.25s;
            "></span>
            <span id="timerSwitchKnob" style="
                position: absolute;
                height: 19px;
                width: 19px;
                left: 3px;
                top: 3px;
                background: white;
                border-radius: 50%;
                transition: 0.25s;
                pointer-events: none;
            "></span>
        </label>

        <strong id="timerStatus" style="color: #b45309;">
            OFF – Untimed Test
        </strong>

        <span style="font-size: 13px; color: #555;">
            Turn ON to activate the 5-minute question timer and master timer.
        </span>
    `;

    // Place the switch before the question number, if available
    const questionNumber = document.getElementById("questionNumber");

    if (questionNumber && questionNumber.parentNode) {
        questionNumber.parentNode.insertBefore(container, questionNumber);
    } else {
        document.body.insertBefore(container, document.body.firstChild);
    }

    document.getElementById("timerSwitch").addEventListener("change", function () {
        setTimerEnabled(this.checked);
    });

    updateTimerSwitchDisplay();
}

// ======================================
// Update Timer Switch Appearance
// ======================================
function updateTimerSwitchDisplay() {
    const slider = document.getElementById("timerSwitchSlider");
    const knob = document.getElementById("timerSwitchKnob");
    const status = document.getElementById("timerStatus");

    if (!slider || !knob || !status) return;

    if (timerEnabled) {
        slider.style.background = "#16a34a";
        knob.style.transform = "translateX(23px)";
        status.textContent = "ON – Timed Test";
        status.style.color = "#15803d";
    } else {
        slider.style.background = "#9ca3af";
        knob.style.transform = "translateX(0)";
        status.textContent = "OFF – Untimed Test";
        status.style.color = "#b45309";
    }
}

// ======================================
// Save Time Spent on Current Question
// ======================================
function saveTimeSpent() {
    if (testFinished || reviewMode || !questions.length) return;

    let now = Date.now();
    let spent = Math.floor((now - questionStartTime) / 1000);

    if (spent > 0 && questionTimes[currentQuestion] !== undefined) {
        questionTimes[currentQuestion] += spent;
    }

    questionStartTime = now;
}

// ======================================
// Start / Stop Timers
// ======================================
function stopTimers() {
    if (masterTimerInterval) {
        clearInterval(masterTimerInterval);
        masterTimerInterval = null;
    }

    if (questionTimerInterval) {
        clearInterval(questionTimerInterval);
        questionTimerInterval = null;
    }
}

function setTimerEnabled(enabled) {
    if (testFinished || reviewMode) return;

    // Save elapsed time before changing timer mode
    saveTimeSpent();

    timerEnabled = enabled;
    updateTimerSwitchDisplay();
    updateTimerDisplays();

    if (timerEnabled) {
        startMasterTimer();
        startQuestionTimer();
    } else {
        stopTimers();
    }

    questionStartTime = Date.now();
}

// ======================================
// Update Timer Displays
// ======================================
function updateTimerDisplays() {
    const masterDisplay = document.getElementById("masterTimer");
    const questionDisplay = document.getElementById("questionTimer");

    if (masterDisplay) {
        masterDisplay.innerHTML = timerEnabled
            ? "Master Timer : " + formatTime(masterTimeLeft)
            : "Master Timer : OFF";
    }

    if (questionDisplay) {
        questionDisplay.innerHTML = timerEnabled
            ? "Question Timer : " + formatTime(questionTimeLeft)
            : "Question Timer : OFF";
    }
}

// ======================================
// Load Questions
// ======================================
fetch("questions.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Cannot load questions.json");
        }
        return response.json();
    })
    .then(data => {
        // Use every question exactly once, preserving the order in questions.json.
        // The JSON answer field is 1-based (1 to number of options), while
        // this script stores radio-button selections as 0-based indices.
        if (!Array.isArray(data)) {
            throw new Error("questions.json must contain a JSON array.");
        }

        if (data.length === 0) {
            throw new Error("questions.json does not contain any questions.");
        }

        questions = data.map((q, index) => {
            if (
                !q ||
                typeof q.question !== "string" ||
                !Array.isArray(q.options) ||
                q.options.length < 2
            ) {
                throw new Error(`Question ${index + 1} has an invalid question/options format.`);
            }

            const oneBasedAnswer = Number(q.answer);

            if (
                !Number.isInteger(oneBasedAnswer) ||
                oneBasedAnswer < 1 ||
                oneBasedAnswer > q.options.length
            ) {
                throw new Error(
                    `Question ${index + 1} has an invalid answer. Use a 1-based answer number from 1 to ${q.options.length}.`
                );
            }

            return {
                ...q,
                answer: oneBasedAnswer - 1
            };
        });

        userAnswers = Array(questions.length).fill(null);
        questionTimes = Array(questions.length).fill(0);

        masterTimeLeft = questions.length * 300;
        questionTimeLeft = 300;

        createTimerSwitch();
        createPalette();
        loadQuestion();

        // Timer remains OFF until the student activates the switch
        timerEnabled = false;
        stopTimers();
        updateTimerSwitchDisplay();
        updateTimerDisplays();

        questionStartTime = Date.now();
    })
    .catch(error => {
        console.error(error);

        const questionElement = document.getElementById("question");
        if (questionElement) {
            questionElement.innerHTML = "Error loading questions.json";
        }
    });

// ======================================
// Load Question
// ======================================
function loadQuestion() {
    if (!questions.length) return;

    let q = questions[currentQuestion];

    document.getElementById("questionNumber").innerHTML =
        `Question ${currentQuestion + 1}`;

    document.getElementById("question").innerHTML = q.question;

    let html = "";

    for (let i = 0; i < q.options.length; i++) {
        let checked = userAnswers[currentQuestion] === i ? "checked" : "";

        html += `
            <p>
                <label>
                    <input type="radio" name="option" value="${i}" ${checked}>
                    ${q.options[i]}
                </label>
            </p>
        `;
    }

    document.getElementById("options").innerHTML = html;

    updatePalette();
    updateButtons();
    updateTimerDisplays();
}

// ======================================
// Create Question Palette
// ======================================
function createPalette() {
    let html = "";

    for (let i = 0; i < questions.length; i++) {
        html += `
            <button
                class="paletteButton unansweredQuestion"
                id="palette${i}"
                onclick="jumpToQuestion(${i})">
                ${i + 1}
            </button>
        `;
    }

    document.getElementById("palette").innerHTML = html;
}

// ======================================
// Update Question Palette
// ======================================
function updatePalette() {
    for (let i = 0; i < questions.length; i++) {
        let box = document.getElementById(`palette${i}`);
        if (!box) continue;

        box.className = "paletteButton";

        if (userAnswers[i] !== null) {
            box.classList.add("answeredQuestion");
        } else {
            box.classList.add("unansweredQuestion");
        }

        if (i === currentQuestion) {
            box.classList.add("currentQuestion");
        }
    }
}

// ======================================
// Move to a Question
// ======================================
function moveToQuestion(index) {
    if (index < 0 || index >= questions.length || testFinished) return;

    if (!reviewMode) {
        saveTimeSpent();
    }

    currentQuestion = index;

    // Every question has its own five-minute countdown.
    // If the timer is OFF, this value is simply held until timer activation.
    questionTimeLeft = 300;

    questionStartTime = Date.now();
    loadQuestion();
}

function jumpToQuestion(index) {
    moveToQuestion(index);
}

// ======================================
// Master Timer
// ======================================
function startMasterTimer() {
    if (!timerEnabled || testFinished || reviewMode || masterTimerInterval) return;

    masterTimerInterval = setInterval(function () {
        if (!timerEnabled || testFinished) return;

        masterTimeLeft--;
        updateTimerDisplays();

        if (masterTimeLeft <= 0) {
            finishTest();
        }
    }, 1000);
}

// ======================================
// Question Timer
// ======================================
function startQuestionTimer() {
    if (!timerEnabled || testFinished || reviewMode || questionTimerInterval) return;

    questionTimerInterval = setInterval(function () {
        if (!timerEnabled || testFinished) return;

        questionTimeLeft--;
        updateTimerDisplays();

        if (questionTimeLeft <= 0) {
            // Record the time up to the end of this question
            saveTimeSpent();

            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                questionTimeLeft = 300;
                questionStartTime = Date.now();
                loadQuestion();
            } else {
                finishTest();
            }
        }
    }, 1000);
}

// ======================================
// Update Buttons
// ======================================
function updateButtons() {
    document.getElementById("prevBtn").disabled = currentQuestion === 0;

    document.getElementById("nextBtn").disabled =
        currentQuestion === questions.length - 1;

    let answeredCount = userAnswers.filter(x => x !== null).length;

    document.getElementById("finishBtn").disabled = answeredCount === 0;
}

// ======================================
// Submit Answer
// ======================================
function submitAnswer() {
    if (testFinished) return;

    let selected = document.querySelector('input[name="option"]:checked');

    if (!selected) {
        alert("Please select an answer.");
        return;
    }

    if (!reviewMode) {
        saveTimeSpent();
    }

    userAnswers[currentQuestion] = parseInt(selected.value, 10);

    updatePalette();
    updateButtons();

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        questionTimeLeft = 300;
        questionStartTime = Date.now();
        loadQuestion();
    } else {
        finishTest();
    }
}

// ======================================
// Skip Question
// ======================================
function skipQuestion() {
    if (testFinished) return;

    if (currentQuestion < questions.length - 1) {
        moveToQuestion(currentQuestion + 1);
    } else {
        finishTest();
    }
}

// ======================================
// Previous Question
// ======================================
function previousQuestion() {
    if (currentQuestion > 0 && !testFinished) {
        moveToQuestion(currentQuestion - 1);
    }
}

// ======================================
// Next Question
// ======================================
function nextQuestion() {
    if (currentQuestion < questions.length - 1 && !testFinished) {
        moveToQuestion(currentQuestion + 1);
    }
}

// ======================================
// Finish Test
// ======================================
function finishTest() {
    if (testFinished) return;

    saveTimeSpent();

    testFinished = true;
    stopTimers();

    const timerSwitch = document.getElementById("timerSwitch");
    if (timerSwitch) timerSwitch.disabled = true;

    generateReport();
}

// ======================================
// Review a Question
// ======================================
function reviewQuestion(index) {
    if (index < 0 || index >= questions.length) return;

    reviewMode = true;
    stopTimers();

    currentQuestion = index;
    loadQuestion();
}

// ======================================
// Review Entire Test
// ======================================
function reviewAll() {
    reviewMode = true;
    stopTimers();

    currentQuestion = 0;
    loadQuestion();
}

// ======================================
// Show Review Mode
// ======================================
function showReviewMode() {
    document.getElementById("question").style.display = "block";
    document.getElementById("options").style.display = "block";
    document.getElementById("palette").style.display = "block";
    document.getElementById("report").style.display = "none";

    reviewMode = true;
    stopTimers();

    const timerContainer = document.getElementById("timerSwitchContainer");
    if (timerContainer) {
        timerContainer.style.display = "none";
    }

    reviewAll();
}

// ======================================
// Add Report Buttons
// ======================================
function addReportButtons() {
    let html = `
        <br>
        <button onclick="showReviewMode()">Review Answers</button>
        <br><br>
    `;

    document.getElementById("report").innerHTML += html;
}

// ======================================
// Keyboard Shortcuts
// ======================================
document.addEventListener("keydown", function (event) {
    // Do not trigger shortcuts while typing in an input
    if (
        event.target &&
        (event.target.tagName === "INPUT" ||
         event.target.tagName === "TEXTAREA")
    ) {
        return;
    }

    if (event.key === "ArrowRight") {
        nextQuestion();
    }

    if (event.key === "ArrowLeft") {
        previousQuestion();
    }

    if (event.key.toLowerCase() === "f") {
        finishTest();
    }
});

// ======================================
// Enable Finish Button When an Option Is Selected
// ======================================
document.addEventListener("change", function (event) {
    if (event.target && event.target.name === "option") {
        document.getElementById("finishBtn").disabled = false;
    }
});

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
    for (let i = 0; i < questions.length; i++) {
        let q = questions[i];
        let topic = q.topic || "General";
        let difficulty = q.difficulty || "Unknown";

        if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0, time: 0 };
        }

        if (!difficultyStats[difficulty]) {
            difficultyStats[difficulty] = { correct: 0, total: 0 };
        }

        topicStats[topic].total++;
        topicStats[topic].time += questionTimes[i];

        difficultyStats[difficulty].total++;

        if (userAnswers[i] === null) {
            skippedCount++;
        } else if (userAnswers[i] === q.answer) {
            correctCount++;
            totalMarks += 3;
            topicStats[topic].correct++;
            difficultyStats[difficulty].correct++;
        } else {
            wrongCount++;
            totalMarks -= 1;
        }

        totalTime += questionTimes[i];
    }

    // ======================================
    // Accuracy
    // ======================================
    let accuracy =
        (correctCount / (correctCount + wrongCount || 1)) * 100;

    // ======================================
    // Summary
    // ======================================
    reportHTML += `
        <h1>TEST REPORT</h1>

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

        <b>Accuracy :</b> ${accuracy.toFixed(2)} %

        <br><br>

        <b>Average Time per Question :</b>
        ${(totalTime / (questions.length || 1) / 60).toFixed(2)} min

        <br><br>

        <b>Timer Mode :</b> ${timerEnabled ? "Timed Test" : "Untimed Test"}

        <br><br>
    `;

    // ======================================
    // Topic Analysis
    // ======================================
    reportHTML += "<h2>Topic Analysis</h2>";
    reportHTML += "<table border='1'>";
    reportHTML +=
        "<tr><th>Topic</th><th>Correct</th><th>Average Time</th></tr>";

    for (let topic in topicStats) {
        reportHTML += `
            <tr>
                <td>${topic}</td>
                <td>
                    ${topicStats[topic].correct} /
                    ${topicStats[topic].total}
                </td>
                <td>
                    ${(topicStats[topic].time /
                       topicStats[topic].total / 60).toFixed(2)} min
                </td>
            </tr>
        `;
    }

    reportHTML += "</table><br>";

    // ======================================
    // Difficulty Analysis
    // ======================================
    reportHTML += "<h2>Difficulty Analysis</h2>";
    reportHTML += "<table border='1'>";
    reportHTML += "<tr><th>Difficulty</th><th>Correct</th></tr>";

    for (let difficulty in difficultyStats) {
        reportHTML += `
            <tr>
                <td>${difficulty}</td>
                <td>
                    ${difficultyStats[difficulty].correct} /
                    ${difficultyStats[difficulty].total}
                </td>
            </tr>
        `;
    }

    reportHTML += "</table><br>";

    // ======================================
    // Detailed Report
    // ======================================
    reportHTML += "<h2>Detailed Report</h2>";

    for (let i = 0; i < questions.length; i++) {
        let q = questions[i];
        let status = "";
        let marks = 0;
        let colour = "#fff3cd";

        if (userAnswers[i] === null) {
            status = "Skipped";
            marks = 0;
            colour = "#fff3cd";
        } else if (userAnswers[i] === q.answer) {
            status = "Correct";
            marks = 3;
            colour = "#d4edda";
        } else {
            status = "Wrong";
            marks = -1;
            colour = "#f8d7da";
        }

        let candidateAnswer = userAnswers[i] === null
            ? "Not Attempted"
            : q.options[userAnswers[i]];

        let correctAnswer = q.options[q.answer];

        reportHTML += `
            <div style="
                background: ${colour};
                padding: 15px;
                margin: 15px;
                border-radius: 10px;
            ">
                <h3>Question ${i + 1}</h3>

                <b>Topic :</b> ${q.topic || "General"}
                <br>

                <b>Difficulty :</b> ${q.difficulty || "Unknown"}
                <br><br>

                ${q.question}
                <br><br>

                <b>Your Answer :</b> ${candidateAnswer}
                <br><br>

                <b>Correct Answer :</b> ${correctAnswer}
                <br><br>

                <b>Result :</b> ${status}
                <br><br>

                <b>Marks :</b> ${marks}
                <br><br>

                <b>Time Spent :</b>
                ${(questionTimes[i] / 60).toFixed(2)} min
            </div>
        `;
    }

    // ======================================
    // Display Report
    // ======================================
    document.getElementById("report").innerHTML = reportHTML;
    addReportButtons();

    document.getElementById("question").style.display = "none";
    document.getElementById("options").style.display = "none";
    document.getElementById("palette").style.display = "none";

    const timerContainer = document.getElementById("timerSwitchContainer");
    if (timerContainer) {
        timerContainer.style.display = "none";
    }
}
