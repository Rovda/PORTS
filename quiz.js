// quiz.js

document.addEventListener("DOMContentLoaded", () => {
  // Array de datos
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

  // Estado
  let current = {};
  let correct = 0;
  let wrong = 0;
  let answeredPorts = new Set();
  let mode = "proto-to-port";
  let history = [];
  let flashMode = false;
  let flashTimer = null;
  let timeLeft = 20;
  let lastRawInput = null;

  // Elementos del DOM
  const startBtn   = document.getElementById("startBtn");
  const themeBtn   = document.getElementById("themeBtn");
  const flashBtn   = document.getElementById("flashBtn");
  const checkBtn   = document.getElementById("checkBtn");
  const nextBtn    = document.getElementById("nextBtn");
  const endBtn     = document.getElementById("endBtn");
  const restartBtn = document.getElementById("restartBtn");
  const questionEl = document.getElementById("question");
  const answerIn   = document.getElementById("answerInput");
  const timerEl    = document.getElementById("timer");
  const resultEl   = document.getElementById("result");
  const expEl      = document.getElementById("explanation");
  const scoreEl    = document.getElementById("score");
  const historyEl  = document.getElementById("history");
  const summaryStats    = document.getElementById("summaryStats");
  const summaryFailures = document.getElementById("summaryFailures");

  // Enlazar eventos
  startBtn.addEventListener("click", startQuiz);
  themeBtn.addEventListener("click", toggleTheme);
  flashBtn.addEventListener("click", toggleFlashMode);
  checkBtn.addEventListener("click", checkAnswer);
  nextBtn.addEventListener("click", nextQuestion);
  endBtn.addEventListener("click", endQuiz);
  restartBtn.addEventListener("click", () => location.reload());
  answerIn.addEventListener("input", () => {
    lastRawInput = null;
    resultEl.textContent = "";
  });

  // Funciones del quiz:
  function startQuiz() {
    mode = document.getElementById("mode").value;
    document.getElementById("startCard").style.display   = "none";
    document.getElementById("summaryCard").style.display = "none";
    document.getElementById("quizCard").style.display    = "block";
    correct = 0;
    wrong   = 0;
    answeredPorts.clear();
    history = [];
    updateScore();
    nextQuestion();
  }

  function nextQuestion() {
    stopFlashTimer();
    lastRawInput = null;
    resultEl.textContent      = "";
    expEl.textContent         = "";
    nextBtn.disabled          = true;
    timerEl.textContent       = "";
    const remaining = data.filter(item =>
      item.ports.some(port => !answeredPorts.has(port))
    );
    if (!remaining.length) return endQuiz();
    current = remaining[Math.floor(Math.random() * remaining.length)];
    if (mode === "proto-to-port") {
      questionEl.textContent = `¿Qué puerto usa ${current.proto}?`;
    } else {
      const unasked = current.ports.filter(p => !answeredPorts.has(p));
      current.port = unasked[Math.floor(Math.random() * unasked.length)];
      questionEl.textContent = `¿Qué protocolo usa el puerto ${current.port}?`;
    }
    answerIn.value = "";
    if (flashMode) startFlashTimer();
  }

  function checkAnswer(event) {
    event.preventDefault();
    stopFlashTimer();
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
    let isCorrect = false;
    if (mode === "proto-to-port") {
      isCorrect = current.ports.includes(input);
    } else {
      const opts = current.proto
        .split("/")
        .map(p => p.replace(/[^a-z0-9]/gi, "").toLowerCase().trim());
      isCorrect = opts.includes(input);
    }
    const portLink = mode === "proto-to-port" ? current.ports[0] : current.port;
    expEl.innerHTML = `
      🔢 <strong>Puerto(s): ${current.ports.join(", ")}</strong><br>
      🧠 <strong>${current.proto}</strong>: ${current.note}<br>
      🔗 <a href="https://www.cbtnuggets.com/common-ports/what-is-port-${portLink}" target="_blank">
        Ver en CBT Nuggets (puerto ${portLink})
      </a>
    `;
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

  function startFlashTimer() {
    stopFlashTimer();
    timeLeft = 20;
    timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
    flashTimer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `⏱️ Tiempo: ${timeLeft}s`;
      if (timeLeft <= 0) {
        stopFlashTimer();
        alert('⏱️ ¡Tiempo agotado! El test ha finalizado.');
        endQuiz();
      }
    }, 1000);
  }

  function stopFlashTimer() {
    clearInterval(flashTimer);
    timerEl.textContent = "";
  }

  function updateScore() {
    const total = correct + wrong;
    const pct   = total ? Math.round((correct / total) * 100) : 0;
    scoreEl.innerHTML = `✅ Aciertos: ${correct} | ❌ Errores: ${wrong} | 📊 Precisión: ${pct}%`;
  }

  function logHistory(input, ok) {
    const q = questionEl.textContent;
    history.push(`${q} ➜ Respuesta: ${input || "(vacío)"} | ${ok ? "✅" : "❌"}`);
    const list = history.slice(-10).map(h => `<li>${h}</li>`).join("");
    historyEl.innerHTML = `<strong>🧾 Últimas respuestas:</strong><ul>${list}</ul>`;
  }

  function endQuiz() {
    stopFlashTimer();
    document.getElementById("quizCard").style.display    = "none";
    document.getElementById("summaryCard").style.display = "block";
    const total = correct + wrong;
    const pct   = total ? Math.round((correct / total) * 100) : 0;
    summaryStats.innerHTML = `
      <p>✅ Aciertos: <strong>${correct}</strong></p>
      <p>❌ Errores: <strong>${wrong}</strong></p>
      <p>📊 Precisión: <strong>${pct}%</strong></p>
    `;
    const fails = history.filter(h => h.includes("❌")).map(h => `<li>${h}</li>`).join("");
    summaryFailures.innerHTML = `
      <h3>❌ Preguntas fallidas:</h3>
      <ul>${fails || '<li>🎉 ¡No fallaste ninguna!</li>'}</ul>
    `;
  }
});
