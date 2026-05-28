export default async function handler(
  req: { query: Record<string, string | string[]> },
  res: {
    status: (code: number) => { json: (data: unknown) => void };
    setHeader: (name: string, value: string) => void;
    json: (data: unknown) => void;
  }
) {
  const query = req.query.data as string;

  if (!query) {
    return res.status(400).json({ error: 'Falta el parámetro "data"' });
  }

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VanLife-App/1.0 (contacto@vanlife.app)',
        'Referer': 'https://vanlife.app',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Overpass respondió con ${response.status}`,
      });
    }

    const data = await response.json();

    // Cache de 60s en el edge de Vercel para no saturar Overpass
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en proxy Overpass:', error);
    return res.status(500).json({ error: message });
  }
}
