
import { GoogleGenAI } from "@google/genai";
import { Drain } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMaintenanceInsights = async (drains: Drain[]) => {
  try {
    const drainSummary = drains.map(d => ({
      nombre: d.name,
      categoria: d.category,
      ultimaLimpieza: d.history.length > 0 ? d.history[0].date : 'Nunca',
      frecuenciaDias: d.frequencyDays
    }));

    const prompt = `
      Actúa como un experto en gestión de infraestructuras pluviales.
      Tengo la siguiente lista de canales y su estado de limpieza:
      ${JSON.stringify(drainSummary)}
      
      Por favor, proporciona un breve análisis (máximo 150 palabras) sobre qué canales deberían ser prioridad hoy y por qué, considerando su categoría (LARGE es más crítico que SMALL). 
      Habla de forma profesional en español.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return "No se pudieron obtener recomendaciones inteligentes en este momento.";
  }
};
