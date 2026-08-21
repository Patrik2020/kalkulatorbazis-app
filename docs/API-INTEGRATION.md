# API-integrációs szerződés

Az appban a felület, a számítási döntés és a HTTP-réteg külön modul. Emiatt egy kalkulátor API-ra költöztetése nem igényel UI-refaktort.

## Számítási módok

- `local`: minden számítás a helyi motoron fut.
- `hybrid`: amelyik kalkulátornak van `api.path` adaptere, először API-t használ; hálózati vagy backendhiba esetén a helyi motorra esik vissza.
- `api`: amelyik kalkulátornak van API-adaptere, kizárólag API-t használ; az adapter nélküli kalkulátorok továbbra is helyben számolnak, így a migráció lehet fokozatos.

## Ajánlott API-verziózás

Az app a Kalkulátor Bázis API `/api/v1` verziózott útvonalaira készült. A konkrét végpont kalkulátoronként eltérhet, mert a katalógus adaptere adja meg a `path` értéket.

Példa egy később bekötendő kalkulátorra:

```js
{
  id: "percent",
  // ...UI metaadatok
  api: {
    path: "/api/v1/calculators/percent/calculate",
    method: "POST",
    toRequest(values) {
      return { base: values.base, percent: values.percent };
    },
    fromResponse(payload) {
      return {
        main: String(payload.data.result),
        sub: payload.data.explanation,
        meta: { ruleset: payload.data.ruleset }
      };
    }
  }
}
```

A `main.js` ettől semmit nem változik.

## Közös app-eredmény

Az adapternek ezt a formát kell visszaadnia:

```json
{
  "main": "12 700 Ft",
  "sub": "ÁFA: 2 700 Ft · Nettó: 10 000 Ft",
  "meta": {
    "ruleset": "2026.1"
  }
}
```

A `meta.source` mezőt a `calculator-service.js` tölti ki (`api`, `device`, `device-fallback`).

## Hibakezelés

A HTTP-kliens kezeli:

- timeoutot;
- nem 2xx választ;
- JSON API-hibát;
- hálózati hibát.

`hybrid` módban ezek helyi fallbacket aktiválnak. A service worker **nem cache-eli az `/api/` kéréseket**, így számítási válasz nem ragad be PWA-cache-be.

## CORS a natív apphoz

Ha az API böngészős CORS-szabályokat használ, a későbbi store buildnél a backendnek az alkalmazás tényleges eredetét is engednie kell. Tipikus Capacitor eredetek platformtól és konfigurációtól függően például `https://localhost` vagy `capacitor://localhost`, a webes kiadásnál pedig a Kalkulátor Bázis / GitHub Pages eredete. A pontos allowlistet a natív build előtt a tényleges platformkonfigurációból kell rögzíteni.

## Migrációs javaslat

1. Egy kalkulátor API-végpontjának stabilizálása és tesztelése.
2. Adapter hozzáadása a katalógushoz.
3. `hybrid` módos app-teszt, online + offline.
4. API-válasz és helyi referenciaeredmény összevetése.
5. Ha stabil, adott kalkulátor API-s működése megtartható; a többi kalkulátor közben változatlanul helyben fut.
