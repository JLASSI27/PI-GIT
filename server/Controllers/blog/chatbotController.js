const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBC03MyJz2rK1h8jfwReOdSveXI6CtCopc");

exports.chatWithBot = async (req, res) => {
    if (!req.body || typeof req.body.message !== 'string' || req.body.message.trim() === '') {
        return res.status(400).json({
            error: "Entrée invalide",
            message: "Veuillez fournir un message non vide"
        });
    }

    const { message } = req.body;
    const sanitizedMessage = message.trim();

    const isAboutEvents = checkIfAboutEvents(sanitizedMessage);
    if (!isAboutEvents) {
        return res.status(400).json({
            error: "Hors sujet",
            message: "Je ne réponds qu'aux questions sur des événements (historiques, culturels, sportifs, etc.)"
        });
    }

    try {

        const systemInstruction = {
            parts: [{
                text: "Tu es un expert en événements historiques, culturels et sportifs. Réponds uniquement aux questions sur ces sujets. Pour toute autre demande, explique poliment que tu ne traites que les sujets événementiels."
            }],
            role: "model"
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            systemInstruction: systemInstruction,
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        });

        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            }
        });

        const result = await chat.sendMessage(sanitizedMessage);
        const response = await result.response;
        const text = response.text();

        return res.json({
            reponse: text.trim(),
            type: "evenement"
        });

    } catch (error) {
        console.error("Erreur API Gemini:", error);

        let statusCode = 500;
        let errorMessage = "Erreur de communication avec l'API";

        if (error.message.includes("API key")) {
            statusCode = 401;
            errorMessage = "Erreur d'authentification";
        } else if (error.message.includes("quota")) {
            statusCode = 429;
            errorMessage = "Quota API dépassé";
        }

        return res.status(statusCode).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


function checkIfAboutEvents(message) {
    const eventKeywords = [
        'événement', 'evenement', 'évènement',
        'histoire', 'historique', 'date',
        'culture', 'culturel', 'festival',
        'sport', 'match', 'compétition', 'competition',
        'concert', 'exposition', 'conférence', 'conference',
        'anniversaire', 'commémoration', 'commemoration',
        'tournoi', 'championnat', 'olympique'
    ];

    const lowerMessage = message.toLowerCase();
    return eventKeywords.some(keyword => lowerMessage.includes(keyword));
}