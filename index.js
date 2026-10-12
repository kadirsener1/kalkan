// Kendi Render linkinizi buraya tırnak içine yazın:
const RENDER_URL = "https://iptv-proxy-app-nbsh.onrender.com";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;
    const cache = caches.default;

    // 1. VIDEO PARÇALARI (.ts) İÇİN KESİN ÖNBELLEK (CACHE) MOTORU
    if (url.pathname.endsWith(".ts")) {
      const cacheKey = new Request(url.toString(), request);
      let response = await cache.match(cacheKey);

      // Eğer video Cloudflare hafızasında varsa direkt oradan ver (Render'a HİÇ GİTMEZ)
      if (response) {
        return response;
      }

      // Hafızada yoksa Render'dan 1 kez çek ve Cloudflare hafızasına 15 saniye kilitle
      const modifiedHeaders = new Headers(request.headers);
      modifiedHeaders.set("X-Forwarded-Host", url.host);
      modifiedHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

      const originResponse = await fetch(targetUrl, {
        method: request.method,
        headers: modifiedHeaders,
      });

      response = new Response(originResponse.body, originResponse);
      response.headers.set("Cache-Control", "public, max-age=15, s-maxage=15");

      // Arka planda hafızaya kaydet
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    // 2. YAYIN LİSTESİ (.m3u8) VEYA PANELİ DOĞRUDAN ÇEK
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("X-Forwarded-Host", url.host);
    modifiedHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

    return fetch(targetUrl, {
      method: request.method,
      headers: modifiedHeaders,
    });
  },
};
