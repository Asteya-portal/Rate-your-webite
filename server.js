const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;

// Middleware to parse JSON bodies and serve static files from the 'public' folder
app.use(express.json());
// To make this work, move your index.html, style.css, and app.js into a new folder called 'public'
app.use(express.static('public')); 

// The API endpoint our front-end will call
app.post('/api/rate', async (req, res) => {
    const { websiteUrl } = req.body;
    const apiKey = process.env.PAGESPEED_API_KEY;

    if (!websiteUrl) {
        return res.status(400).json({ error: 'Website URL is required.' });
    }

    // Construct the Google PageSpeed Insights API URL
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(websiteUrl)}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;

    try {
        const response = await axios.get(apiUrl);
        const lighthouse = response.data.lighthouseResult;

        // Extract the scores we want
        const scores = {
            id: response.data.id,
            performance: lighthouse.categories.performance.score,
            accessibility: lighthouse.categories.accessibility.score,
            bestPractices: lighthouse.categories['best-practices'].score,
            seo: lighthouse.categories.seo.score
        };

        // Send the simplified scores back to the front-end
        res.json(scores);

    } catch (error) {
        console.error("Error fetching PageSpeed data:", error.message);
        res.status(500).json({ error: 'Failed to analyze the website.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});