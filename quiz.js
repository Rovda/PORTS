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
    { proto: "FTP", ports: ["21", "20"], note: "File Transfer Protocol (FTP)" },
    { proto: "SSH", ports: ["22"], note: "Secure Shell (acceso remoto cifrado)" },
    { proto: "SFTP", ports: ["22"], note: "FTP sobre SSH (cifrado)" },
    { proto: "Telnet", ports: ["23"], note: "Acceso remoto no cifrado (inseguro)" },
    { proto: "SMTP", ports: ["25"], note: "Correo saliente sin cifrar (TCP)" },
    { proto: "DNS", ports: ["53"], note: "Resolución de nombres (TCP y UDP)" },
    { proto: "DHCP", ports: ["67", "68"], note: "Asignación dinámica de direcciones IP (UDP)" },
    { proto: "TFTP", ports: ["69"], note: "Protocolo simple de transferencia de archivos (UDP)" },
    { proto: "HTTP", ports: ["80"], note: "Navegación web sin cifrar (inseguro)" },
    { proto: "Kerberos", ports: ["88"], note: "Sistema de autenticación de red (UDP)" },
    { proto: "POP3", ports: ["110"], note: "Correo entrante sin cifrar (TCP)" },
    { proto: "NNTP", ports: ["119"], note: "Protocolo de noticias (TCP)" },
    { proto: "RPC", ports: ["135"], note: "Remote Procedure Call (TCP y UDP)" },
    { proto: "NetBIOS", ports: ["137", "138", "139"], note: "137=Name, 138=Datagram, 139=Session" },
    { proto: "IMAP", ports: ["143"], note: "Acceso remoto a correo sin cifrar (TCP)" },
    { proto: "SNMP", ports: ["161"], note: "Gestión de red (UDP)" },
    { proto: "SNMP Trap", ports: ["162"], note: "Trampas de SNMP (UDP)" },
    { proto: "LDAP", ports: ["389"], note: "Acceso a directorios sin cifrado (TCP)" },
    { proto: "HTTPS", ports: ["443"], note: "Navegación web cifrada con SSL/TLS" },
    { proto: "SMB", ports: ["445"], note: "Compartición de archivos (TCP)" },
    { proto: "SMTP (SSL)", ports: ["465"], note: "SMTP sobre SSL (obsoleto pero aún usado)" },
    { proto: "SMTP (STARTTLS)", ports: ["587"], note: "SMTP con cifrado STARTTLS (recomendado)" },
    { proto: "Syslog", ports: ["514"], note: "Registro de eventos del sistema (UDP)" },
    { proto: "LDAPS", ports: ["636"], note: "LDAP sobre TLS (seguro)" },
    { proto: "IMAPS", ports: ["993"], note: "IMAP sobre SSL/TLS (seguro)" },
    { proto: "POP3S", ports: ["995"], note: "POP3 sobre SSL/TLS (seguro)" },
    { proto: "Microsoft SQL", ports: ["1433"], note: "Base de datos Microsoft SQL Server" },
    { proto: "Oracle SQL", ports: ["1521"], note: "Base de datos Oracle" },
    { proto: "MySQL", ports: ["3306"], note: "Base de datos MySQL" },
    { proto: "RADIUS (TCP)", ports: ["1645", "1646"], note: "RADIUS heredado (TCP)" },
    { proto: "RADIUS (UDP)", ports: ["1812", "1813"], note: "RADIUS estándar (UDP)" },
    { proto: "Syslog TLS", ports: ["6514"], note: "Syslog seguro con TLS (TCP)" },
    { proto: "RDP", ports: ["3389"], note: "Remote Desktop Protocol (TCP)" }

];

// —– Estado —–
let current = {}, correct = 0, wrong = 0;
let answeredPorts = new Set();
let history = []; // { question, given, correct, isCorrect }
let mode = "proto-to-port", flashMode = false, flashTimer = null, timeLeft = 20;
let lastRawInput = null;

// —– Flash timer —–
function startFlashTimer(){
  if (flashTimer) clearInterval(flashTimer);
  timeLeft = 20;
  timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
  flashTimer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
    if(timeLeft <= 0){
      clearInterval(flashTimer);
      alert("⏱️ ¡Tiempo agotado!");
      endQuiz();
    }
  },1000);
}
function stopFlashTimer(){
  if (flashTimer) clearInterval(flashTimer);
  flashTimer = null;
}

// —– Inicio y navegacíon —–
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
}

// —– Comprobación de respuesta —–
function checkAnswer(e){
  e.preventDefault();
  const raw = answerIn.value.trim();
  if(!raw){
    resultEl.textContent = "⚠️ Escribe una respuesta.";
    resultEl.className   = "result incorrect";
    return;
  }
  if(raw === lastRawInput){
    resultEl.textContent = "✏️ Cambia tu respuesta.";
    resultEl.className   = "result incorrect";
    return;
  }
  lastRawInput = raw;
  const input = raw.toLowerCase().replace(/[^a-z0-9]/gi,"");
  const isCorrect = mode==="proto-to-port"
    ? current.ports.includes(input)
    : current.proto.split("/").some(p=>
        p.replace(/[^a-z0-9]/gi,"").toLowerCase() === input
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
  nextBtn.disabled = !isCorrect;  // solo habilitar si aciertas
  updateScore();
  logHistory(raw, isCorrect);
}

// —– Historial —–
function logHistory(given, isCorrect){
  const correctText = mode==="proto-to-port"
    ? current.ports.join(", ")
    : current.proto;
  history.push({question: questionEl.textContent, given, correct: correctText, isCorrect});
}

// —– Final del quiz —–
function endQuiz(){
  document.body.classList.add("quiz-over");
  stopFlashTimer();
  quizCard.style.display    = "none";
  summaryCard.style.display = "block";

  const total = correct+wrong;
  const pct   = total ? Math.round((correct/total)*100) : 0;
  summaryStats.innerHTML = `
    <p>✅ Aciertos: <strong>${correct}</strong></p>
    <p>❌ Errores: <strong>${wrong}</strong></p>
    <p>📊 Precisión: <strong>${pct}%</strong></p>
  `;

  const fails = history.filter(h=> !h.isCorrect);
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

// —– Utilidades —–
function updateScore(){
  const total = correct+wrong;
  const pct   = total ? Math.round((correct/total)*100) : 0;
  scoreEl.innerHTML = `✅ Aciertos: ${correct} | ❌ Errores: ${wrong} | 📊 Precisión: ${pct}%`;
}

function toggleTheme(){
  const root = document.documentElement;
  const bg   = getComputedStyle(root).getPropertyValue("--bg").trim();
  if(bg==="#000"){
    // paso a claro
    root.style.setProperty("--bg","#fff");
    root.style.setProperty("--text","#000");
    root.style.setProperty("--card-bg","rgba(255,255,255,0.85)");
    root.style.setProperty("--border","#000");
    themeBtn.textContent = "🌙";
    alert("Tema claro activado");
  } else {
    // paso a oscuro
    root.style.setProperty("--bg","#000");
    root.style.setProperty("--text","#0f0");
    root.style.setProperty("--card-bg","rgba(0,0,0,0.85)");
    root.style.setProperty("--border","#0f0");
    themeBtn.textContent = "🌞";
    alert("Tema oscuro activado");
  }
}

// —– Listeners —–
startBtn.addEventListener("click", startQuiz);

checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextQuestion);
endBtn.addEventListener("click", endQuiz);

flashBtn.addEventListener("click", ()=>{
  flashMode = !flashMode;
  if(flashMode){
    startFlashTimer();
    flashBtn.textContent = "⚡ Detener Flash";
    alert("⚡ Modo Flash activado");
  } else {
    stopFlashTimer();
    timerEl.textContent = "";
    flashBtn.textContent = "⚡ Modo Flash (20s)";
    alert("⚡ Modo Flash desactivado");
  }
});

themeBtn.addEventListener("click", toggleTheme);
restartBtn.addEventListener("click", ()=> location.reload());
answerIn.addEventListener("input", ()=>{ lastRawInput = null; resultEl.textContent = ""; });
