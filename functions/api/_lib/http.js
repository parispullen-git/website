/* Adapts a Cloudflare Pages Function's (request, env) into the same
   {httpMethod, queryStringParameters, headers, body} event shape every
   ported function body was originally written against (Netlify's), so
   each function's actual logic below the adapter call is an unmodified
   copy of the working original -- the smallest, lowest-risk diff for
   moving business logic this deliberate (Stripe, real client data). */
async function toEvent(request) {
  const url = new URL(request.url);
  const queryStringParameters = {};
  url.searchParams.forEach((v, k) => { queryStringParameters[k] = v; });

  const headers = {};
  request.headers.forEach((v, k) => { headers[k] = v; });

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  return { httpMethod: request.method, queryStringParameters, headers, body };
}

module.exports = { toEvent };
