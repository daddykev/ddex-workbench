// functions/middleware/clientIp.js
//
// Working out the real client IP for rate limiting.
//
// Hop chain for a request to https://api.ddex-workbench.org/v1/...:
//
//   client -> Cloudflare edge (Worker) -> Google front end -> Cloud Run (this function)
//
// - Cloudflare's edge sets/appends the client's address to X-Forwarded-For and sets
//   CF-Connecting-IP. The Worker forwards the incoming headers on its subrequest.
// - The Google front end appends the address it received the connection from (for
//   Worker traffic, a Cloudflare egress IP) to X-Forwarded-For, then connects to the
//   container from a Google-internal address.
//
// The function is also reachable directly at its cloudfunctions.net / run.app URL,
// where the chain is just: client -> Google front end -> Cloud Run.
//
// A fixed hop count can't be right for both paths: trusting 2 hops makes direct
// callers spoofable (the second-from-right X-Forwarded-For entry is theirs to set),
// and trusting 1 hop keys all Worker traffic by Cloudflare's egress IPs. Instead,
// Express walks X-Forwarded-For from the right and skips only addresses that belong
// to Google's proxies or Cloudflare. The first address that isn't one of those is
// the client. Anything a client writes into X-Forwarded-For sits to the left of
// that address, so it's never reached.
//
// If the Worker's subrequest arrives without the client's X-Forwarded-For entry,
// req.ip ends up as a Cloudflare address; in that case CF-Connecting-IP is used,
// and it's only trusted because the peer was verified to be Cloudflare.
//
// Residual risk: someone calling the function directly from their own Cloudflare
// Worker can choose the address that appears next in the chain. Closing that needs
// a shared secret between our Worker and the function.

const proxyaddr = require('proxy-addr');

// https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6 (fetched 2026-11-18)
const CLOUDFLARE_RANGES = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
  '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32'
];

// Google front end / load balancer ranges, plus the internal addresses Cloud Run
// connects to the container from
const GOOGLE_PROXY_RANGES = ['35.191.0.0/16', '130.211.0.0/22'];

const trustProxy = proxyaddr.compile([
  'loopback',
  'linklocal',
  'uniquelocal',
  ...GOOGLE_PROXY_RANGES,
  ...CLOUDFLARE_RANGES
]);

const isCloudflareAddress = proxyaddr.compile(CLOUDFLARE_RANGES);

/**
 * The client address used for anonymous rate limiting.
 */
const getClientIp = (req) => {
  const ip = req.ip || req.socket?.remoteAddress;
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (ip && cfConnectingIp && isCloudflareAddress(ip, 0)) {
    return String(cfConnectingIp).trim();
  }
  return ip || 'unknown';
};

/**
 * Temporary: logs how the client IP was resolved when DEBUG_CLIENT_IP=true.
 * Off by default. Remove once the production hop chain is confirmed.
 */
const logClientIp = (req, res, next) => {
  if (process.env.DEBUG_CLIENT_IP === 'true') {
    console.log('client-ip-debug', {
      path: req.path,
      reqIp: req.ip,
      clientIp: getClientIp(req),
      xForwardedFor: req.headers['x-forwarded-for'],
      cfConnectingIp: req.headers['cf-connecting-ip'],
      socketAddress: req.socket?.remoteAddress
    });
  }
  next();
};

module.exports = { trustProxy, getClientIp, logClientIp };
