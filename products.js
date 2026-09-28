// Same-origin proxy for the public WordPress.com posts API.
export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const upstream = await fetch('https://public-api.wordpress.com/rest/v1.1/sites/swimsoft.wordpress.com/posts/?number=100', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!upstream.ok) throw new Error('WordPress unavailable');
    const data = await upstream.json();
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return response.status(200).json({ posts: Array.isArray(data.posts) ? data.posts : [] });
  } catch {
    response.setHeader('Cache-Control', 'no-store');
    return response.status(502).json({ error: 'تعذر قراءة بيانات ووردبريس' });
  }
}
