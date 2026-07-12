# Kalkulátor Bázis App

Telepíthető, mobilra optimalizált PWA a Kalkulátor Bázishoz.

## Funkciók

- 9 működő kalkulátor
- keresés
- kedvencek és legutóbbi használat helyi mentése
- offline gyorsítótár
- Android/iOS kezdőképernyős telepítés
- GitHub Pages-kompatibilis relatív útvonalak

## Közzététel GitHub Pages-en

1. Hozz létre egy nyilvános `kalkulatorbazis-app` repót.
2. Töltsd fel a projekt összes fájlját a repó gyökerébe.
3. Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
4. Az app címe: `https://patrik2020.github.io/kalkulatorbazis-app/`

## Helyi teszt

Service worker miatt HTTP-kiszolgálón nyisd meg, például:

```bash
python -m http.server 8080
```
