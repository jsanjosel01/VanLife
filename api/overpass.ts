export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { query } = req.body;
    console.log("1. Query recibida en Vercel:", query);

    if (!query) {
      return res.status(400).json({ error: 'Falta la query en el body' });
    }

    console.log("2. Enviando petición a Overpass...");
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    // Si Overpass rechaza la petición, capturamos el motivo exacto
    if (!response.ok) {
      const errorText = await response.text();
      console.error("3. Error de Overpass:", response.status, errorText);
      return res.status(response.status).json({ 
        error: `Overpass falló con código ${response.status}`, 
        detalles: errorText 
      });
    }

    const data = await response.json();
    console.log("3. Datos recibidos correctamente de Overpass");
    return res.status(200).json(data);

  } catch (error: any) {
    // Si falla el servidor de Vercel (por ejemplo, porque la función fetch no existe o hay un timeout)
    console.error('Error fatal en el servidor de Vercel:', error.message);
    return res.status(500).json({ 
      error: 'Error interno en Vercel', 
      detalles: error.message 
    });
  }
}