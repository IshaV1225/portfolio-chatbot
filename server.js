require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const WEBSITE_URL = "https://ishav1225.github.io/Isha-Verma-Portfolio/"; 

// Function to scrape and extract text from the portfolio website
async function fetchPortfolioContent() {
    try {
        const { data } = await axios.get(WEBSITE_URL);
        const $ = cheerio.load(data);

        let text = $("body").text().replace(/\s+/g, " ").trim();
        return text.substring(0, 4000); // OpenAI token limit
    } catch (error) {
        console.error("Error fetching website:", error);
        return "Portfolio content could not be retrieved.";
    }
}

// Chatbot API route
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    const portfolioText = await fetchPortfolioContent();

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/completions",
            {
                model: "text-davinci-003",
                prompt: `You are a chatbot that answers questions about Isha's portfolio.
                Here is the portfolio content:
                ${portfolioText}
                
                Answer questions based ONLY on this data.
                User: ${userMessage}`,
                max_tokens: 200
            },
            {
                headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
            }
        );

        res.json({ reply: response.data.choices[0].text.trim() });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.json({ reply: "Sorry, I couldn't process that request." });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Chatbot running on port ${PORT}`));
