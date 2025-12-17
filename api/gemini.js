const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { prompt } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Usamos el modelo que ya sabemos que te funciona
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const MAX_RETRIES = 3;
  let lastError;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction:
          "Eres Mole AI, un analista de ciberseguridad, soberanía digital Dark web y Deep web, VPN, navegadores privados, monedas virtuales y seguridad digital. Responde de forma experta, concisa y sin usar formatos markdown (*, #). Limita tus respuestas a un par de párrafos.",
      });

      const response = await result.response;
      return res.status(200).json({ response: response.text() });
    } catch (error) {
      lastError = error;
      // Si el error es 503 (sobrecarga) o 429 (límite de cuota), esperamos y reintentamos
      if (
        error.message.includes("503") ||
        error.message.includes("overloaded") ||
        error.message.includes("429")
      ) {
        console.log(`Intento ${i + 1} fallido. Reintentando en 2 segundos...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      break;
    }
  }

  return res.status(500).json({
    error: "Mole AI está bajo mucha presión ahora mismo.",
    details: lastError.message,
  });
}
