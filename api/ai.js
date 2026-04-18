export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      "Greška pri generisanju.";

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
