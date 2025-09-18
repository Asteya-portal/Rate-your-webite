document.getElementById('rateBtn').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value;
    const resultsDiv = document.getElementById('results');

    if (!url) {
        resultsDiv.innerHTML = '<p style="color: red;">Please enter a URL.</p>';
        return;
    }

    // Show a loading message
    resultsDiv.innerHTML = '<p>Analyzing... please wait. This can take a moment. ⏳</p>';

    try {
        const response = await fetch('/api/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ websiteUrl: url }),
        });

        if (!response.ok) {
            throw new Error('Failed to get a rating from the server.');
        }

        const data = await response.json();

        // Display the results
        resultsDiv.innerHTML = `
            <h3>Results for: ${data.id}</h3>
            <ul>
                <li><strong>Performance:</strong> ${data.performance * 100}%</li>
                <li><strong>Accessibility:</strong> ${data.accessibility * 100}%</li>
                <li><strong>Best Practices:</strong> ${data.bestPractices * 100}%</li>
                <li><strong>SEO:</strong> ${data.seo * 100}%</li>
            </ul>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error('Error:', error);
    }
});