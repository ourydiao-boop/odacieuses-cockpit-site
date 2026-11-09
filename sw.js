/* Service worker du Cockpit des Odacieuses (DEPLOY-01).
 * Généré à la publication par scripts/pwa/construire-sw.mjs (version et liste des fichiers insérées).
 *
 * Règles :
 *  - Seuls les fichiers de l'application (même origine, GET) passent par le cache : code, styles, polices, icônes.
 *  - Aucune requête vers Supabase (données, comptes, fichiers, IA) n'est interceptée ni mise en cache :
 *    aucune donnée personnelle n'est stockée par ce service worker, quel que soit le compte connecté.
 *  - Pages : réseau d'abord (toujours la dernière version en ligne), coquille en cache seulement hors connexion.
 *  - Fichiers versionnés (/assets/…) : cache d'abord (leur nom change à chaque version).
 *  - Mise à jour : la nouvelle version s'active tout de suite ; l'application propose de recharger.
 * Désactivation : voir docs/pwa.md (fichier sw.js « kill switch »).
 */
const VERSION = "dc29364-202611091046";
const CACHE = `cockpit-${VERSION}`;
const PRECACHE = ["/_shell.html","/assets/CreerNav-eGUw7xao.js","/assets/Encaissements-CT62gpRi.js","/assets/PasswordInput-BCwMqAj3.js","/assets/PenseePartage-VMm0K4xz.js","/assets/ResendConfirmation-BIVnGV7r.js","/assets/ai-client-BZVeqz2N.js","/assets/ai.functions-BCKxlZRu.js","/assets/astuces-PRQV-LC1.js","/assets/auth-messages-D-ukoNlR.js","/assets/badge-BMm1EiCQ.js","/assets/calendrier-ChZ0ykbo.js","/assets/card-BEIR_3h8.js","/assets/check-DHZhMruC.js","/assets/chevron-down-DTIRx4G_.js","/assets/chevron-right-DD7NExQh.js","/assets/communaute-DgcaE600.js","/assets/connexion-Dc9HN-in.js","/assets/copy-Dg-tv63F.js","/assets/crm-DqsMmZep.js","/assets/db-DsC2Hfte.js","/assets/dialog-BKIY7nlG.js","/assets/heart-DZC2aVmR.js","/assets/ia-0ssOlTfE.js","/assets/index-BnsykgOV.js","/assets/index-CJ11Vm--.js","/assets/index-Hy9a9-KO.js","/assets/input-DaeCnJ01.js","/assets/inscription-Druvd1TE.js","/assets/instagram-BycrL2V_.js","/assets/login-CFeJ7OVN.js","/assets/message-circle-CuVRWOu4.js","/assets/mot-de-passe-oublie-Cb1Tc8q7.js","/assets/motivation-EBe9FwM6.js","/assets/onboarding-uMFjEyfO.js","/assets/pencil-BqncYm-x.js","/assets/phone-CgdN2Ju6.js","/assets/plan-CJ-lEtsO.js","/assets/plus-CdiKWyB-.js","/assets/profil-CaxvWssX.js","/assets/reset-password-D9PbpjRP.js","/assets/rocket-BEczGiK8.js","/assets/select-MxvpgBN9.js","/assets/semaine-BOy6DeIp.js","/assets/styles-Dv1NcoQp.css","/assets/templates-CMi6HDoR.js","/assets/textarea-BPHg05Rg.js","/assets/todo-Da_JsV5m.js","/assets/trash-2-BpNvD9wA.js","/assets/useMutation-D-L_QlK7.js","/assets/video-DCOy6BOn.js","/assets/wand-sparkles-P_TvpuNg.js","/fonts/fraunces-latin-italic.woff","/fonts/fraunces-latin.woff","/fonts/inter-latin.woff","/icons/icon-192.png","/icons/icon-512.png","/apple-touch-icon.png","/manifest.webmanifest"];
const STATIQUES = /^\/(assets|fonts|icons)\//;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("cockpit-") && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "VERSION") event.source?.postMessage({ version: VERSION });
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase et tout service tiers : jamais interceptés

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match("/_shell.html", { cacheName: CACHE }).then((r) => r || Response.error()),
      ),
    );
    return;
  }

  if (STATIQUES.test(url.pathname) || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.match(req, { cacheName: CACHE }).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok && res.type === "basic") {
              const copie = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copie));
            }
            return res;
          }),
      ),
    );
  }
});
