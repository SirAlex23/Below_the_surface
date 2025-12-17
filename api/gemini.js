const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    // ESTO ES EL "LIST MODELS" QUE PIDE EL LOG
    const result = await genAI.listModels();

    // Imprimimos la lista en los logs de Vercel para que la veas
    console.log("Modelos disponibles:", JSON.stringify(result, null, 2));

    // Intentamos usar el nombre más básico de todos
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { prompt } = req.body;
    const chatResponse = await model.generateContent(prompt || "Hola");
    const response = await chatResponse.response;

    return res.status(200).json({ response: response.text() });
  } catch (error) {
    console.error("DETALLE DEL ERROR:", error.message);
    return res.status(500).json({
      error: "Error de configuración",
      ayuda: "Revisa los logs de Vercel para ver la lista de modelos.",
    });
  }
}
