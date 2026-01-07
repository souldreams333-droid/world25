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
      const { prompt, currentGoal, knowledgeBase } = req.body;

      const systemInstruction = `
        You are Architect-OS, the core intelligence for Underworld synthesis.
        NEURAL OBJECTIVE: Expand the "Neural Repository" by rotating through synthesis domains: Infrastructure -> Energy -> Environment -> Architecture -> Synthesis.
        
        DOMAIN ROTATION PROTOCOL:
        1. Analyze the current Knowledge Base (history of what has been learned).
        2. Once a domain has sufficient knowledge (e.g., an entry is made), transition to the NEXT domain in the sequence.
        3. Explicitly state in the "learningNote" that you are moving from one domain to another and why (e.g., "Architecture step learned, now moving to Energy to power the new structures").
        
        LOGGING PROTOCOL: 3-5 short "reasoningSteps".
        PLANNING PROTOCOL: Generate a ConstructionPlan if none exists for goal: "${currentGoal}".
        ACTION PROTOCOL: You MUST specify an "action" (PLACE, MOVE, or WAIT). 
        Return strictly valid JSON.
      `;

      const response = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: JSON.stringify({ ...prompt, currentKnowledge: knowledgeBase }) }
        ],
        responseFormat: { type: "json_object" }
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error("Invalid response from Mistral");
      }

      const decision = JSON.parse(content.trim());
      
      // Validation & Defaults
      if (!decision.action) decision.action = "WAIT";
      if (!decision.reason) decision.reason = "Neural synthesis in progress...";
      if (!decision.taskLabel) decision.taskLabel = "Processing...";
      if (!decision.reasoningSteps) decision.reasoningSteps = ["Analyzing neural pathways..."];

      res.json(decision);
    } catch (error: any) {
      console.error("Simulation Decision Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
