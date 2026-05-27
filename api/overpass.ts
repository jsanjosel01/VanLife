export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    // 1. Parseo a prueba de fallos: Si Vercel nos lo da como texto, lo convertimos a objeto
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Error parseando el JSON:", e);
      }
    }

    const query = body?.query;

    // Si sigue sin haber query, devolvemos un 400 pero indicando qué nos llegó
    if (!query) {
      console.error("Cuerpo recibido inválido:", req.body);
      return res.status(400).json({ error: 'Falta la query en el body' });
    }

    // 2. Petición a Overpass con nuestro "DNI" para que no nos bloqueen
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VanLifeApp/1.0 (https://vanlife-chi-dun.vercel.app)',
        'Referer': 'https://vanlife-chi-dun.vercel.app'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Overpass falló con código ${response.status}`, 
        detalles: errorText 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Error fatal en el servidor:", error);
    return res.status(500).json({ error: 'Error interno en Vercel', detalles: error.message });
  }
}