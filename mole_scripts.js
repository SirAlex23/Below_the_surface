document.addEventListener("DOMContentLoaded", () => {
  // Selección de IDs (compatibilidad doble)
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
      text: "PREGUNTA 01: ¿Utilizas un Gestor de Contraseñas (como Bitwarden, 1Password o Keepass) para generar y almacenar contraseñas únicas?",
      options: [
        { text: "[A] Sí, siempre uso un gestor.", points: 3 },
        { text: "[B] Solo para cuentas muy importantes.", points: 1 },
        { text: "[C] No, las memorizo o las escribo.", points: 0 },
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

  // --- FUNCIONES DE UI ---

  function appendMessage(sender, text, esSistema = false) {
    const messageDiv = document.createElement("div");

    if (esSistema) {
      messageDiv.className = "mensaje-sistema"; // Se define azul en CSS
      messageDiv.textContent = `> ${text}`;
    } else {
      messageDiv.className =
        sender === "mole" ? "mensaje-mole" : "mensaje-usuario";
      const nombre = sender === "mole" ? "> MOLE >> " : "> USUARIO >> ";
      // Estructura para colores diferenciados: Prefijo vs Contenido
      messageDiv.innerHTML = `<span class="prefijo-nombre">${nombre}</span><span class="texto-contenido">${text}</span>`;
    }

    chatWindow.appendChild(messageDiv);

    const esMovil =
      window.innerWidth <= 768 ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esMovil || sender === "user" || esSistema) {
      messageDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      // Efecto typeo solo para el texto verde de Mole en PC
      const contentSpan = messageDiv.querySelector(".texto-contenido");
      const originalText = text;
      contentSpan.textContent = "";
      let i = 0;
      function type() {
        if (i < originalText.length) {
          contentSpan.textContent += originalText.charAt(i);
          i++;
          chatWindow.scrollTop = chatWindow.scrollHeight;
          setTimeout(type, 15);
        }
      }
      type();
    }
    return messageDiv;
  }

  // --- LÓGICA DEL TEST ---

  function displayQuestion(question) {
    const questionDiv = document.createElement("div");
    questionDiv.className = "mensaje-mole mole-question-container"; // Clase con margen superior en CSS

    let html = `<span class="prefijo-nombre">> MOLE >> </span><span class="mole-question texto-contenido">${question.text}</span><br><ul class="options-list">`;
    question.options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index);
      html += `<li data-points="${option.points}" data-letter="${letter}">${option.text}</li>`;
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
    if (conversationState !== "initial_test") return;

    const li = event.currentTarget;
    const points = parseInt(li.dataset.points);
    const letter = li.dataset.letter;
    const text = li.textContent.substring(4).trim();

    // Desactivar clics tras elegir
    li.parentElement
      .querySelectorAll("li")
      .forEach((el) => (el.style.pointerEvents = "none"));

    appendMessage("user", `[${letter}] ${text}`);
    score += points;
    currentQuestionIndex++;

    if (currentQuestionIndex < securityQuestions.length) {
      // Delay para separar la respuesta de la siguiente pregunta
      setTimeout(
        () => displayQuestion(securityQuestions[currentQuestionIndex]),
        1200
      );
    } else {
      setTimeout(showResults, 1500);
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
      `ANÁLISIS COMPLETADO. Has obtenido ${score} de 9 puntos.`
    );
    setTimeout(() => {
      appendMessage("mole", `Tu Nivel de Protección Digital es: ${level}.`);
      appendMessage("mole", "Vuelvo a modo consulta. Pregunta lo que desees.");
      conversationState = "dialogue";
      userInput.disabled = false;
    }, 1000);
  }

  // --- COMUNICACIÓN API ---

  async function callGemini(query) {
    const loading = appendMessage("mole", "Analizando datos...");
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
        data.response || "No se ha podido procesar la consulta."
      );
    } catch (e) {
      if (chatWindow.contains(loading)) chatWindow.removeChild(loading);
      appendMessage("mole", "ERROR: No hay conexión con el núcleo de IA.");
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
      setTimeout(() => displayQuestion(securityQuestions[0]), 1200);
    } else if (conversationState === "dialogue") {
      appendMessage("user", text);
      userInput.value = "";
      callGemini(text);
    }
  }

  // LISTENERS
  sendButton.addEventListener("click", (e) => {
    e.preventDefault();
    handleInput();
  });
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInput();
    }
  });

  // INICIO
  appendMessage("mole", "INICIANDO COMUNICACIÓN CON MOLE AI...", true); // Mensaje Azul
  setTimeout(() => {
    appendMessage(
      "mole",
      "ACCESO CONCEDIDO. Hola, soy MOLE AI tu asistente de seguidad. Estoy listo para resolver tus dudas, tambien puedes escribir 'TEST' para recibir una auditoría de seguridad"
    );
  }, 1200);
});
