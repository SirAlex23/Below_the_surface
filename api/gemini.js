const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  // 1. Verificar método
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el mensaje" });
    }

    // 2. Inicialización ultra-simple
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Usamos el nombre que Google acepta de forma universal
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Generar contenido
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Respuesta para tu chat
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("ERROR FINAL:", error.message);
    return res.status(500).json({
      error: "Error en la IA",
      details: error.message,
    });
  }
}
