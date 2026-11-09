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
const VERSION = "ba60206-202611091444";
const CACHE = `cockpit-${VERSION}`;
const PRECACHE = ["/_shell.html","/assets/CreerNav-Bvw6ugCS.js","/assets/Encaissements-DvXe7-Tz.js","/assets/PasswordInput-DuCMUBqd.js","/assets/PenseePartage-DFobaZR8.js","/assets/ResendConfirmation-D33mq9UK.js","/assets/ai-client-cKvPkb3j.js","/assets/ai.functions-BXvCQnIS.js","/assets/astuces-Ct72Ujp0.js","/assets/auth-messages-DR3ccr4i.js","/assets/badge-JqYdbS9t.js","/assets/calendrier-KBQIluv4.js","/assets/card-HToxxdgX.js","/assets/check-Ceyu04m5.js","/assets/chevron-down-DTHT4GFd.js","/assets/chevron-right-BxPfaEra.js","/assets/communaute-CnHtzYQv.js","/assets/connexion-Dx55kj2T.js","/assets/copy-DF-orBFq.js","/assets/crm-B3aSaHZf.js","/assets/db-D2NgA1p-.js","/assets/dialog-CBiEGG_0.js","/assets/heart-DzC3l2Ug.js","/assets/ia-DcvgaBuY.js","/assets/index-DUyXVhoz.js","/assets/index-PmAvrGQ5.js","/assets/index-e0-Co1QD.js","/assets/input-Cq1Q8EPS.js","/assets/inscription-CLqfRxDf.js","/assets/instagram-BJgQgKGp.js","/assets/login-_SA_T77O.js","/assets/message-circle-NmUJi0b3.js","/assets/mot-de-passe-oublie-P4bP1SbX.js","/assets/motivation-CMk9k0ZE.js","/assets/onboarding-CBhUG22R.js","/assets/pencil-Ch8ZyK1z.js","/assets/phone-B-4uOe56.js","/assets/plan-CQAZBgv6.js","/assets/plus-DUuY4J2g.js","/assets/profil-CoVld8LS.js","/assets/reset-password-Cc3sTbrQ.js","/assets/rocket-C1TmxuJM.js","/assets/select-CgXvNcWg.js","/assets/semaine-BOy6DeIp.js","/assets/styles-CHRR2Nns.css","/assets/templates-BOMNSmCG.js","/assets/textarea-C2-iW30e.js","/assets/todo-CNak1oZi.js","/assets/trash-2-WSuyLD9Q.js","/assets/useMutation-DkgzZaCo.js","/assets/video-OW9aonz0.js","/assets/wand-sparkles-GI6vjKIw.js","/fonts/fraunces-latin-italic.woff","/fonts/fraunces-latin.woff","/fonts/inter-latin.woff","/icons/icon-192.png","/icons/icon-512.png","/apple-touch-icon.png","/manifest.webmanifest"];
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
