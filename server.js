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
// A helper function to calculate the median from an array of numbers
function calculateMedian(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

// The updated API endpoint
app.post('/api/rate', async (req, res) => {
    const { websiteUrl } = req.body;
    const apiKey = process.env.PAGESPEED_API_KEY;
    const NUM_RUNS = 3; // Number of times to run the analysis

    if (!websiteUrl) {
        return res.status(400).json({ error: 'Website URL is required.' });
    }

    // -- Specify a strategy ('mobile' or 'desktop') for more consistent results --
    const strategy = 'mobile';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(websiteUrl)}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=${strategy}`;

    try {
        // Create an array of API call promises to run them in parallel
        const apiCalls = [];
        for (let i = 0; i < NUM_RUNS; i++) {
            apiCalls.push(axios.get(apiUrl));
        }

        // Wait for all API calls to complete
        const responses = await Promise.all(apiCalls);

        // Extract the scores from each response
        const allScores = {
            performance: [],
            accessibility: [],
            bestPractices: [],
            seo: []
        };

        responses.forEach(response => {
            const lighthouse = response.data.lighthouseResult;
            allScores.performance.push(lighthouse.categories.performance.score);
            allScores.accessibility.push(lighthouse.categories.accessibility.score);
            allScores.bestPractices.push(lighthouse.categories['best-practices'].score);
            allScores.seo.push(lighthouse.categories.seo.score);
        });

        // Calculate the median score for each category
        const medianScores = {
            id: responses[0].data.id, // ID will be the same for all runs
            performance: calculateMedian(allScores.performance),
            accessibility: calculateMedian(allScores.accessibility),
            bestPractices: calculateMedian(allScores.bestPractices),
            seo: calculateMedian(allScores.seo)
        };

        res.json(medianScores);

    } catch (error) {
        console.error("Error fetching PageSpeed data:", error.message);
        res.status(500).json({ error: 'Failed to analyze the website.' });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);

});
