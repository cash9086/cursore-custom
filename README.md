# cursore-custom

Il cursore di **The Cape Studio**: il marchio che morfa in un anello quando
passa su qualcosa di cliccabile, con magnetismo sull'elemento sotto.

Estratto dal footer della Home il 2026-09-19. Da solo pesava tredicimila
caratteri su un campo che ne ammette cinquantamila, quasi tutti per le due
liste di coordinate della forma.

## Come si include

Nel footer della Home, **dopo** il `<div id="capecur">` e il suo `<style>`,
che restano in pagina:

```html
<script defer src="https://cdn.jsdelivr.net/gh/cash9086/cursore-custom@SHA/cape-cursore.js"></script>
```

Al posto di `SHA` va lo SHA per esteso del commit, **mai `@main`**: quello
jsDelivr lo tiene in cache fino a 7 giorni.

## Cosa si aspetta di trovare

| | |
|---|---|
| `#capecur` | il proprio contenitore, con dentro `svg`, `.cc-ring`, `.cc-label` |
| `window.inkSection` | la mappa dell'inchiostro: dice se il puntatore e' sopra una zona gia' dipinta |
| `[data-cursor]` | su un elemento: l'etichetta da mostrare nell'anello |
| `[data-cursor-fondo]` | `chiaro` o `scuro` per forzare a mano il colore |
| `.cape-link` e c. | i bottoni-parola: la lista sta in `PAR_SEL` |

Gira solo da 992px in su e solo dove esiste un puntatore vero
(`hover: hover`): sul telefono esce subito senza fare niente.

## Sopra un bottone-parola: il punto

I bottoni della Home non sono piu' scatole ma parole sottolineate, e un
anello da 46px intorno a una parola e' una cornice intorno a un
francobollo. Sopra gli elementi elencati in `PAR_SEL` l'anello si chiude
quindi in un punto pieno da `RING_PAR` px.

Lo script fa una cosa sola: accende `su-parola` su `#capecur`. Il riempimento
e' una regola di stile, e sta in pagina con tutte le altre di `#capecur`:

```css
#capecur.su-parola .cc-ring{ background:var(--cc); border-color:transparent; }
```

Perche' la transizione valga anche in uscita, la regola `.cc-ring` che c'e'
gia' in pagina deve transire pure il riempimento:

```css
transition:border-color .18s linear,background-color .18s linear
```

Senza queste due righe lo script non rompe niente: semplicemente l'anello
diventa piccolo invece di diventare un punto.

## Le manopole

Stanno tutte in cima al file: `SIZE`, `RING_BTN`, `RING_IMG`, `RING_PAR`,
`TILT`, `TRAIL`, `MAGNET`, `MORPH`, `LABEL_DEF`, e la lista `PAR_SEL`.
