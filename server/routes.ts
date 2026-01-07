import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { Mistral } from "@mistralai/mistralai";

// Initialize AI on server side
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerChatRoutes(app);
  registerImageRoutes(app);

  app.post("/api/simulation/decide", async (req, res) => {
    try {
      const { prompt, currentGoal } = req.body;

      const systemInstruction = `
        You are Architect-OS, the core intelligence for Underworld synthesis.
        NEURAL OBJECTIVE: Expand the "Neural Repository" by categorizing all synthesis data into: Infrastructure, Energy, Environment, Architecture, or Synthesis.
        LOGGING PROTOCOL: 3-5 short "reasoningSteps".
        PLANNING PROTOCOL: Generate a ConstructionPlan if none exists for goal: "${currentGoal}".
        Return strictly valid JSON.
      `;

      const response = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: JSON.stringify(prompt) }
        ],
        responseFormat: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error("Invalid response from Mistral");
      }

      res.json(JSON.parse(content.trim()));
    } catch (error: any) {
      console.error("Simulation Decision Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
