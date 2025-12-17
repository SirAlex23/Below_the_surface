const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // USAMOS EL NOMBRE EXACTO DE TU LISTA: Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction:
        "Eres Mole AI, un experto en ciberseguridad, tecnología y soberanía digital, lo dominas todo sobre VPN,Dark web y Deep web, monedas virtuales,navegadores privados y seguridad personal. Responde de forma experta, concisa y sin usar formatos markdown como asteriscos o almohadillas.",
    });

    const response = await result.response;
    return res.status(200).json({ response: response.text() });
  } catch (error) {
    console.error("ERROR FINAL:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
