import { callAgent } from "../utils/chatbot/agent.js";

const chat = async (req, res) => {

    const threadId = req.user._id.toString();
    const { input } = req.body;
    try {
        let response = await callAgent(input, threadId);
        response = response.replace(/\*\*(.*?)\*\*/g, "$1");
        
        res.json({ response });
    } catch (error) {
        console.error("Error in chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export {
    chat
}