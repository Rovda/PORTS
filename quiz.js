// —– Referencias DOM —–
const startBtn       = document.getElementById("startBtn");
const themeBtn       = document.getElementById("themeBtn");
const flashBtn       = document.getElementById("flashBtn");
const checkBtn       = document.getElementById("checkBtn");
const nextBtn        = document.getElementById("nextBtn");
const endBtn         = document.getElementById("endBtn");
const restartBtn     = document.getElementById("restartBtn");
const answerIn       = document.getElementById("answerInput");
const questionEl     = document.getElementById("question");
const timerEl        = document.getElementById("timer");
const resultEl       = document.getElementById("result");
const expEl          = document.getElementById("explanation");
const scoreEl        = document.getElementById("score");
const historyEl      = document.getElementById("history");
const startCard      = document.getElementById("startCard");
const quizCard       = document.getElementById("quizCard");
const summaryCard    = document.getElementById("summaryCard");
const summaryStats   = document.getElementById("summaryStats");
const summaryFailures= document.getElementById("summaryFailures");

// —– Ocultar score e historial al cargar —–
scoreEl.style.display   = "none";
historyEl.style.display = "none";

// —– Datos —–
const data = [
  { proto: "FTP", ports: ["21","20"], note: "File Transfer Protocol (FTP)" },
  { proto: "SSH", ports: ["22"], note: "Secure Shell (acceso remoto cifrado)" },
  // ... el resto de datos ...
  { proto: "RDP", ports: ["3389"], note: "Remote Desktop Protocol (TCP)" }
];

// —– Estado —–
let current = {};
let correct = 0, wrong = 0;
let answeredPorts = new Set(), history = [];
let mode = "proto-to-port";
let flashMode = false, flashTimer = null, timeLeft = 20;
let lastRawInput = null;

// —– Funciones de Modo Flash —–
function startFlashTimer(){
  if (flashTimer) clearInterval(flashTimer);
  timeLeft = 20;
  timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
  flashTimer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(flashTimer);
      alert('⏱️ ¡Tiempo agotado! Finalizando test…');
      endQuiz();
    }
  }, 1000);
}

function stopFlashTimer(){
  if (flashTimer) clearInterval(flashTimer);
  flashTimer = null; // dejamos el número visible
}

// —– Inicio y navegación —–
function startQuiz(){
  mode = document.getElementById("mode").value;
  startCard.style.display   = "none";
  summaryCard.style.display = "none";
  quizCard.style.display    = "block";
  // ocultar score e historial durante el quiz
  scoreEl.style.display   = "none";
  historyEl.style.display = "none";
  correct = 0; wrong = 0;
  answeredPorts.clear(); history = [];
  updateScore();
  nextQuestion();
}

function nextQuestion(){
  stopFlashTimer();
  lastRawInput = null;
  resultEl.textContent = "";
  expEl.textContent    = "";
  nextBtn.disabled     = true;
  answerIn.value       = "";

  const rem = data.filter(d => d.ports.some(p => !answeredPorts.has(p)));
  if (!rem.length) return endQuiz();
  current = rem[Math.floor(Math.random()*rem.length)];

  if (mode === "proto-to-port") {
    questionEl.textContent = `¿Qué puerto usa ${current.proto}?`;
  } else {
    const un = current.ports.filter(p => !answeredPorts.has(p));
    current.port = un[Math.floor(Math.random()*un.length)];
    questionEl.textContent = `¿Qué protocolo usa el puerto ${current.port}?`;
  }

  if (flashMode) startFlashTimer(); else timerEl.textContent = "";
}

// —– Comprobación de respuesta —–
function checkAnswer(e){
  e.preventDefault();
  const raw = answerIn.value.trim();
  if (!raw) {
    resultEl.textContent = "⚠️ Por favor escribe una respuesta.";
    resultEl.className   = "result incorrect";
    return;
  }
  if (raw === lastRawInput) {
    resultEl.textContent = "✏️ Cambia tu respuesta para volver a comprobar.";
    resultEl.className   = "result incorrect";
    return;
  }
  lastRawInput = raw;

  const input = raw.toLowerCase().replace(/[^a-z0-9]/gi, "");
  const isCorrect = mode === "proto-to-port"
    ? current.ports.includes(input)
    : current.proto.split("/").some(p =>
        p.replace(/[^a-z0-9]/gi, "").toLowerCase().trim() === input
      );

  if (isCorrect && flashMode) stopFlashTimer();

  expEl.innerHTML = `\n    🔢 <strong>Puerto(s): ${current.ports.join(", ")}</strong><br>\n    🧠 <strong>${current.proto}</strong>: ${current.note}<br>\n    🔗 <a href=\"https://www.cbtnuggets.com/common-ports/what-is-port-${(mode==="proto-to-port"? current.ports[0] : current.port)}\" target=\"_blank\">Ver en CBT Nuggets</a>`;

  if (isCorrect) {
    resultEl.textContent = "✅ ¡Correcto!";
    resultEl.className   = "result correct";
    current.ports.forEach(p => answeredPorts.add(p));
    correct++;
  } else {
    resultEl.textContent = "❌ Incorrecto. Intenta de nuevo.";
    resultEl.className   = "result incorrect";
    wrong++;
  }

  nextBtn.disabled = false;
  updateScore();
  logHistory(raw, isCorrect);
}

// —– Tema y Flash toggle —–
function toggleTheme(){
  const root = document.documentElement;
  const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
  if (bg === "#000") {
    root.style.setProperty("--bg", "#fff");
    root.style.setProperty("--text", "#000");
    root.style.setProperty("--card-bg", "rgba(255,255,255,0.85)");
    root.style.setProperty("--border", "#000");
  } else {
    root.style.setProperty("--bg", "#000");
    root.style.setProperty("--text", "#0f0");
    root.style.setProperty("--card-bg", "rgba(0,0,0,0.85)");
    root.style.setProperty("--border", "#0f0");
  }
}

function toggleFlashMode(){
  flashMode = !flashMode;
  if (flashMode) { startFlashTimer(); alert("⚡ Modo Flash activado (20s por pregunta)"); }
  else { stopFlashTimer(); timerEl.textContent = ""; alert("⚡ Modo Flash desactivado"); }
}

// —– Utilidades —–
function updateScore(){
  const total = correct + wrong;
  const pct = total ? Math.round((correct/total)*100) : 0;
  scoreEl.innerHTML = `✅ Aciertos: ${correct} | ❌ Errores: ${wrong} | 📊 Precisión: ${pct}%`;
}

function logHistory(input, ok){
  history.push(`${questionEl.textContent} ➜ ${input || "(vacío)"} | ${ok?"✅":"❌"}`);
  historyEl.innerHTML = `<strong>🧾 Últimas respuestas:</strong><ul>${history.slice(-10).map(h=>`<li>${h}</li>`).join("")}</ul>`;
}

function endQuiz(){
  stopFlashTimer();
  quizCard.style.display = "none";
  summaryCard.style.display = "block";
  // mostrar score e historial solo al terminar
  scoreEl.style.display   = "";
  historyEl.style.display = "";
  const total = correct + wrong;
  const pct = total ? Math.round((correct/total)*100) : 0;
  summaryStats.innerHTML = `\n    <p>✅ Aciertos: <strong>${correct}</strong></p>\n    <p>❌ Errores: <strong>${wrong}</strong></p>\n    <p>📊 Precisión: <strong>${pct}%</strong></p>`;
  summaryFailures.innerHTML = `\n    <h3>❌ Preguntas fallidas:</h3>\n    <ul>${history.filter(h=>h.includes("❌")).map(h=>`<li>${h}</li>`).join("") || "<li>🎉 ¡No fallaste ninguna!</li>"}</ul>`;
}

// —– Listeners —–
startBtn.addEventListener("click", startQuiz);
themeBtn.addEventListener("click", toggleTheme);
flashBtn.addEventListener("click", toggleFlashMode);
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextQuestion);
endBtn.addEventListener("click", endQuiz);
restartBtn.addEventListener("click", ()=>location.reload());
answerIn.addEventListener("input", ()=>{ lastRawInput = null; resultEl.textContent = ""; });
