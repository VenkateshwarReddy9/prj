export const dynamic = 'force-dynamic';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.arrayBuffer();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward Svix signature headers for webhook verification on the API side
  for (const key of ['svix-id', 'svix-timestamp', 'svix-signature']) {
    const value = request.headers.get(key);
    if (value) headers[key] = value;
  }

  const response = await fetch(`${API_URL}/webhook/clerk`, {
    method: 'POST',
    headers,
    body: rawBody,
  });

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
  });
}
