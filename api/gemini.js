// 1. Importación correcta de la librería de Google
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 2. Configuración de Mole AI
const modelName = "gemini-pro"; // El modelo 2.5 no existe aún, usamos 1.5 que es el más actual y rápido
const systemInstruction =
  "Eres Mole AI, un analista de ciberseguridad, tecnología,y soberanía digital. Dominas todos los conocimientos del internet profundo y defiendes un internet libre. Tu objetivo es responder todas las preguntas del usuario con un tono experto, conciso, y sin usar formatos como markdown (*, #). Limita tus respuestas a un par de párrafos y enfócate en dar consejos prácticos y fiables.";

// 3. FUNCIÓN PARA VERCEL (Export Default)
export default async function handler(req, res) {
  // Solo acepta peticiones POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // Inicializamos la IA con la clave que pusiste en Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Enviamos la respuesta en el formato que espera tu frontend
    return res.status(200).json({
      response: text.trim(),
    });
  } catch (error) {
    console.error("Error en Mole AI:", error.message);
    return res.status(500).json({
      error: "Error CRÍTICO en el servidor de la IA.",
      details: error.message,
    });
  }
}
