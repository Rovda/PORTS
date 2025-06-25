window.onload = function () {
  const data = [
    { proto: "FTP", ports: ["20", "21"], note: "20 = Data, 21 = Control" },
    { proto: "SSH / SFTP", ports: ["22"], note: "Acceso remoto seguro" },
    { proto: "Telnet", ports: ["23"], note: "No cifrado, acceso remoto" },
    { proto: "SMTP", ports: ["25", "465", "587"], note: "Correo saliente (465 = SSL, 587 = STARTTLS)" },
    { proto: "DNS", ports: ["53"], note: "Resolución de nombres (UDP/TCP)" },
    { proto: "TFTP", ports: ["69"], note: "Transferencia simple (UDP)" },
    { proto: "HTTP", ports: ["80"], note: "Navegación no segura" },
    { proto: "Kerberos", ports: ["88"], note: "Autenticación centralizada" },
    { proto: "POP3", ports: ["110", "995"], note: "Recibir correo (995 = SSL)" },
    { proto: "NNTP", ports: ["119"], note: "Transferencia de noticias" },
    { proto: "RPC", ports: ["135"], note: "Llamadas remotas (Windows)" },
    { proto: "NetBIOS", ports: ["137", "138", "139"], note: "137=Name, 138=Datagram, 139=Session" },
    { proto: "IMAP", ports: ["143", "993"], note: "Correo en servidor (993 = SSL)" },
    { proto: "SNMP", ports: ["161", "162"], note: "Monitoreo de red (162 = trap)" },
    { proto: "LDAP", ports: ["389", "636"], note: "389 = sin cifrar, 636 = LDAPS" },
    { proto: "HTTPS", ports: ["443"], note: "Web segura con TLS/SSL" },
    { proto: "SMB", ports: ["445"], note: "Compartición de archivos en red Windows" },
    { proto: "Syslog", ports: ["514", "6514"], note: "514 = UDP, 6514 = TLS" },
    { proto: "SQL Server", ports: ["1433"], note: "Microsoft SQL" },
    { proto: "RADIUS", ports: ["1645", "1646", "1812", "1813"], note: "1812 = Auth, 1813 = Acct" },
    { proto: "RDP", ports: ["3389"], note: "Remote Desktop Protocol" }
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
    if (remaining.length === 0) {
      document.getElementById("question").textContent = "🎉 ¡Completaste todas las preguntas!";
      document.getElementById("answerInput").style.display = "none";
      document.getElementById("checkBtn").style.display = "none";
      document.getElementById("nextBtn").style.display = "none";
      stopFlashTimer();
      return;
    }

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

    const portLink = mode === "proto-to-port" ? current.ports[0] : current.port;
    explanation.innerHTML = `
      🧠 <strong>${current.proto}</strong>: ${current.note}<br>
      🔗 <a href="https://www.cbtnuggets.com/common-ports/what-is-port-${portLink}" target="_blank">
      Ver en CBT Nuggets (puerto ${portLink})
      </a>
    `;

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

  // Expose globally (required for inline HTML onclick)
  window.startQuiz = startQuiz;
  window.checkAnswer = checkAnswer;
  window.nextQuestion = nextQuestion;
  window.toggleTheme = toggleTheme;
  window.toggleFlashMode = toggleFlashMode;
};
