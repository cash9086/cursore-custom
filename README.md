# cursore-custom

Il cursore di **The Cape Studio**: il marchio che si chiude in un punto
quando passa su qualcosa di cliccabile, con magnetismo sull'elemento sotto.

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
| `.cursor-view` | le immagini con la scritta VIEW: li' il cursore resta il logo. Sta in `VIEW_SEL` |

Gira solo da 992px in su e solo dove esiste un puntatore vero
(`hover: hover`): sul telefono esce subito senza fare niente.

## Sopra un pulsante: il punto

I bottoni della Home non sono piu' scatole ma parole sottolineate, e un
anello da 46px intorno a una parola e' una cornice intorno a un
francobollo. Sopra qualunque link o pulsante l'anello si chiude quindi in
un punto pieno da `RING_DOT` px. L'anello grande resta solo dove c'e' un
`[data-cursor]` da mostrare dentro.

Lo script fa una cosa sola: accende `su-punto` su `#capecur`. Il riempimento
e' una regola di stile, e sta in pagina con tutte le altre di `#capecur`:

```css
#capecur.su-punto .cc-ring{ background:var(--cc); border-color:transparent; }
```

Perche' la transizione valga anche in uscita, la regola `.cc-ring` che c'e'
gia' in pagina deve transire pure il riempimento:

```css
transition:border-color .18s linear,background-color .18s linear
```

Senza queste due righe lo script non rompe niente: semplicemente l'anello
diventa piccolo invece di diventare un punto.

## Sopra un'immagine: il logo, e basta

Le immagini che si prendono la scritta VIEW (`cape-view.js`, classe
`.cursor-view`) sono l'unico posto dove il cursore non si trasforma: resta
il logo e lascia parlare la scritta, che ci mette un po' ad arrivare. Due
cose che si trasformano nello stesso momento, a un palmo l'una dall'altra,
sono una in piu'.

## Le manopole

Stanno tutte in cima al file: `SIZE`, `RING_IMG`, `RING_DOT`, `TILT`,
`TRAIL`, `MAGNET`, `MORPH`, `LABEL_DEF`, e i selettori `MAG_SEL`, `NO_MAG`,
`VIEW_SEL`.
