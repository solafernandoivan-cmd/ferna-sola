
import { GoogleGenAI } from "@google/genai";
import { Drain } from "../types";

export const getMaintenanceInsights = async (drains: Drain[]) => {
  if (!drains || drains.length === 0) return "No hay datos para analizar.";
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const drainSummary = drains.map(d => ({
      nombre: d.name,
      categoria: d.category,
      ultimaLimpieza: d.history.length > 0 ? d.history[0].date : 'Nunca',
      frecuenciaDias: d.frequencyDays,
      estado: d.history.length === 0 ? 'Crítico (Sin registros)' : 'Registrado'
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza el estado de estos canales pluviales: ${JSON.stringify(drainSummary)}. 
      Prioriza LARGE sobre MEDIUM y SMALL. Indica cuáles limpiar hoy mismo. Sé técnico, breve y directo.`,
      config: {
        systemInstruction: "Eres un ingeniero civil senior experto en mantenimiento hidráulico urbano. Tus respuestas deben ser cortas, ejecutivas y enfocadas a la prevención de inundaciones.",
        temperature: 0.7,
        topP: 0.9
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Protocolo de análisis suspendido. Por favor, verifique la conexión del sistema.";
  }
};
