// Cloudflare Worker to proxy api.ddex-workbench.org to Firebase Functions
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Firebase Functions base URL
  const FIREBASE_FUNCTIONS_URL = 'https://us-central1-ddex-workbench.cloudfunctions.net/app'
  
  // Get the request URL and extract the path
  const url = new URL(request.url)
  
  // Remove /v1 prefix if present (for cleaner API versioning)
  let path = url.pathname
  if (path.startsWith('/v1')) {
    path = path.substring(3) // Remove '/v1'
  }
  
  // Construct the Firebase Functions URL
  const targetUrl = FIREBASE_FUNCTIONS_URL + path + url.search
  
  // Create a new request with the same method, headers, and body
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  })
  
  // Add CORS headers if needed
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  
  try {
    // Forward the request to Firebase Functions
    const response = await fetch(modifiedRequest)
    
    // Clone the response so we can modify headers
    const modifiedResponse = new Response(response.body, response)
    
    // Add CORS headers to the response
    Object.keys(corsHeaders).forEach(key => {
      modifiedResponse.headers.set(key, corsHeaders[key])
    })
    
    return modifiedResponse
  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        message: 'Failed to proxy request',
        details: error.message
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}