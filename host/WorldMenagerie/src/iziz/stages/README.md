# Stages of the Iziz build

These files are fragments of one function body. `tools/build-page.py` concatenates them in file order
into `../build.js` as `export async function build(ctx){ … }`, so they share one scope: a stage may use
any name an earlier stage defined, and `await stage('x')` / `section('x', () => { … })` come from
`src/core/diag.js`. Things one stage hands to a later one, or to the console, go on `ctx` (`window._iz`).

Edit here, then `./sitectl build` (also run by `check`, `reload`, `restart` and `test`). Adding a stage:
pick a number that puts it after everything it needs.
