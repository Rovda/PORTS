window.onload = function () {
  const data = [
    { proto: "FTP", ports: ["21"], note: "File Transfer Protocol (FTP)" },
    { proto: "SSH / CSP / SFTP", ports: ["22"], note: "Secure Shell y transferencia de archivos cifrada (TCP)" },
    { proto: "Telnet", ports: ["23"], note: "Protocolo de acceso remoto no cifrado (TCP)" },
    { proto: "SMTP / SMTPS", ports: ["25", "465", "587"], note: "Correo saliente seguro (465=SSL, 587=STARTTLS)" },
    { proto: "DNS", ports: ["53"], note: "Domain Name System (TCP y UDP)" },
    { proto: "DHCP", ports: ["67", "68"], note: "Asignación dinámica de direcciones IP (UDP)" },
    { proto: "TFTP", ports: ["69"], note: "Trivial File Transfer Protocol (UDP)" },
    { proto: "HTTP", ports: ["80"], note: "Protocolo de transferencia web (TCP)" },
    { proto: "Kerberos", ports: ["88"], note: "Protocolo de autenticación (UDP)" },
    { proto: "POP3 / POP3S", ports: ["110", "995"], note: "Correo entrante (995 = SSL/TLS)" },
    { proto: "NNTP", ports: ["119"], note: "Protocolo de noticias en red (TCP)" },
    { proto: "RPC", ports: ["135"], note: "Remote Procedure Call (TCP/UDP)" },
    { proto: "NetBIOS", ports: ["137", "138", "139"], note: "137=Name, 138=Datagram, 139=Session (TCP/UDP)" },
    { proto: "IMAP / IMAPS", ports: ["143", "993"], note: "Correo remoto (993=SSL)" },
    { proto: "LDAP / LDAPS", ports: ["389", "636"], note: "Acceso a directorios (636=TLS)" },
    { proto: "SNMP / Trap", ports: ["161", "162"], note: "Gestión de red y monitoreo (UDP)" },
    { proto: "HTTPS", ports: ["443"], note: "HTTP sobre TLS/SSL (TCP)" },
    { proto: "SMB", ports: ["445"], note: "Compartición de archivos (TCP)" },
    { proto: "Syslog / Syslog TLS", ports: ["514", "6514"], note: "Registro de eventos (514=UDP, 6514=TLS/TCP)" },
    { proto: "Microsoft SQL", ports: ["1433"], note: "Base de datos Microsoft SQL Server (TCP)" },
    { proto: "MySQL", ports: ["3306"], note: "Base de datos MySQL (TCP)" },
    { proto: "Oracle SQL", ports: ["1521"], note: "Base de datos Oracle (TCP)" },
    { proto: "RADIUS (TCP)", ports: ["1645", "1646"], note: "RADIUS tradicional para autenticación (TCP)" },
    { proto: "RADIUS (UDP)", ports: ["1812", "1813"], note: "RADIUS estándar (UDP)" },
    { proto: "RDP", ports: ["3389"], note: "Remote Desktop Protocol (TCP)" }
  ];

  let current = {};
  let correct = 0;
  let wrong = 0;
  let answered = new Set();
  let mode = "proto-to-port";
  let history = [];
  let flashMode = false;
  let flashTimer = null;
  let timeLeft = 20;

  function startQuiz() {
    mode = document.getElementById("mode").value;
    document.getElementById("startCard").style.display = "none";
    document.getElementById("quizCard").style.display = "block";
    nextQuestion();
  }

  function nextQuestion() {
    const remaining = data.filter(item => !answered.has(item.proto));
    if (remaining.length === 0) return endQuiz();

    const index = Math.floor(Math.random() * remaining.length);
    current = remaining[index];

    if (mode === "proto-to-port") {
      document.getElementById("question").textContent = `¿Qué puerto usa ${current.proto}?`;
    } else {
      const port = current.ports[Math.floor(Math.random() * current.ports.length)];
      current.port = port;
      document.getElementById("question").textContent = `¿Qué protocolo usa el puerto ${port}?`;
    }

    document.getElementById("answerInput").value = "";
    document.getElementById("result").textContent = "";
    document.getElementById("explanation").textContent = "";
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("timer").textContent = "";

    if (flashMode) startFlashTimer();
  }

  function checkAnswer() {
    const input = document.getElementById("answerInput").value.trim().toLowerCase();
    const result = document.getElementById("result");
    const explanation = document.getElementById("explanation");

    let isCorrect = false;

    if (mode === "proto-to-port") {
      isCorrect = current.ports.includes(input);
    } else {
      isCorrect = input === current.proto.toLowerCase() || input.includes(current.proto.toLowerCase().split(" ")[0]);
    }

    const portLink = mode === "proto-to-port" ? current.ports[0] : current.port;
    const portsList = current.ports.join(", ");
    explanation.innerHTML = `
      🔢 <strong>Puerto(s): ${portsList}</strong><br>
      🧠 <strong>${current.proto}</strong>: ${current.note}<br>
      🔗 <a href="https://www.cbtnuggets.com/common-ports/what-is-port-${portLink}" target="_blank">
        Ver en CBT Nuggets (puerto ${portLink})
      </a>
    `;

    if (isCorrect) {
      result.textContent = "✅ ¡Correcto!";
      result.className = "result correct";
      document.getElementById("nextBtn").disabled = false;
      answered.add(current.proto);
      correct++;
      stopFlashTimer();
    } else {
      result.textContent = "❌ Incorrecto. Intenta de nuevo.";
      result.className = "result incorrect";
      wrong++;
    }

    updateScore();
    logHistory(input, isCorrect);
  }

  function updateScore() {
    const total = correct + wrong;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    document.getElementById("score").innerHTML = `✅ Aciertos: ${correct} | ❌ Errores: ${wrong} | 📊 Precisión: ${pct}%`;
  }

  function logHistory(input, isCorrect) {
    const qText = document.getElementById("question").textContent;
    history.push(`${qText} ➜ Respuesta: ${input || "(vacío)"} | ${isCorrect ? "✅ Correcto" : "❌ Incorrecto"}`);
    const list = history.slice(-10).map(h => `<li>${h}</li>`).join("");
    document.getElementById("history").innerHTML = `<strong>🧾 Últimas respuestas:</strong><ul>${list}</ul>`;
  }

  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.style.getPropertyValue("--bg") === "#121212" || !root.style.getPropertyValue("--bg");
    if (isDark) {
      root.style.setProperty("--bg", "#ffffff");
      root.style.setProperty("--text", "#000000");
      root.style.setProperty("--card", "#f5f5f5");
    } else {
      root.style.setProperty("--bg", "#121212");
      root.style.setProperty("--text", "#ffffff");
      root.style.setProperty("--card", "#1e1e1e");
    }
  }

  function toggleFlashMode() {
    flashMode = !flashMode;
    alert(flashMode ? "⚡ Modo Flash activado (20s por pregunta)" : "Modo Flash desactivado");
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

    const failures = history
      .filter(h => h.includes("❌"))
      .map(item => `<li>${item}</li>`).join("");

    document.getElementById("summaryFailures").innerHTML = `
      <h3>❌ Preguntas fallidas:</h3>
      <ul>${failures || "<li>🎉 ¡No fallaste ninguna!</li>"}</ul>
    `;
  }

  // Exponer funciones globales
  window.startQuiz = startQuiz;
  window.checkAnswer = checkAnswer;
  window.nextQuestion = nextQuestion;
  window.toggleTheme = toggleTheme;
  window.toggleFlashMode = toggleFlashMode;
  window.endQuiz = endQuiz;
};
