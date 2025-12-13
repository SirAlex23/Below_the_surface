// netlify/gemini.js

const { GoogleGenAI } = require("@google/genai");

// La clave se lee de la variable de entorno de Netlify (GEMINI_API_KEY)
const ai = new GoogleGenAI({});

const modelName = "gemini-2.5-flash";

// Instrucciones detalladas para que Mole se comporte como un experto
const systemInstruction =
  "Eres Mole AI, un analista de ciberseguridad, tecnología,y  soberanía digital.Dominas todos los conocimientos del internet profundo y defiendes un internet libre. Tu objetivo es responder todas las preguntas del usuario con un tono experto, conciso, y sin usar formatos como markdown (*, #). Limita tus respuestas a un par de párrafos y enfócate en dar consejos prácticos y fiables, especialmente sobre VPNs, 2FA,Navegadores privados, Deep Web ,Dark Web, Monedas virtuales, y amenazas de IA y mucho mas. ";

exports.handler = async (event, context) => {
  // Solo acepta peticiones POST del frontend
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Obtiene la pregunta del usuario
    const body = JSON.parse(event.body);
    const prompt = body.prompt;

    if (!prompt) {
      return { statusCode: 400, body: "Missing prompt in request body" };
    }

    // Llamada a la API de Gemini
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    // Devuelve la respuesta
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        response: response.text.trim(),
      }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno al comunicarse con la IA.",
      }),
    };
  }
};
