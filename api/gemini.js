const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 1. FORMA CORRECTA DE LISTAR MODELOS
    const modelClient = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Accedemos a la lista a través del cliente principal
    // Nota: Algunas versiones requieren usar una llamada fetch directa si el SDK falla
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    // 2. IMPRIMIR EN LOGS (Esto es lo que necesitamos leer)
    console.log("LISTA OFICIAL DE MODELOS:", JSON.stringify(data, null, 2));

    return res.status(200).json({
      mensaje: "Revisa los logs de Vercel ahora mismo",
      data: data,
    });
  } catch (error) {
    console.error("ERROR AL LISTAR:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
