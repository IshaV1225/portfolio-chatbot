require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7
        });

        if (!response.choices || response.choices.length === 0) {
            throw new Error("Empty response from OpenAI");
        }

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ reply: "Sorry, I couldn't process that request." });
    }
});

app.listen(port, () => {
    console.log(`Chatbot running on port ${port}`);
});
