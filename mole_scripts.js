document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  // --- VARIABLES DE ESTADO ---
  let conversationState = "dialogue"; // Inicia en modo diálogo
  let currentQuestionIndex = 0;
  let score = 0;

  // Definición de las preguntas del test
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
    return messageDiv; // Retornamos el div para la función de carga
  }

  // --- LÓGICA DEL TEST DE SEGURIDAD ---

  function displayQuestion(question) {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("mole-message");

    if (question.id > 1) {
      questionDiv.style.marginTop = "30px";
    }

    let html = `<span class="mole-question">${question.text}</span><br>`;
    html += '<ul class="options-list">';

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
    let level = "";
    let advice = "";

    if (percentage >= 80) {
      level = "ALTO (Firewall Activo)";
      advice =
        "¡Excelente! Tu resistencia es alta. Mantente siempre al día con las nuevas amenazas de la IA y verifica dos veces la fuente de información crítica.";
    } else if (percentage >= 50) {
      level = "MEDIO (Escudo Poroso)";
      advice =
        "Tienes bases sólidas, pero hay agujeros. Te recomiendo encarecidamente revisar la implementación de tu Gestor de Contraseñas y asegurar el 2FA en todas tus cuentas sensibles.";
    } else {
      level = "BAJO (Acceso Abierto)";
      advice =
        "Tu exposición es crítica. Necesitas implementar de inmediato un Gestor de Contraseñas y activar el 2FA. Revisa los Módulos 02 y 03 para reforzar tu defensa digital.";
    }

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
        "El test ha concluido. Estoy de vuelta en modo consulta. Pregunta lo que desees o escribe 'TEST' para repetir."
      );

      conversationState = "dialogue";
      userInput.disabled = false;
      sendButton.disabled = false;
      userInput.placeholder = "Escribe tu pregunta o 'TEST' para evaluar...";
      userInput.focus();
    }, 3000);
  }

  function startTest() {
    conversationState = "initial_test";
    currentQuestionIndex = 0;
    score = 0;

    appendMessage(
      "mole",
      "INICIANDO EVALUACIÓN DE SEGURIDAD. Concéntrate, tu nivel de protección digital depende de tus respuestas."
    );

    userInput.disabled = true;
    sendButton.disabled = true;
    userInput.placeholder = "Responde a las preguntas haciendo click...";

    setTimeout(() => {
      displayQuestion(securityQuestions[currentQuestionIndex]);
    }, 1500);
  }

  // --- CONEXIÓN REAL CON GEMINI (BACKEND) ---

  function callGeminiBackend(query) {
    // 1. Mostrar mensaje de "cargando"
    const loadingDiv = appendMessage(
      "mole",
      "Analizando... Procesando en el servidor de IA."
    );

    // 2. Realizar la llamada a la función de Netlify
    // URL: /.netlify/functions/gemini
    fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: query }),
    })
      .then((response) => {
        // Eliminar el mensaje de "cargando"
        chatWindow.removeChild(loadingDiv);
        if (!response.ok) {
          // El servidor respondió, pero con error (ej. 404 o 500)
          throw new Error(
            "Error de conexión con el servidor: " + response.status
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          appendMessage("mole", "ERROR de IA: " + data.error);
        } else {
          // 3. Mostrar la respuesta real de Gemini
          appendMessage("mole", data.response);
        }
      })
      .catch((error) => {
        // Asegurarse de que el mensaje de carga se elimine si el fetch falla
        if (chatWindow.contains(loadingDiv)) {
          chatWindow.removeChild(loadingDiv);
        }
        console.error("Fetch error:", error);
        appendMessage(
          "mole",
          `ERROR CRÍTICO: No se pudo obtener respuesta de la IA. (${error.message})`
        );
      });
  }

  // --- ROUTER Y ENTRADA DEL USUARIO ---

  // La función router que decide si es un comando local o va a Gemini
  function simulateMoleResponse(query) {
    const lowerQuery = query.toLowerCase();

    // Manejar comandos de CIERRE localmente
    if (
      lowerQuery.includes("gracias") ||
      lowerQuery.includes("adios") ||
      lowerQuery.includes("finalizar")
    ) {
      const response =
        "Misión cumplida. Recuerda que la seguridad no es un producto, sino un proceso. Fin del análisis.";
      userInput.disabled = true;
      sendButton.disabled = true;

      setTimeout(() => {
        appendMessage("mole", response);
      }, 1000);
      return;
    }

    // Si no es un comando de cierre, llamamos al backend real
    callGeminiBackend(query);
  }

  function handleUserInput() {
    const text = userInput.value.trim();
    if (text === "") return;

    appendMessage("user", text);
    userInput.value = "";

    const upperText = text.toUpperCase();

    if (conversationState === "initial_test") {
      return; // Ignorar input de texto si estamos en el test
    }

    if (upperText === "TEST" || upperText === "EVALUAR") {
      startTest();
    } else {
      // Modo diálogo: Usa el router (simulateMoleResponse)
      simulateMoleResponse(text);
    }
  }

  // --- FUNCIÓN DE INICIO ---
  function initializeMole() {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.placeholder = "Escribe tu pregunta o 'TEST' para evaluar...";
    userInput.focus();

    setTimeout(() => {
      appendMessage(
        "mole",
        `ACCESO CONCEDIDO. Hola, soy MOLE AI, tu analista de seguridad y conocimiento. Pregunta lo que desees sobre cualquier tema digital. También puedes escribir 'TEST' para evaluar tu nivel de protección.`
      );
    }, 500);
  }

  // --- LISTENERS ---
  sendButton.addEventListener("click", handleUserInput);

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleUserInput();
    }
  });

  // --- INICIO DEL MÓDULO ---
  initializeMole();
});
