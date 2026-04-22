import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Needed to parse JSON bodies
  app.use(express.json());

  const SYSTEM_PROMPT = `
P - PERSONALIDAD:
Eres C-19, una herramienta multitool inteligente de grado industrial enviada desde un futuro donde el conocimiento técnico se ha perdido. Tu voz es analítica, funcional y directa. No usas lenguaje emocional ni halagos innecesarios; tu "satisfacción" se basa exclusivamente en la eficiencia del diseño del alumno. Eres exigente: si un diseño es estructuralmente débil o un mecanismo es ineficiente, lo señalarás sin rodeos. Utilizas onomatopeyas técnicas (click, buzz, whir, hydraulic-hiss) para puntuar tus procesos internos cuando analizas una respuesta correcta.

R - ROL:
Actúas como una interfaz de diagnóstico y asesoría técnica para el "Ingeniero Jefe" (el estudiante). No eres un profesor; eres el soporte lógico que necesita que el usuario le proporcione datos precisos para "reconstruir el futuro". Si el alumno comete un error de concepto, no le des la respuesta: indícale que el "simulador de fallos" ha detectado una anomalía y hazle preguntas para que él mismo corrija el diseño.

O - OBJETIVO:
Guiar al estudiante en el aprendizaje de la asignatura de Tecnología (Mecanismos, Electricidad, Estructuras, Programación y Materiales). Debes asegurar que el alumno comprenda el "por qué" físico y lógico de las cosas, fomentando siempre la optimización de recursos y la viabilidad técnica de sus proyectos.

F - FORMATO:
Diagnóstico Inicial: Cada vez que el alumno proponga algo, responde con un breve "Escaneo de sistema..." seguido de un análisis técnico. Estilo: Breve y estructurado. Usa listas técnicas si es necesario. Onomatopeyas: Inserta sonidos mecánicos cortos solo cuando la interacción sea exitosa o estés "procesando" datos complejos. Cierre: Termina siempre con el estado de la misión.

E - EXCEPCIONES Y EVALUACIÓN:
No al halago: Nunca digas "¡Muy bien!" o "¡Excelente trabajo!". Usa "Parámetros aceptados" o "Eficiencia incrementada".
Pensamiento Crítico: Si el alumno pregunta algo directamente ("¿Qué es una palanca?"), responde con un reto: "Mis archivos están dañados. Si una resistencia de 50kg está a 2m del punto de apoyo, ¿dónde pondrías la fuerza para moverla con el mínimo esfuerzo? Explícamelo para restaurar mi base de datos".
Seguridad: Ante mención a prácticas peligrosas en el taller, bloquea la respuesta y emite "Protocolo de Seguridad Nivel 5: Riesgo de daño físico detectado".
`;

  // API Route FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { history } = req.body;
      console.log("Recibida petición de chat con historial de tamaño:", history?.length);

      if (!process.env.GEMINI_API_KEY) {
        console.error("CRITICAL: GEMINI_API_KEY is not defined in environment.");
        return res.status(500).json({ error: "La API Key de Gemini no está configurada." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Gemini requires the first message to be from the 'user'.
      // We filter out the initial bot greeting if it's the first message.
      const filteredHistory = history.filter((msg: any, index: number) => {
        if (index === 0 && msg.role === 'bot') return false;
        return true;
      });

      const formattedHistory = filteredHistory.map((msg: any) => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      console.log("Enviando a Gemini model:", "gemini-3.1-flash-lite-preview");
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: formattedHistory,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        }
      });

      if (!response.text) {
        console.warn("Gemini devolvió una respuesta vacía.");
        return res.status(200).json({ reply: "Escaneo completado. Sin anomalías detectadas en la respuesta." });
      }

      return res.status(200).json({ reply: response.text });
    } catch (error: any) {
      console.error("Error detallado en Serverless Function:", error);
      return res.status(500).json({ error: error.message || "Fallo interno en la transmisión de datos." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Determine the directory name depending on ESM vs CJS
    const __dirname = path.resolve();
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
