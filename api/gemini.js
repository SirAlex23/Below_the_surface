const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { prompt } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  // Configuración del sistema de reintento
  const MAX_RETRIES = 3;
  let lastError;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction:
          "Eres Mole AI, un experto en ciberseguridad, tecnología soberanía digital, navegadores privados, Dark Web y Deep web, monedas virtuales,y seguridad personal. Responde de forma experta, concisa y sin usar formatos markdown como asteriscos o almohadillas",
      });

      const response = await result.response;
      // Si llegamos aquí, la respuesta fue exitosa
      return res.status(200).json({ response: response.text() });
    } catch (error) {
      lastError = error;
      // Si el error es sobrecarga (503), esperamos y reintentamos
      if (
        error.message.includes("503") ||
        error.message.includes("overloaded")
      ) {
        console.log(`Intento ${i + 1} fallido por sobrecarga. Reintentando...`);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Espera 1.5 segundos
        continue;
      }
      // Si es otro tipo de error, paramos el bucle
      break;
    }
  }

  // Si después de los reintentos sigue fallando
  return res.status(500).json({
    error: "Mole AI está muy solicitado ahora mismo.",
    details: lastError.message,
  });
}
