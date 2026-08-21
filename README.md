# Kalkulátor Bázis App

A Kalkulátor Bázis külön alkalmazáskód-bázisa. A projekt jelenleg telepíthető PWA-ként fut, és ugyanebből a webes kódból Capacitorral Android- és iOS-alkalmazás építhető.

A fő architekturális cél: **a felület ne függjön attól, hogy egy számítás helyben vagy API-n történik**. Így a kalkulátorokat később egyenként át lehet kötni a `https://api.kalkulatorbazis.hu` szolgáltatásra anélkül, hogy az app UI-ját újra kellene írni.

## Jelenlegi funkciók

- 9 működő, helyben számoló kalkulátor
- keresés
- kedvencek és legutóbbi használat helyi mentése
- offline PWA gyorsítótár
- Android/iOS kezdőképernyős telepítés
- Capacitor-ready Android/iOS csomagolás
- API-ready szolgáltatási réteg `local`, `hybrid` és `api` móddal
- kalkulátoronként külön API-adapter lehetőség
- automatikus architektúra- és referenciaszámítási ellenőrzés

## Architektúra

```text
src/
  config/runtime.js                 környezeti és API-beállítások
  domain/calculators/catalog.js     UI-metaadat + opcionális API-adapter
  domain/calculators/local-engines.js
                                     helyi/offline számítási motorok
  services/api/http-client.js       timeout, JSON, hibakezelés
  services/api/calculator-api.js    API-kontraktus és adapterezés
  services/calculator-service.js    local/API/hybrid döntési réteg
  services/storage.js               kedvencek/előzmények tárolási adaptere
  utils/format.js                   formázás
  main.js                           UI és események
```

A `main.js` nem hív közvetlenül API-t és nem tartalmaz üzleti számítási logikát.

## API bekötése később

1. A megfelelő kalkulátorhoz adj `api` konfigurációt a `src/domain/calculators/catalog.js` fájlban.
2. Állítsd be a környezetet `.env` fájlban:

```env
VITE_CALCULATION_MODE=hybrid
VITE_API_BASE_URL=https://api.kalkulatorbazis.hu
VITE_API_TIMEOUT_MS=8000
```

3. Az API-adapter `toRequest` és `fromResponse` függvényével bármilyen backend-válasz leképezhető az app közös eredményformátumára.
4. `hybrid` módban hálózati/API-hiba esetén az adott kalkulátor helyi motorja automatikusan használható tartalékként.
5. Ha az API már stabil, `VITE_CALCULATION_MODE=api` kapcsolható; az API-val még nem rendelkező kalkulátorok továbbra is helyben működnek.

Részletes kontraktus: [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md).

## Fejlesztés

```bash
npm install
npm run check
npm run dev
```

Build:

```bash
npm run build
```

## Android / iOS

Első alkalommal:

```bash
npm run native:add:android
npm run native:add:ios
```

Szinkronizálás:

```bash
npm run native:sync
```

Android Studio:

```bash
npm run native:android
```

iOS / Xcode:

```bash
npm run native:ios
```

Az iOS buildhez macOS + Xcode szükséges. A generált `android/` és `ios/` mappákat csak akkor érdemes commitolni, amikor elkezdődik a tényleges store-build konfigurálása.

## GitHub Pages

A forrás továbbra is közvetlenül kiszolgálható GitHub Pages-ről, mert az alkalmazás natív böngészőmodulokat és relatív útvonalakat használ. A Vite build elsősorban a natív Capacitor-csomaghoz és ellenőrzött production buildhez kell.
