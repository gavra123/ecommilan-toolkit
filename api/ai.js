export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { task, payload } = req.body;

    const prompt = task === "product_copy"
      ? `Napiši prodajni opis proizvoda: ${payload.product}`
      : `Daj 5 imena za shop koji prodaje: ${payload.product}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    const text = data.output_text || "Nema odgovora";

    if (task === "product_copy") {
      return res.status(200).json({ text });
    } else {
      return res.status(200).json({ ideas: [{ name: text }] });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
