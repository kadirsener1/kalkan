// ================= AYAR =================
// Kendi Render linkinizi buraya tırnak içine yazın (Sonunda slash / OLMASIN):
const RENDER_URL = "https://iptv-proxy-app-nbsh.onrender.com";
// ========================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    // İstek başlıklarını Render'a düzgün aktarmak için kopyala
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("X-Forwarded-Host", url.host);
    modifiedHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

    // 1. VIDEO PARÇALARI (.ts) İSE: CLOUDFLARE HAFIZASINA AL (CACHE)
    if (url.pathname.endsWith(".ts")) {
      return fetch(targetUrl, {
        method: request.method,
        headers: modifiedHeaders,
        cf: {
          cacheEverything: true, // Her şeyi önbelleğe al
          cacheTtl: 10,          // 10 saniye boyunca hafızada tut (1000 kişi aynı parçayı alsın)
        },
      });
    }

    // 2. YAYIN LİSTESİ (.m3u8) VEYA PANEL İSE: DİREKT RENDER'DAN ÇEK (Önbelleğe alma)
    return fetch(targetUrl, {
      method: request.method,
      headers: modifiedHeaders,
      cf: {
        cacheEverything: false,
        cacheTtl: 0
      }
    });
  },
};
