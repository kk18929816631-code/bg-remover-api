export default {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (url.pathname === '/removebg' && request.method === 'POST') {
      const apiKey = request.headers.get('X-Api-Key');
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing X-Api-Key header' }), {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
        });
      }

      try {
        const formData = await request.formData();
        const resp = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': apiKey },
          body: formData,
        });

        const contentType = resp.headers.get('Content-Type') || 'image/png';
        const result = await resp.arrayBuffer();

        if (resp.ok) {
          return new Response(result, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': contentType,
            }
          });
        } else {
          const text = new TextDecoder().decode(result);
          return new Response(text, {
            status: resp.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            }
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
