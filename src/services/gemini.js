const getWorkingModel = async (apiKey) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log("Available Models:", data);

        // Find a model that supports generateContent
        const model = data.models?.find(m =>
            m.supportedGenerationMethods?.includes("generateContent") &&
            (m.name.includes("flash") || m.name.includes("pro") || m.name.includes("gemini"))
        );

        return model ? model.name.replace("models/", "") : "gemini-1.5-flash";
    } catch (e) {
        console.error("Failed to list models:", e);
        return "gemini-1.5-flash"; // Fallback
    }
};

const parseResponse = (data) => {
    if (!data.candidates || !data.candidates[0]) {
        throw new Error("Invalid response from Gemini: " + JSON.stringify(data));
    }
    const text = data.candidates[0].content.parts[0].text;
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
};

export const generateRoast = async (apiKey, tracks) => {
    const trackList = tracks.map((t, i) => `${i + 1}. ${t.name} by ${t.artists[0].name}`).join("\n");

    const prompt = `
    You are a brutal, Gen Z mean girl / internet troll. Roast this user based on their top 5 Spotify songs.
    
    User's Top Tracks:
    ${trackList}

    Format the response as a JSON object with two fields:
    1. "title": A short, savage 3-5 word insult title.
    2. "body": A paragraph (3-4 sentences) effectively ending their whole career. Use slang like "cooked", "mid", "npc", "red flag". Be specific about the artists.
    
    Output JSON only.
  `;

    // First try with a popular default
    let model = "gemini-1.5-flash";

    try {
        console.log(`Attempting roast with default model: ${model}`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Success with default model");
            return parseResponse(data);
        }
        console.warn("Default model failed, trying discovery...");
    } catch (ignored) {
        console.warn("Error with default model:", ignored);
    }

    // If first attempt failed (likely 404), find a real model
    model = await getWorkingModel(apiKey);
    console.log(`Retrying with discovered model: ${model}`);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    const data = await response.json();
    console.log("Gemini Raw Response:", data);

    return parseResponse(data);
};
