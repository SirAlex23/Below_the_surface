document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  // --- VARIABLES DE ESTADO ---
  let conversationState = "dialogue";
  let currentQuestionIndex = 0;
  let score = 0;

  const securityQuestions = [
    {
      id: 1,
      text: "PREGUNTA 01: ¿Utilizas un Gestor de Contraseñas (como Bitwarden, 1Password o Keepass) para generar y almacenar contraseñas únicas y complejas para cada servicio?",
      options: [
        { text: "[A] Sí, siempre uso un gestor.", points: 3 },
        { text: "[B] Solo para cuentas muy importantes.", points: 1 },
        { text: "[C] No, las memorizo o las escribes.", points: 0 },
      ],
    },
    {
      id: 2,
      text: "PREGUNTA 02: ¿Tienes activada la Autenticación de Dos Factores (2FA) en la mayoría de tus cuentas importantes (email, banca, redes sociales)?",
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
      text: "PREGUNTA 03: ¿Utilizas una VPN (Red Privada Virtual) cuando navegas por internet, especialmente en redes Wi-Fi públicas o para evitar el rastreo de tu IP?",
      options: [
        { text: "[A] Sí, la uso casi siempre.", points: 3 },
        { text: "[B] Solo en redes públicas.", points: 1 },
        { text: "[C] No, nunca uso VPN.", points: 0 },
      ],
    },
  ];

  // --- FUNCIONES DE CHAT (UI) ---

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

  // --- LÓGICA DEL TEST DE SEGURIDAD ---

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
    const selectedOption = event.currentTarget;
    const points = parseInt(selectedOption.dataset.points);
    const optionText = selectedOption.textContent;
    const optionLetter = selectedOption.dataset.letter;

    selectedOption.parentElement.querySelectorAll("li").forEach((li) => {
      li.removeEventListener("click", handleAnswerClick);
      li.style.cursor = "default";
    });

    appendMessage(
      "user",
      `[${optionLetter}] ${optionText.substring(4).trim()}`
    );
    score += points;
    currentQuestionIndex++;

    if (currentQuestionIndex < securityQuestions.length) {
      setTimeout(() => {
        displayQuestion(securityQuestions[currentQuestionIndex]);
      }, 1000);
    } else {
      setTimeout(endTestAndShowResults, 1500);
    }
  }

  function endTestAndShowResults() {
    const maxScore = securityQuestions.length * 3;
    const percentage = (score / maxScore) * 100;
    let level =
      percentage >= 80
        ? "ALTO (Firewall Activo)"
        : percentage >= 50
        ? "MEDIO (Escudo Poroso)"
        : "BAJO (Acceso Abierto)";
    let advice =
      percentage >= 80
        ? "¡Excelente! Tu resistencia es alta."
        : percentage >= 50
        ? "Tienes bases sólidas, pero hay agujeros."
        : "Tu exposición es crítica.";

    appendMessage(
      "mole",
      `ANÁLISIS COMPLETADO. Has obtenido ${score} de ${maxScore} puntos.`
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
        "El test ha concluido. Estoy de vuelta en modo consulta."
      );
      conversationState = "dialogue";
      userInput.disabled = false;
      sendButton.disabled = false;
      userInput.placeholder = "Escribe tu pregunta o 'TEST'...";
      userInput.focus();
    }, 3000);
  }

  function startTest() {
    conversationState = "initial_test";
    currentQuestionIndex = 0;
    score = 0;
    appendMessage("mole", "INICIANDO EVALUACIÓN DE SEGURIDAD...");
    userInput.disabled = true;
    sendButton.disabled = true;
    setTimeout(() => {
      displayQuestion(securityQuestions[currentQuestionIndex]);
    }, 1500);
  }

  // --- SISTEMA DE REINTENTO Y CONEXIÓN API ---

  async function callGeminiBackend(query, retryCount = 0) {
    const maxRetries = 2; // Intentará hasta 3 veces en total
    let loadingDiv;

    if (retryCount === 0) {
      loadingDiv = appendMessage(
        "mole",
        "Analizando... Procesando en el servidor de IA."
      );
    }

    try {
      const response = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      if (!response.ok) throw new Error("Fallo en servidor");
      const data = await response.json();

      // Limpiar mensaje de carga si existe
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
      console.error(`Intento ${retryCount + 1} fallido:`, error);

      if (retryCount < maxRetries) {
        console.log("Reiniciando petición...");
        return callGeminiBackend(query, retryCount + 1);
      } else {
        const loaders = document.querySelectorAll(".mole-message");
        loaders.forEach((msg) => {
          if (msg.textContent.includes("Analizando...")) msg.remove();
        });
        appendMessage(
          "mole",
          "ERROR CRÍTICO: No se pudo obtener respuesta tras varios intentos."
        );
      }
    }
  }

  // --- ROUTER Y ENTRADA DEL USUARIO ---

  function handleUserInput() {
    const text = userInput.value.trim();
    if (text === "") return;

    appendMessage("user", text);
    userInput.value = "";

    if (conversationState === "initial_test") return;

    if (text.toUpperCase() === "TEST" || text.toUpperCase() === "EVALUAR") {
      startTest();
    } else if (
      text.toLowerCase().includes("gracias") ||
      text.toLowerCase().includes("adios")
    ) {
      setTimeout(() => {
        appendMessage("mole", "Misión cumplida. Fin del análisis.");
      }, 1000);
    } else {
      callGeminiBackend(text);
    }
  }

  function initializeMole() {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
    setTimeout(() => {
      appendMessage(
        "mole",
        "ACCESO CONCEDIDO. Hola, soy MOLE AI tu asistente de seguidad. Estoy listo para resolver tus dudas, tambien puedes escribir 'TEST' para recibir una auditoría de seguridad."
      );
    }, 500);
  }

  sendButton.addEventListener("click", handleUserInput);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserInput();
  });

  initializeMole();
});
