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
const VERSION = "a271a8f-202611091147";
const CACHE = `cockpit-${VERSION}`;
const PRECACHE = ["/_shell.html","/assets/CreerNav-gURxQsEG.js","/assets/Encaissements-DOSQ_IBU.js","/assets/PasswordInput-Bjv6yY-y.js","/assets/PenseePartage-C_Blr0ka.js","/assets/ResendConfirmation-C0H9k6lI.js","/assets/ai-client-DPSkfU26.js","/assets/ai.functions-B-Vul-rd.js","/assets/astuces-D_nJkQ7v.js","/assets/auth-messages-DQJFGwpX.js","/assets/badge-km35wsSr.js","/assets/calendrier-CdowQZUP.js","/assets/card-DfAMiv3i.js","/assets/check-BWS7eE4B.js","/assets/chevron-down-B3a_T4gK.js","/assets/chevron-right-CE_dZE4J.js","/assets/communaute-D5yARqL9.js","/assets/connexion-DqSau7fX.js","/assets/copy-B5h6-Upi.js","/assets/crm-Cow7Z67R.js","/assets/db-BkpBVVd5.js","/assets/dialog-hD0z2znQ.js","/assets/heart-BER8SaqB.js","/assets/ia-B3UykixS.js","/assets/index-Ct9Ry7H6.js","/assets/index-Cwh2GR-2.js","/assets/index-D4P6-Wkz.js","/assets/input-DFBqvU_1.js","/assets/inscription-jvzy6bBS.js","/assets/instagram-RH1Xf00Y.js","/assets/login-C4p2hJbU.js","/assets/message-circle-KppamVel.js","/assets/mot-de-passe-oublie-DcRDVhHV.js","/assets/motivation-BiFultpp.js","/assets/onboarding-BNuCkAoJ.js","/assets/pencil-6AG5aNE3.js","/assets/phone-D58_ZMwX.js","/assets/plan-DmTHJiAc.js","/assets/plus-BOg0ZHuz.js","/assets/profil-2_1LOJus.js","/assets/reset-password-B99CR0Be.js","/assets/rocket-DWjKda3H.js","/assets/select-qH2ljcet.js","/assets/semaine-BOy6DeIp.js","/assets/styles-Dv1NcoQp.css","/assets/templates-gaJpbm2R.js","/assets/textarea-CHNzE-ss.js","/assets/todo-DMEoFn0i.js","/assets/trash-2-VO9nroUJ.js","/assets/useMutation-B2L6sa2o.js","/assets/video-KhraX_7B.js","/assets/wand-sparkles-BFmEk7j5.js","/fonts/fraunces-latin-italic.woff","/fonts/fraunces-latin.woff","/fonts/inter-latin.woff","/icons/icon-192.png","/icons/icon-512.png","/apple-touch-icon.png","/manifest.webmanifest"];
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
