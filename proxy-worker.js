/**
 * Nova Browser — Cloudflare Worker Proxy
 *
 * Deploy this as a Cloudflare Worker to enable full proxy functionality.
 *
 * Usage: https://your-worker.workers.dev/?url=https://example.com
 *
 * In Nova Browser Settings, set Custom Proxy URL to:
 * https://your-worker.workers.dev/?url={url}
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    const targetUrl = url.searchParams.get("url");

    // Root page — show usage info
    if (!targetUrl) {
      return new Response(
        `<!DOCTYPE html>
<html>
<head><title>Nova Proxy Worker</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; max-width: 650px; margin: 40px auto; padding: 20px; color: #e8e6f0; background: #0f0f14; }
  h1 { color: #7c5cfc; }
  code { background: #1e1e28; padding: 2px 8px; border-radius: 4px; color: #9b82fc; }
  a { color: #7c5cfc; }
  .status { padding: 12px; background: #16161d; border: 1px solid #2e2e3e; border-radius: 8px; margin: 16px 0; }
  .status .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #4ade80; margin-right: 8px; }
</style>
</head>
<body>
  <h1>🌐 Nova Proxy Worker</h1>
  <div class="status"><span class="dot"></span> Worker is running!</div>
  <p>This is a proxy worker for <strong>Nova Browser</strong>.</p>
  <h2>Usage</h2>
  <p><code>?url=https://example.com</code></p>
  <h2>Test</h2>
  <p><a href="?url=https://example.com">→ Test with example.com</a></p>
  <p><a href="?url=https://www.wikipedia.org">→ Test with Wikipedia</a></p>
  <h2>Setup in Nova Browser</h2>
  <p>Set your proxy URL to:</p>
  <code>${url.origin}/?url={url}</code>
</body>
</html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    try {
      let decodedUrl = decodeURIComponent(targetUrl);

      if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
        decodedUrl = "https://" + decodedUrl;
      }

      // Build request with browser-like headers
      const fetchHeaders = new Headers();
      fetchHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
      fetchHeaders.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
      fetchHeaders.set("Accept-Language", "en-US,en;q=0.9");
      fetchHeaders.set("Accept-Encoding", "gzip, deflate, br");
      fetchHeaders.set("Upgrade-Insecure-Requests", "1");
      fetchHeaders.set("Sec-Fetch-Dest", "document");
      fetchHeaders.set("Sec-Fetch-Mode", "navigate");
      fetchHeaders.set("Sec-Fetch-Site", "none");
      fetchHeaders.set("Sec-Fetch-User", "?1");
      fetchHeaders.set("Cache-Control", "no-cache");

      // Forward cookies from the original request if present
      const cookie = request.headers.get("cookie");
      if (cookie) {
        fetchHeaders.set("Cookie", cookie);
      }

      const fetchOptions = {
        method: request.method,
        headers: fetchHeaders,
        redirect: "follow",
      };

      if (request.method !== "GET" && request.method !== "HEAD") {
        fetchOptions.body = await request.arrayBuffer();
      }

      const response = await fetch(decodedUrl, fetchOptions);

      // Build response headers
      const responseHeaders = new Headers();

      // Copy safe headers
      const safeHeaders = [
        "content-type",
        "content-language",
        "cache-control",
        "expires",
        "last-modified",
        "etag",
        "set-cookie",
      ];

      for (const header of safeHeaders) {
        const value = response.headers.get(header);
        if (value) {
          responseHeaders.set(header, value);
        }
      }

      // Set permissive CORS and framing headers
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
      responseHeaders.set("Access-Control-Allow-Headers", "*");
      responseHeaders.set("Access-Control-Expose-Headers", "*");
      responseHeaders.set("Access-Control-Allow-Credentials", "true");

      // Remove all frame-blocking headers
      responseHeaders.delete("X-Frame-Options");
      responseHeaders.delete("Content-Security-Policy");
      responseHeaders.delete("Content-Security-Policy-Report-Only");
      responseHeaders.delete("X-Content-Type-Options");
      responseHeaders.delete("Permissions-Policy");
      responseHeaders.delete("Cross-Origin-Embedder-Policy");
      responseHeaders.delete("Cross-Origin-Opener-Policy");
      responseHeaders.delete("Cross-Origin-Resource-Policy");

      const contentType = response.headers.get("content-type") || "";

      // For HTML responses, rewrite content
      if (contentType.includes("text/html")) {
        let html = await response.text();
        const parsedTarget = new URL(decodedUrl);
        const baseUrl = parsedTarget.origin;
        const workerOrigin = url.origin;

        // Remove X-Frame-Options meta tags
        html = html.replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, "");

        // Remove CSP meta tags
        html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, "");

        // Inject base tag for relative URL resolution
        const baseTag = `<base href="${baseUrl}${parsedTarget.pathname.replace(/\/[^\/]*$/, '/')}">`;
        if (html.includes("<head")) {
          html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
        } else if (html.includes("<html")) {
          html = html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
        } else {
          html = baseTag + html;
        }

        // Inject a script that handles link clicks to route through the proxy
        const proxyScript = `
<script>
(function() {
  const WORKER = "${workerOrigin}";
  const BASE = "${baseUrl}";

  function proxyUrl(href) {
    try {
      let absolute = href;
      if (href.startsWith('//')) {
        absolute = 'https:' + href;
      } else if (href.startsWith('/')) {
        absolute = BASE + href;
      } else if (!href.startsWith('http')) {
        absolute = BASE + '/' + href;
      }
      return WORKER + '/?url=' + encodeURIComponent(absolute);
    } catch(e) {
      return href;
    }
  }

  // Intercept link clicks
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (link) {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        e.preventDefault();
        window.location.href = proxyUrl(href);
      }
    }
  }, true);

  // Intercept form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.action) {
      const action = form.getAttribute('action') || '';
      if (action && !action.startsWith('javascript:')) {
        e.preventDefault();
        const formData = new FormData(form);
        const params = new URLSearchParams(formData).toString();
        let targetAction = action;
        if (!targetAction.startsWith('http')) {
          targetAction = BASE + (targetAction.startsWith('/') ? '' : '/') + targetAction;
        }
        if (form.method && form.method.toUpperCase() === 'GET') {
          window.location.href = proxyUrl(targetAction + '?' + params);
        } else {
          // For POST, redirect with params in URL (basic handling)
          window.location.href = proxyUrl(targetAction + '?' + params);
        }
      }
    }
  }, true);
})();
</script>`;

        // Inject proxy script before </body> or at end
        if (html.includes("</body>")) {
          html = html.replace("</body>", proxyScript + "</body>");
        } else {
          html += proxyScript;
        }

        responseHeaders.delete("content-encoding");
        responseHeaders.set("content-type", "text/html; charset=utf-8");

        return new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // For CSS, rewrite url() references
      if (contentType.includes("text/css")) {
        let css = await response.text();
        const parsedTarget = new URL(decodedUrl);
        const baseUrl = parsedTarget.origin;

        // Rewrite relative URLs in CSS
        css = css.replace(/url\(['"]?\/([\w\-\.\/]+)['"]?\)/g, `url('${baseUrl}/$1')`);

        responseHeaders.delete("content-encoding");

        return new Response(css, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // For everything else, stream through
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (err) {
      return new Response(
        `<!DOCTYPE html>
<html>
<head><title>Proxy Error</title>
<style>body{font-family:system-ui;max-width:600px;margin:40px auto;padding:20px;color:#e8e6f0;background:#0f0f14}
code{background:#1e1e28;padding:2px 8px;border-radius:4px;color:#f87171}
a{color:#7c5cfc}</style>
</head>
<body>
<h1>⚠️ Proxy Error</h1>
<p>Could not fetch the requested page.</p>
<p><strong>URL:</strong> <code>${targetUrl}</code></p>
<p><strong>Error:</strong> ${err.message}</p>
<hr>
<p><a href="javascript:history.back()">← Go Back</a></p>
</body>
</html>`,
        {
          status: 502,
          headers: {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
  };
}
