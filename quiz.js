window.onload = function () {
  const data = [
    { proto: "FTP", ports: ["21"], note: "File Transfer Protocol (FTP)" },
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
    { proto: "SMTPS", ports: ["465", "587"], note: "SMTP con cifrado: 465 (SSL), 587 (STARTTLS)" },
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

  let current = {};
  let correct = 0;
  let wrong = 0;
  let answeredPorts = new Set();
  let mode = "proto-to-port";
  let history = [];
  let flashMode = false;
  let flashTimer = null;
  let timeLeft = 20;
  let alreadyAnswered = false;

  // Vincular eventos a botones
  document.getElementById("checkBtn").addEventListener("click", checkAnswer);
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);

  function startQuiz() {
    mode = document.getElementById("mode").value;
    document.getElementById("startCard").style.display = "none";
    document.getElementById("quizCard").style.display = "block";
    nextQuestion();
  }

  function nextQuestion() {
    alreadyAnswered = false;
    const remaining = data.filter(item =>
      item.ports.some(port => !answeredPorts.has(port))
    );
    if (!remaining.length) return endQuiz();

    current = remaining[Math.floor(Math.random() * remaining.length)];

    if (mode === "proto-to-port") {
      document.getElementById("question").textContent =
        `¿Qué puerto usa ${current.proto}?`;
    } else {
      const unasked = current.ports.filter(p => !answeredPorts.has(p));
      current.port = unasked[Math.floor(Math.random() * unasked.length)];
      document.getElementById("question").textContent =
        `¿Qué protocolo usa el puerto ${current.port}?`;
    }

    document.getElementById("answerInput").value = "";
    document.getElementById("result").textContent = "";
    document.getElementById("explanation").textContent = "";
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("timer").textContent = "";

    if (flashMode) startFlashTimer();
  }

  function checkAnswer(event) {
    event.preventDefault();
    const raw = document.getElementById("answerInput").value.trim();
    const resultEl = document.getElementById("result");
    const expEl = document.getElementById("explanation");

    if (!raw) {
      resultEl.textContent = "⚠️ Por favor escribe una respuesta.";
      resultEl.className = "result incorrect";
      return;
    }
    if (alreadyAnswered) return;

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
      resultEl.className = "result correct";
      document.getElementById("nextBtn").disabled = false;
      current.ports.forEach(p => answeredPorts.add(p));
      correct++;
      alreadyAnswered = true;
      stopFlashTimer();
    } else {
      resultEl.textContent = "❌ Incorrecto. Intenta de nuevo.";
      resultEl.className = "result incorrect";
      wrong++;
    }

    updateScore();
    logHistory(raw, isCorrect);
  }

  function updateScore() {
    const total = correct + wrong;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    document.getElementById("score").innerHTML =
      `✅ Aciertos: ${correct} | ❌ Errores: ${wrong} | 📊 Precisión: ${pct}%`;
  }

  function logHistory(input, ok) {
    const q = document.getElementById("question").textContent;
    history.push(`${q} ➜ Respuesta: ${input || "(vacío)"} | ${ok ? "✅" : "❌"}`);
    const list = history.slice(-10).map(h => `<li>${h}</li>`).join("");
    document.getElementById("history").innerHTML =
      `<strong>🧾 Últimas respuestas:</strong><ul>${list}</ul>`;
  }

  function toggleTheme() {
    const root = document.documentElement;
    const currentBg = getComputedStyle(root).getPropertyValue('--bg').trim();

    if (currentBg === '#000') {
      // Tema claro
      root.style.setProperty('--bg', '#fff');
      root.style.setProperty('--text', '#000');
      root.style.setProperty('--card-bg', 'rgba(255,255,255,0.85)');
      root.style.setProperty('--border', '#000');
    } else {
      // Tema “hacker”
      root.style.setProperty('--bg', '#000');
      root.style.setProperty('--text', '#0f0');
      root.style.setProperty('--card-bg', 'rgba(0,0,0,0.85)');
      root.style.setProperty('--border', '#0f0');
    }
  }

  function toggleFlashMode() {
    flashMode = !flashMode;
    alert(flashMode
      ? '⚡ Modo Flash activado (20s por pregunta)'
      : '⚡ Modo Flash desactivado'
    );
  }

  function startFlashTimer() {
    stopFlashTimer();
    timeLeft = 20;
    document.getElementById("timer").textContent = `⏱️ Tiempo: ${timeLeft}s`;
    flashTimer = setInterval(() => {
      timeLeft--;
      document.getElementById("timer").textContent = `⏱️ Tiempo: ${timeLeft}s`;
      if (timeLeft <= 0) {
        stopFlashTimer();
        document.getElementById("result").textContent = "⏱️ Tiempo agotado";
        document.getElementById("result").className = "result incorrect";
        document.getElementById("nextBtn").disabled = false;
        wrong++;
        updateScore();
      }
    }, 1000);
  }

  function stopFlashTimer() {
    clearInterval(flashTimer);
    document.getElementById("timer").textContent = "";
  }

  function endQuiz() {
    stopFlashTimer();
    document.getElementById("quizCard").style.display = "none";
    document.getElementById("summaryCard").style.display = "block";

    const total = correct + wrong;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    document.getElementById("summaryStats").innerHTML = `
      <p>✅ Aciertos: <strong>${correct}</strong></p>
      <p>❌ Errores: <strong>${wrong}</strong></p>
      <p>📊 Precisión: <strong>${pct}%</strong></p>
    `;
    const fails = history.filter(h => h.includes("❌"))
                         .map(h => `<li>${h}</li>`).join("");
    document.getElementById("summaryFailures").innerHTML = `
      <h3>❌ Preguntas fallidas:</h3>
      <ul>${fails || '<li>🎉 ¡No fallaste ninguna!</li>'}</ul>
    `;
  }

  // Exponer funciones globales
  window.startQuiz = startQuiz;
  window.nextQuestion = nextQuestion;
  window.toggleTheme = toggleTheme;
  window.toggleFlashMode = toggleFlashMode;
  window.endQuiz = endQuiz;
};
