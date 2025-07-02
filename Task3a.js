const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");
const quizBox = document.getElementById("quiz-box");
const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("start-screen");
const categorySelect = document.getElementById("category");

let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;
let answered = false;

async function fetchQuestions(category) {
  try {
    const url = `https://opentdb.com/api.php?amount=5&type=multiple&category=${category}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(q => ({
      question: decodeHTML(q.question),
      correct: decodeHTML(q.correct_answer),
      options: shuffle([...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)])
    }));
  } catch (err) {
    questionEl.textContent = "Failed to load questions.";
    return [];
  }
}

function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function renderQuestion() {
  const q = questions[currentIndex];
  questionEl.textContent = `Q${currentIndex + 1}: ${q.question}`;
  optionsEl.innerHTML = "";
  selectedAnswer = null;
  answered = false;
  nextBtn.disabled = true;

  q.options.forEach(opt => {
    const div = document.createElement("div");
    div.className = "option";
    div.textContent = opt;
    div.onclick = () => handleAnswer(div, opt, q.correct);
    optionsEl.appendChild(div);
  });
}

function handleAnswer(div, answer, correct) {
  if (answered) return;
  answered = true;

  const optionDivs = document.querySelectorAll(".option");

  optionDivs.forEach(opt => {
    opt.classList.remove("selected");

    if (opt.textContent === correct) {
      opt.classList.add("correct");
    } else if (opt.textContent === answer) {
      opt.classList.add("wrong");
    }
  });

  selectedAnswer = answer;
  nextBtn.disabled = false;

  if (answer === correct) {
    score++;
  }
}

function nextQuestion() {
  currentIndex++;

  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");
  scoreEl.textContent = `${score} / ${questions.length}`;
}

async function startQuiz() {
  const category = categorySelect.value;
  startScreen.classList.add("hidden");
  quizBox.classList.remove("hidden");
  resultBox.classList.add("hidden");

  score = 0;
  currentIndex = 0;
  questions = await fetchQuestions(category);
  renderQuestion();
}

function resetQuiz() {
  startScreen.classList.remove("hidden");
  quizBox.classList.add("hidden");
  resultBox.classList.add("hidden");
}

nextBtn.onclick = nextQuestion;