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
const VERSION = "5ab6daa-202611091413";
const CACHE = `cockpit-${VERSION}`;
const PRECACHE = ["/_shell.html","/assets/CreerNav-ytndJ_Ae.js","/assets/Encaissements-D8iwm34x.js","/assets/PasswordInput-D4HTaAjm.js","/assets/PenseePartage-KEVcA2TO.js","/assets/ResendConfirmation-C5t6JVo0.js","/assets/ai-client-B3weZZ3a.js","/assets/ai.functions-qNs65xzG.js","/assets/astuces-CfvJxMF_.js","/assets/auth-messages-B2SOi6zv.js","/assets/badge-B3IssMH2.js","/assets/calendrier-CRGAfAkD.js","/assets/card-ChwTmE6O.js","/assets/check-BQrzAWhD.js","/assets/chevron-down-DWqyN-r1.js","/assets/chevron-right-BxbvkYDy.js","/assets/communaute-DsJN6Ua0.js","/assets/connexion-CRx2hvCZ.js","/assets/copy-CjaqgPEV.js","/assets/crm-DA3W8pen.js","/assets/db-DpLJMVAP.js","/assets/dialog-BwR0YfXd.js","/assets/heart-DTXzMJD_.js","/assets/ia-BxO5w95d.js","/assets/index-CKgoPiDS.js","/assets/index-DCRWy0Xx.js","/assets/index-DZ5go9vn.js","/assets/input-XePqIkVG.js","/assets/inscription-CpAQBEhT.js","/assets/instagram-OIXKk2yD.js","/assets/login-nGqqLKV8.js","/assets/message-circle-CXzuRLLR.js","/assets/mot-de-passe-oublie-CtbO-LVZ.js","/assets/motivation-CSKn65SY.js","/assets/onboarding-EmIjn2T5.js","/assets/pencil-BVulul7z.js","/assets/phone-B8vgL5q4.js","/assets/plan-DfLY4hgd.js","/assets/plus-Vq-TJ-UT.js","/assets/profil-BC0Y_aMX.js","/assets/reset-password-BVaXwWle.js","/assets/rocket-CWOQO8BS.js","/assets/select-CSiRHcAK.js","/assets/semaine-BOy6DeIp.js","/assets/styles-Be7qJiVc.css","/assets/templates-DuNVL34S.js","/assets/textarea-D0yEF99B.js","/assets/todo-DHM3IBAl.js","/assets/trash-2-BrybNJpF.js","/assets/useMutation-DVlutxsb.js","/assets/video-Bj8OUAmB.js","/assets/wand-sparkles-DQEOIUfd.js","/fonts/fraunces-latin-italic.woff","/fonts/fraunces-latin.woff","/fonts/inter-latin.woff","/icons/icon-192.png","/icons/icon-512.png","/apple-touch-icon.png","/manifest.webmanifest"];
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
