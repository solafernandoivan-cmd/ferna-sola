
import { Drain } from "../types";

const API_BASE = "https://jsonblob.com/api/jsonBlob";

export const cloudService = {
  /**
   * Crea un nuevo espacio en la nube para los datos.
   */
  pushToCloud: async (data: Drain[]): Promise<string> => {
    try {
      if (!data || data.length === 0) {
        throw new Error("No hay canales para guardar. Agrega al menos uno primero.");
      }

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const location = response.headers.get("Location");
      const xId = response.headers.get("x-jsonblob-id");
      const idSource = location || xId;
      
      if (!idSource) {
        throw new Error("El servidor no devolvió un código de acceso.");
      }
      
      const parts = idSource.split("/");
      return parts[parts.length - 1]; 
    } catch (error: any) {
      console.error("Cloud Push Error:", error);
      throw error;
    }
  },

  /**
   * Actualiza un espacio existente en la nube con lógica de reintento simple.
   */
  updateCloud: async (syncId: string, data: Drain[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/${syncId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar la nube. El código podría haber expirado o la conexión falló.");
      }
    } catch (error: any) {
      console.error("Cloud Update Error:", error);
      throw error;
    }
  },

  /**
   * Recupera datos de la nube usando un ID.
   */
  pullFromCloud: async (syncId: string): Promise<Drain[]> => {
    try {
      if (!syncId) throw new Error("Debes ingresar un código.");

      const response = await fetch(`${API_BASE}/${syncId}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        }
      });

      if (response.status === 404) {
        throw new Error("El código ingresado no existe o ha expirado.");
      }

      if (!response.ok) {
        throw new Error("Error al descargar los datos de la nube.");
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Formato de datos incorrecto en la nube.");
      }
      
      return data as Drain[];
    } catch (error: any) {
      console.error("Cloud Pull Error:", error);
      throw error;
    }
  }
};
