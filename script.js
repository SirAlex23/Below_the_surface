document.addEventListener("DOMContentLoaded", () => {
  /* --- 1. CÓDIGO PARA EL EFECTO MATRIX (1010 RAIN) --- */
  const canvas = document.getElementById("matrixCanvas");
  // NOTA: Asegúrate de haber cambiado el <div> por un <canvas> en tu HTML

  if (canvas) {
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let columns = Math.floor(width / 20);

    const characters = "01"; // Caracteres 1010
    const drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const fontSize = 20;
    ctx.font = `${fontSize}px Share Tech Mono`;

    function drawMatrix() {
      // Dibuja un rectángulo semi-transparente negro para el efecto de desvanecimiento
      ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#00ff41"; // Color verde de tu variable --text-color

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(
          Math.floor(Math.random() * characters.length)
        );

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.98) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      for (let i = 0; i < columns; i++) {
        drops[i] = 1;
      }
    });

    setInterval(drawMatrix, 50); // Bucle principal de la animación
  }

  /* --- 2. Lógica del Scroll y Animaciones --- */
  const scrollSections = document.querySelectorAll(".scroll-section");

  const options = {
    threshold: 0.4, // Se activa cuando el 40% es visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const section = entry.target;
      const typingText = section.querySelector(".typing-effect");

      if (entry.isIntersecting) {
        // --- ENTRADA: Activar animación ---
        section.classList.add("visible");
        if (typingText) {
          // Reiniciamos la animación quitando y poniendo la clase
          typingText.classList.remove("typing");
          // Forzamos un "reflow" para que el navegador detecte el cambio
          void typingText.offsetWidth;
          typingText.classList.add("typing");
        }
      } else {
        // --- SALIDA: Resetear para la próxima vez ---
        // Si la sección sale de la pantalla, quitamos la clase 'visible'
        // Esto hará que vuelva a su estado oculto y desplazado
        section.classList.remove("visible");
        if (typingText) {
          typingText.classList.remove("typing");
        }
      }
    });
  }, options);

  scrollSections.forEach((section) => {
    observer.observe(section);
  });
});
