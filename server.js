require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Ensure Axios is installed

const app = express();
const port = process.env.PORT || 3000;

// Check if API Key is provided
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: Missing OpenAI API Key. Set OPENAI_API_KEY in Render environment variables.");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage || userMessage.trim() === "") {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4", // Ensure this is a valid model
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error("Empty response from OpenAI");
        }

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error("❌ API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ reply: "Sorry, I couldn't process that request." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Chatbot running on port ${port}`);
});
