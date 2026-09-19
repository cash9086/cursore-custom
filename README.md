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

Gira solo da 992px in su e solo dove esiste un puntatore vero
(`hover: hover`): sul telefono esce subito senza fare niente.

## Le manopole

Stanno tutte in cima al file: `SIZE`, `RING_BTN`, `RING_IMG`, `TILT`,
`TRAIL`, `MAGNET`, `MORPH`, `LABEL_DEF`.
