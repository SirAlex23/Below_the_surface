const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { prompt } = req.body;

    // Inicializamos con la clave de Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // USAMOS EL NOMBRE COMPLETO Y EL MODELO MÁS COMPATIBLE
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Sin prefijos raros, solo el nombre base
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction:
        "Eres Mole AI, un experto en ciberseguridad, tecnologia digital, VPN,navegadores privados, moneda virtual, dark web y deep web y basicamente todo. Responde de forma concisa y sin markdown.",
    });

    const response = await result.response;
    return res.status(200).json({ response: response.text() });
  } catch (error) {
    // ESTO NOS DIRÁ EN LOS LOGS QUÉ MODELOS TIENES DISPONIBLES REALMENTE
    console.error("DETALLE DEL ERROR:", error.message);
    return res
      .status(500)
      .json({ error: "Error de configuración de IA", details: error.message });
  }
}
