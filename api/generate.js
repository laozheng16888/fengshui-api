const https = require("https");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { name, gender, birthDate, birthTime, birthPlace } = req.body;

  const prompt = `
You are a professional Chinese metaphysics master. Based on the following user's birth information, generate a personalized Feng Shui report in English.

Name: ${name}
Gender: ${gender}
Birth Date: ${birthDate}
Birth Time: ${birthTime}
Birth Place: ${birthPlace}

Please include:
- BaZi chart (Four Pillars)
- Day Master and five element balance
- Personality overview
- Career advice
- Wealth potential
- Love & family analysis
- Health suggestions
- Feng Shui tips (direction, colors, items)
- Annual outlook (1–3 years)
- A final philosophical life advice paragraph

Use professional, but easy-to-understand English. Minimum 600 words.
`;

  const data = JSON.stringify({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a professional BaZi and Feng Shui master." },
      { role: "user", content: prompt }
    ]
  });

  const options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    }
  };

  const request = https.request(options, (response) => {
    let body = "";
    response.on("data", (chunk) => (body += chunk));
    response.on("end", () => {
      try {
        const result = JSON.parse(body);
        if (result.choices) {
          res.status(200).json({ report: result.choices[0].message.content });
        } else {
          res.status(500).json({ error: "GPT returned error", detail: result });
        }
      } catch (err) {
        res.status(500).json({ error: "Invalid JSON", raw: body });
      }
    });
  });

  request.on("error", (error) => {
    console.error("GPT error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI" });
  });

  request.write(data);
  request.end();
};
