document.addEventListener("DOMContentLoaded", () => {
  // Intentamos capturar los IDs tanto de la versión vieja como de la nueva para que no falle
  const chatWindow =
    document.getElementById("chat-container") ||
    document.getElementById("chat-window");
  const userInput =
    document.getElementById("chat-input") ||
    document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  let conversationState = "dialogue";
  let currentQuestionIndex = 0;
  let score = 0;

  const securityQuestions = [
    {
      id: 1,
      text: "PREGUNTA 01: ¿Utilizas un Gestor de Contraseñas (como Bitwarden, 1Password o Keepass)?",
      options: [
        { text: "[A] Sí, siempre uso un gestor.", points: 3 },
        { text: "[B] Solo para cuentas muy importantes.", points: 1 },
        { text: "[C] No, las memorizo o las escribo.", points: 0 },
      ],
    },
    {
      id: 2,
      text: "PREGUNTA 02: ¿Tienes activada la Autenticación de Dos Factores (2FA) en tus cuentas?",
      options: [
        { text: "[A] Sí, uso apps de autenticación.", points: 3 },
        { text: "[B] Solo uso 2FA por SMS.", points: 1 },
        { text: "[C] No, solo uso contraseña.", points: 0 },
      ],
    },
    {
      id: 3,
      text: "PREGUNTA 03: ¿Utilizas una VPN cuando navegas en redes Wi-Fi públicas?",
      options: [
        { text: "[A] Sí, la uso casi siempre.", points: 3 },
        { text: "[B] Solo en redes públicas.", points: 1 },
        { text: "[C] No, nunca uso VPN.", points: 0 },
      ],
    },
  ];

  // Aseguramos que el input esté habilitado al cargar
  if (userInput) {
    userInput.disabled = false;
    userInput.focus();
  }

  function appendMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.className =
      sender === "mole" ? "mensaje-mole" : "mensaje-usuario";
    const prefix = sender === "mole" ? "> MOLE >> " : "> USUARIO >> ";

    messageDiv.textContent = prefix + text;
    chatWindow.appendChild(messageDiv);

    const esMovil = window.innerWidth <= 768;
    if (esMovil || sender === "user") {
      messageDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      const originalText = messageDiv.textContent;
      messageDiv.textContent = "";
      let i = 0;
      function type() {
        if (i < originalText.length) {
          messageDiv.textContent += originalText.charAt(i);
          i++;
          chatWindow.scrollTop = chatWindow.scrollHeight;
          setTimeout(type, 15);
        }
      }
      type();
    }
    return messageDiv;
  }

  function displayQuestion(question) {
    const questionDiv = document.createElement("div");
    questionDiv.className = "mensaje-mole mole-question-container";

    let html = `<span class="mole-question">${question.text}</span><br><ul class="options-list" style="padding-left:0; list-style:none;">`;
    question.options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index);
      html += `<li data-points="${option.points}" data-letter="${letter}" style="cursor:pointer; margin:10px 0; color:var(--hacker-green); border:1px solid #00ff4133; padding:5px;">${option.text}</li>`;
    });
    html += "</ul>";

    questionDiv.innerHTML = html;
    chatWindow.appendChild(questionDiv);
    questionDiv.scrollIntoView({ behavior: "smooth" });

    questionDiv.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", handleAnswerClick);
    });
  }

  function handleAnswerClick(event) {
    const li = event.currentTarget;
    const points = parseInt(li.dataset.points);
    const letter = li.dataset.letter;
    const text = li.textContent.substring(4).trim();

    score += points;
    currentQuestionIndex++;
    appendMessage("user", `[${letter}] ${text}`);

    if (currentQuestionIndex < securityQuestions.length) {
      setTimeout(
        () => displayQuestion(securityQuestions[currentQuestionIndex]),
        800
      );
    } else {
      setTimeout(showResults, 1000);
    }
  }

  function showResults() {
    let level =
      score >= 7
        ? "ALTO (Firewall Activo)"
        : score >= 4
        ? "MEDIO (Escudo Poroso)"
        : "BAJO (Acceso Abierto)";
    appendMessage(
      "mole",
      `ANÁLISIS COMPLETADO. Puntuación: ${score}/9. Tu Nivel de Protección: ${level}.`
    );
    appendMessage("mole", "Vuelvo a modo consulta. Pregunta lo que desees.");
    conversationState = "dialogue";
  }

  async function callGemini(query) {
    const loading = appendMessage("mole", "Analizando...");
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await response.json();
      if (chatWindow.contains(loading)) chatWindow.removeChild(loading);
      appendMessage(
        "mole",
        data.response || "No recibí respuesta inteligible."
      );
    } catch (e) {
      if (chatWindow.contains(loading)) chatWindow.removeChild(loading);
      appendMessage("mole", "Error de conexión con la IA central.");
    }
  }

  function handleInput() {
    const text = userInput.value.trim();
    if (!text) return;

    if (text.toUpperCase() === "TEST") {
      appendMessage("user", "TEST");
      userInput.value = "";
      conversationState = "initial_test";
      currentQuestionIndex = 0;
      score = 0;
      appendMessage("mole", "INICIANDO EVALUACIÓN DE SEGURIDAD...");
      setTimeout(() => displayQuestion(securityQuestions[0]), 1000);
    } else {
      appendMessage("user", text);
      userInput.value = "";
      callGemini(text);
    }
  }

  // EVENTOS
  sendButton.addEventListener("click", handleInput);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleInput();
  });

  // Bienvenida
  setTimeout(() => {
    appendMessage(
      "mole",
      "ACCESO CONCEDIDO. Hola, soy MOLE AI u asistente de seguidad. Estoy listo para resolver tus dudas, tambien puedes escribir 'TEST' para recibir una auditoría de seguridad."
    );
  }, 500);
});
