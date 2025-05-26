const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a professional BaZi and Feng Shui master." },
        { role: "user", content: prompt },
      ],
    });

    const result = completion.data.choices[0].message.content;
    res.status(200).json({ report: result });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "OpenAI error." });
  }
};
