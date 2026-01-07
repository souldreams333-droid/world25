
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI on server side
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
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

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingBudget: 1024 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, enum: ["PLACE", "MOVE", "WAIT"] },
              objectType: { type: Type.STRING },
              position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              reason: { type: Type.STRING },
              reasoningSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              learningNote: { type: Type.STRING },
              knowledgeCategory: { type: Type.STRING, enum: ["Infrastructure", "Energy", "Environment", "Architecture", "Synthesis"] },
              taskLabel: { type: Type.STRING },
              plan: {
                type: Type.OBJECT,
                properties: {
                  objective: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        type: { type: Type.STRING },
                        position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        status: { type: Type.STRING, enum: ["pending", "active", "completed"] }
                      },
                      required: ["label", "type", "position", "status"]
                    }
                  },
                  currentStepIndex: { type: Type.NUMBER },
                  planId: { type: Type.STRING }
                }
              }
            },
            required: ["action", "reason", "reasoningSteps", "learningNote", "knowledgeCategory", "taskLabel"]
          }
        }
      });

      res.json(JSON.parse(response.text.trim()));
    } catch (error: any) {
      console.error("Simulation Decision Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
