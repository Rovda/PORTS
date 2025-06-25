// quiz.js
// —– Referencias DOM —–
const startBtn        = document.getElementById("startBtn");
const themeBtn        = document.getElementById("themeBtn");
const flashBtn        = document.getElementById("flashBtn");
const checkBtn        = document.getElementById("checkBtn");
const nextBtn         = document.getElementById("nextBtn");
const endBtn          = document.getElementById("endBtn");
const restartBtn      = document.getElementById("restartBtn");
const answerIn        = document.getElementById("answerInput");
const questionEl      = document.getElementById("question");
const timerEl         = document.getElementById("timer");
const resultEl        = document.getElementById("result");
const expEl           = document.getElementById("explanation");
const scoreEl         = document.getElementById("score");
const historyEl       = document.getElementById("history");
const startCard       = document.getElementById("startCard");
const quizCard        = document.getElementById("quizCard");
const summaryCard     = document.getElementById("summaryCard");
const summaryStats    = document.getElementById("summaryStats");
const summaryFailures = document.getElementById("summaryFailures");

// —– Datos completos —–
const data = [
  { proto: "FTP",            ports: ["21","20"],         note: "File Transfer Protocol" },
  { proto: "SSH",            ports: ["22"],              note: "Secure Shell" },
  { proto: "SFTP",           ports: ["22"],              note: "FTP sobre SSH" },
  { proto: "Telnet",         ports: ["23"],              note: "Acceso remoto no cifrado" },
  { proto: "SMTP",           ports: ["25"],              note: "Correo saliente sin cifrar" },
  { proto: "DNS",            ports: ["53"],              note: "Resolución de nombres" },
  { proto: "DHCP",           ports: ["67","68"],          note: "Asignación dinámica IP" },
  { proto: "TFTP",           ports: ["69"],              note: "Transferencia simple de archivos" },
  { proto: "HTTP",           ports: ["80"],              note: "Navegación web sin cifrar" },
  { proto: "Kerberos",       ports: ["88"],              note: "Autenticación de red" },
  { proto: "POP3",           ports: ["110"],             note: "Correo entrante sin cifrar" },
  { proto: "NNTP",           ports: ["119"],             note: "Protocolo de noticias" },
  { proto: "RPC",            ports: ["135"],             note: "Llamadas RPC" },
  { proto: "NetBIOS",        ports: ["137","138","139"],  note: "NetBIOS Name/Datagram/Session" },
  { proto: "IMAP",           ports: ["143"],             note: "Acceso remoto a correo" },
  { proto: "SNMP",           ports: ["161"],             note: "Gestión de red" },
  { proto: "SNMP Trap",      ports: ["162"],             note: "Trampas SNMP" },
  { proto: "LDAP",           ports: ["389"],             note: "LDAP sin cifrado" },
  { proto: "HTTPS",          ports: ["443"],             note: "Web cifrada SSL/TLS" },
  { proto: "SMB",            ports: ["445"],             note: "Compartición de archivos" },
  { proto: "SMTP (SSL)",     ports: ["465"],             note: "SMTP sobre SSL" },
  { proto: "SMTP (STARTTLS)",ports: ["587"],             note: "SMTP STARTTLS" },
  { proto: "Syslog",         ports: ["514"],             note: "Log sistema UDP" },
  { proto: "LDAPS",          ports: ["636"],             note: "LDAP sobre TLS" },
  { proto: "IMAPS",          ports: ["993"],             note: "IMAP sobre SSL/TLS" },
  { proto: "POP3S",          ports: ["995"],             note: "POP3 sobre SSL/TLS" },
  { proto: "Microsoft SQL",  ports: ["1433"],            note: "SQL Server" },
  { proto: "Oracle SQL",     ports: ["1521"],            note: "Oracle DB" },
  { proto: "MySQL",          ports: ["3306"],            note: "MySQL DB" },
  { proto: "RADIUS (TCP)",   ports: ["1645","1646"],      note: "RADIUS TCP legado" },
  { proto: "RADIUS (UDP)",   ports: ["1812","1813"],      note: "RADIUS UDP" },
  { proto: "Syslog TLS",     ports: ["6514"],            note: "Syslog seguro TLS" },
  { proto: "RDP",            ports: ["3389"],            note: "Remote Desktop Protocol" }
];

// —– Estado —–
let current = {}, correct = 0, wrong = 0;
let answeredPorts = new Set();
let history = []; // guardaremos {question, given, correct, isCorrect}
let mode = "proto-to-port", flashMode = false, flashTimer = null, timeLeft = 20;
let lastRawInput = null;

// —– Flash timer —–
function startFlashTimer(){
  if (flashTimer) clearInterval(flashTimer);
  timeLeft = 20; timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
  flashTimer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
    if(timeLeft<=0){
      clearInterval(flashTimer);
      alert('⏱️ ¡Tiempo agotado!');
      endQuiz();
    }
  },1000);
}
function stopFlashTimer(){
  if (flashTimer) clearInterval(flashTimer);
  flashTimer = null;
}

// —– Inicio Quiz —–
function startQuiz(){
  mode = document.getElementById("mode").value;
  startCard.style.display   = "none";
  summaryCard.style.display = "none";
  quizCard.style.display    = "block";
  correct = 0; wrong = 0;
  answeredPorts.clear();
  history = [];
  updateScore();
  nextQuestion();
}

// —– Siguiente pregunta —–
function nextQuestion(){
  stopFlashTimer();
  lastRawInput = null;
  resultEl.textContent = "";
  expEl.textContent    = "";
  nextBtn.disabled     = true;
  answerIn.value       = "";

  const rem = data.filter(d=> d.ports.some(p=> !answeredPorts.has(p)));
  if(!rem.length) return endQuiz();
  current = rem[Math.floor(Math.random()*rem.length)];

  if(mode==="proto-to-port"){
    questionEl.textContent = `¿Qué puerto usa ${current.proto}?`;
  } else {
    const un = current.ports.filter(p=> !answeredPorts.has(p));
    current.port = un[Math.floor(Math.random()*un.length)];
    questionEl.textContent = `¿Qué protocolo usa el puerto ${current.port}?`;
  }

  if(flashMode) startFlashTimer();
  else timerEl.textContent = "";
}

// —– Comprobar respuesta —–
function checkAnswer(e){
  e.preventDefault();
  const raw = answerIn.value.trim();
  if(!raw){
    resultEl.textContent = "⚠️ Por favor escribe una respuesta.";
    resultEl.className   = "result incorrect";
    return;
  }
  if(raw===lastRawInput){
    resultEl.textContent = "✏️ Cambia tu respuesta para volver a comprobar.";
    resultEl.className   = "result incorrect";
    return;
  }
  lastRawInput = raw;

  const input = raw.toLowerCase().replace(/[^a-z0-9]/gi,"");
  const isCorrect = mode==="proto-to-port"
    ? current.ports.includes(input)
    : current.proto.split("/").some(p=>
        p.replace(/[^a-z0-9]/gi,"").toLowerCase()===input
      );

  if(isCorrect && flashMode) stopFlashTimer();

  expEl.innerHTML = `
    <strong>Puerto(s):</strong> ${current.ports.join(", ")}<br>
    <strong>${current.proto}:</strong> ${current.note}
  `;

  if(isCorrect){
    resultEl.textContent = "✅ ¡Correcto!";
    resultEl.className   = "result correct";
    current.ports.forEach(p=> answeredPorts.add(p));
    correct++;
  } else {
    resultEl.textContent = "❌ Incorrecto.";
    resultEl.className   = "result incorrect";
    wrong++;
  }

  // sólo habilitamos Siguiente si es correcto
  nextBtn.disabled = !isCorrect;
  updateScore();
  logHistory(raw, isCorrect);
}

// —– Registrar historial —–
function logHistory(given, isCorrect){
  const correctText = mode==="proto-to-port"
    ? current.ports.join(", ")
    : current.proto;
  history.push({question: questionEl.textContent, given, correct: correctText, isCorrect});
  // opcional: mostrar últimas 10 en el widget durante el quiz
  historyEl.innerHTML = `<ul>${
    history.slice(-10).map(h=>
      `<li>${h.question} ➜ tu: ${h.given||"(vacío)"} | correcto: ${h.correct} ${h.isCorrect?"✅":"❌"}</li>`
    ).join("")
  }</ul>`;
}

// —– Final del quiz —–
function endQuiz(){
  document.body.classList.add("quiz-over");
  stopFlashTimer();
  quizCard.style.display    = "none";
  summaryCard.style.display = "block";

  const total = correct+wrong;
  const pct   = total ? Math.round((correct/total)*100):0;
  summaryStats.innerHTML = `
    <p>✅ Aciertos: <strong>${correct}</strong></p>
    <p>❌ Errores: <strong>${wrong}</strong></p>
    <p>📊 Precisión: <strong>${pct}%</strong></p>
  `;

  const fails = history.filter(h=>!h.isCorrect);
  if(fails.length){
    summaryFailures.innerHTML = `<h3>❌ Fallos:</h3><ul>${
      fails.map(f=>`
        <li>
          ${f.question}<br>
          Tu: <strong>${f.given}</strong><br>
          Correcto: <strong>${f.correct}</strong>
        </li>
      `).join("")
    }</ul>`;
  } else {
    summaryFailures.innerHTML = '<p>🎉 ¡No fallaste ninguna!</p>';
  }
}

// —– Utilidades y listeners —–
function updateScore(){
  const total = correct+wrong;
  const pct   = total?Math.round((correct/total)*100):0;
  scoreEl.innerHTML = `✅ Aciertos: ${correct} | ❌ Errores: ${wrong} | 📊 Precisión: ${pct}%`;
}
function toggleTheme(){
  const root = document.documentElement,
        bg   = getComputedStyle(root).getPropertyValue("--bg").trim();
  if(bg==="#000"){
    root.style.setProperty("--bg","#fff");
    root.style.setProperty("--text","#000");
    root.style.setProperty("--card-bg","rgba(255,255,255,0.85)");
    root.style.setProperty("--border","#000");
  } else {
    root.style.setProperty("--bg","#000");
    root.style.setProperty("--text","#0f0");
    root.style.setProperty("--card-bg","rgba(0,0,0,0.85)");
    root.style.setProperty("--border","#0f0");
  }
}

startBtn.addEventListener("click",   startQuiz);
checkBtn.addEventListener("click",   checkAnswer);
nextBtn.addEventListener("click",    nextQuestion);
endBtn.addEventListener("click",     endQuiz);
flashBtn.addEventListener("click",   ()=>{
  flashMode = !flashMode;
  flashMode? startFlashTimer() : stopFlashTimer();
});
themeBtn.addEventListener("click",   toggleTheme);
restartBtn.addEventListener("click", ()=> location.reload());
answerIn.addEventListener("input",   ()=>{ lastRawInput = null; resultEl.textContent = ""; });
