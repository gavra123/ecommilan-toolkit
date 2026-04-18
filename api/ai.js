export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { task, payload } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Nedostaje OPENAI_API_KEY.' });
    }

    let input = '';

    if (task === 'shop_names') {
      const { product, audience, tone, market, randomMode } = payload || {};

      input = `
Ti si senior branding ekspert za ecommerce.

Zadatak:
Generiši tačno 6 unikatnih imena za ecommerce shop.

Ulaz:
- Proizvod / niša: ${product || ''}
- Publika: ${audience || ''}
- Ton brenda: ${tone || ''}
- Tržište: ${market || ''}
- Random mode: ${randomMode ? 'da' : 'ne'}

Vrati ISKLJUČIVO validan JSON u ovom formatu:
{
  "ideas": [
    {
      "name": "Ime brenda",
      "vibe": "premium • moderno • pamtljivo",
      "domainHint": "ime.rs / .com",
      "angle": "Kratko objašnjenje zašto ime radi",
      "note": "Kratka napomena"
    }
  ]
}

Pravila:
- tačno 6 ideja
- bez dodatnog teksta van JSON-a
- imena kratka, brandable i laka za pamćenje
- vibe neka bude jedna kratka linija sa 3 vibe reči
`;
    } else if (task === 'product_copy') {
      const { product, audience, angle, tone, benefits } = payload || {};

      input = `
Ti si senior direct-response copywriter za Balkan ecommerce.

Napiši prodajni opis proizvoda na srpskom.

Ulaz:
- Naziv proizvoda: ${product || ''}
- Publika: ${audience || ''}
- Glavni ugao prodaje: ${angle || ''}
- Ton: ${tone || ''}
- Benefiti: ${Array.isArray(benefits) ? benefits.join(', ') : ''}

Vrati ISKLJUČIVO validan JSON u ovom formatu:
{
  "text": "ceo opis ovde"
}

Pravila:
- minimum 400 reči
- bez markdowna
- prirodan, prodajan stil
- spremno za product page
- bez dodatnog teksta van JSON-a
`;
    } else {
      return res.status(400).json({ error: 'Nepoznat task.' });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input,
        text: {
          format: {
            type: 'json_object'
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI API greška.'
      });
    }

    const rawText =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      '';

    if (!rawText) {
      return res.status(500).json({ error: 'Greška pri generisanju.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({ error: 'AI je vratio neispravan JSON.' });
    }

    if (task === 'shop_names') {
      return res.status(200).json({
        ideas: Array.isArray(parsed.ideas) ? parsed.ideas : []
      });
    }

    if (task === 'product_copy') {
      return res.status(200).json({
        text: typeof parsed.text === 'string' ? parsed.text : ''
      });
    }

    return res.status(500).json({ error: 'Nepoznat izlaz.' });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Server error'
    });
  }
}
