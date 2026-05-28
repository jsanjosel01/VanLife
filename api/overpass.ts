export default async function handler(
  req: { method?: string; body?: any; query?: any },
  res: {
    status: (code: number) => { json: (data: unknown) => void };
    setHeader: (name: string, value: string) => void;
    json: (data: unknown) => void;
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Error parseando el JSON:", e);
      }
    }

    const query = body?.query;

    if (!query) {
      return res.status(400).json({ error: 'Falta la query en el body' });
    }

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VanLife-App/1.0 (contacto@vanlife.app)',
        'Referer': 'https://vanlife.app',
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
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en proxy Overpass:', error);
    return res.status(500).json({ error: message });
  }
}
