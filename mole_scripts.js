document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  let conversationState = "dialogue";
  let currentQuestionIndex = 0;
  let score = 0;

  const securityQuestions = [
    {
      id: 1,
      text: "PREGUNTA 01: ¿Utilizas un Gestor de Contraseñas (como Bitwarden, 1Password o Keepass) para generar y almacenar contraseñas únicas?",
      options: [
        { text: "[A] Sí, siempre uso un gestor.", points: 3 },
        { text: "[B] Solo para cuentas muy importantes.", points: 1 },
        { text: "[C] No, las memorizo o las escribes.", points: 0 },
      ],
    },
    {
      id: 2,
      text: "PREGUNTA 02: ¿Tienes activada la Autenticación de Dos Factores (2FA) en la mayoría de tus cuentas importantes?",
      options: [
        {
          text: "[A] Sí, uso apps de autenticación (Google/Authy).",
          points: 3,
        },
        { text: "[B] Solo uso 2FA por SMS.", points: 1 },
        { text: "[C] No, solo uso contraseña.", points: 0 },
      ],
    },
    {
      id: 3,
      text: "PREGUNTA 03: ¿Utilizas una VPN cuando navegas por internet, especialmente en redes Wi-Fi públicas?",
      options: [
        { text: "[A] Sí, la uso casi siempre.", points: 3 },
        { text: "[B] Solo en redes públicas.", points: 1 },
        { text: "[C] No, nunca uso VPN.", points: 0 },
      ],
    },
  ];

  function appendMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      sender === "mole" ? "mole-message" : "user-message"
    );
    if (sender === "user") {
      messageDiv.innerHTML = `<span style="color: var(--hacker-green);">> USUARIO >> ${text}</span>`;
    } else {
      messageDiv.innerHTML = `<span style="color: var(--system-color);">> MOLE >> ${text}</span>`;
    }
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return messageDiv;
  }

  function displayQuestion(question) {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("mole-message");
    if (question.id > 1) questionDiv.style.marginTop = "30px";
    let html = `<span class="mole-question">${question.text}</span><br><ul class="options-list">`;
    question.options.forEach((option, index) => {
      const optionLetter = String.fromCharCode(65 + index);
      html += `<li data-points="${option.points}" data-letter="${optionLetter}">${option.text}</li>`;
    });
    html += "</ul>";
    questionDiv.innerHTML = html;
    chatWindow.appendChild(questionDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    questionDiv.querySelectorAll(".options-list li").forEach((li) => {
      li.addEventListener("click", handleAnswerClick);
    });
  }

  function handleAnswerClick(event) {
    if (conversationState !== "initial_test") return;
    const li = event.currentTarget;
    const points = parseInt(li.dataset.points);
    const letter = li.dataset.letter;
    const text = li.textContent.substring(4).trim();

    li.parentElement.querySelectorAll("li").forEach((el) => {
      el.removeEventListener("click", handleAnswerClick);
      el.style.cursor = "default";
    });

    appendMessage("user", `[${letter}] ${text}`);
    score += points;
    currentQuestionIndex++;

    if (currentQuestionIndex < securityQuestions.length) {
      setTimeout(() => {
        displayQuestion(securityQuestions[currentQuestionIndex]);
      }, 1000);
    } else {
      setTimeout(showResults, 1500);
    }
  }

  function showResults() {
    let level = "";
    let advice = "";

    if (score >= 7) {
      level = "ALTO (Firewall Activo)";
      advice =
        "¡Excelente! Tu resistencia es alta. Mantente siempre al día con las nuevas amenazas y verifica dos veces la fuente de información crítica.";
    } else if (score >= 4) {
      level = "MEDIO (Escudo Poroso)";
      advice =
        "Tienes bases sólidas, pero hay agujeros. Te recomiendo encarecidamente revisar la implementación de tu Gestor de Contraseñas y asegurar el 2FA.";
    } else {
      level = "BAJO (Acceso Abierto)";
      advice =
        "Tu exposición es crítica. Necesitas implementar de inmediato un Gestor de Contraseñas y activar el 2FA para reforzar tu defensa digital.";
    }

    appendMessage(
      "mole",
      `ANÁLISIS COMPLETADO. Has obtenido ${score} de 9 puntos.`
    );

    setTimeout(() => {
      appendMessage("mole", `Tu Nivel de Protección Digital es: ${level}.`);
    }, 1000);

    setTimeout(() => {
      appendMessage("mole", `CONSEJO DE MOLE: ${advice}`);
    }, 2000);

    setTimeout(() => {
      appendMessage(
        "mole",
        "El test ha concluido. Estoy de vuelta en modo consulta. Escribe 'TEST' para repetir."
      );
      conversationState = "dialogue";
      userInput.disabled = false;
      sendButton.disabled = false;
      userInput.placeholder = "Escribe tu pregunta o 'TEST'...";
      userInput.focus();
    }, 4000);
  }

  function startTest() {
    conversationState = "initial_test";
    currentQuestionIndex = 0;
    score = 0;
    appendMessage("mole", "INICIANDO EVALUACIÓN DE SEGURIDAD. Concéntrate.");
    userInput.disabled = true;
    sendButton.disabled = true;
    setTimeout(() => {
      displayQuestion(securityQuestions[currentQuestionIndex]);
    }, 1500);
  }

  // --- SISTEMA DE REINTENTO Y CONEXIÓN API ---
  async function callGeminiBackend(query, retryCount = 0) {
    const maxRetries = 2;
    let loadingDiv;
    if (retryCount === 0)
      loadingDiv = appendMessage(
        "mole",
        "Analizando... Procesando en el servidor de IA."
      );

    try {
      const response = await fetch("/api/gemini", {
        // Ajustado a Vercel
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await response.json();

      const loaders = document.querySelectorAll(".mole-message");
      loaders.forEach((msg) => {
        if (msg.textContent.includes("Analizando...")) msg.remove();
      });

      if (data.response) {
        appendMessage("mole", data.response);
      } else {
        throw new Error("Respuesta vacía");
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        return callGeminiBackend(query, retryCount + 1);
      } else {
        const loaders = document.querySelectorAll(".mole-message");
        loaders.forEach((msg) => {
          if (msg.textContent.includes("Analizando...")) msg.remove();
        });
        appendMessage(
          "mole",
          "ERROR CRÍTICO: El núcleo de IA no responde. Inténtalo de nuevo."
        );
      }
    }
  }

  function handleUserInput() {
    const text = userInput.value.trim();
    if (text === "") return;
    appendMessage("user", text);
    userInput.value = "";

    if (conversationState === "initial_test") return;

    if (text.toUpperCase() === "TEST") {
      startTest();
    } else {
      callGeminiBackend(text);
    }
  }

  function initializeMole() {
    userInput.disabled = false;
    sendButton.disabled = false;
    setTimeout(() => {
      appendMessage(
        "mole",
        "ACCESO CONCEDIDO. Hola, soy MOLE AI tu asistente de seguidad. Estoy listo para resolver tus dudas, tambien puedes escribir 'TEST' para recibir una auditoría de seguridad"
      );
    }, 500);
  }

  sendButton.addEventListener("click", handleUserInput);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserInput();
  });
  initializeMole();
});
