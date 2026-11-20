# kits/marr — Known Issues & Deferred Work

- **City Assembly (`settlements/marr`):** Per owner instructions, only the kit (`kits/marr` + `kits/iziz-vernacular/src/73d-vern-docks.js`) is built in this pass; the full 20,000-soul city target (`settlements/marr`) is deferred to the city build pass.
- **Hollow Interiors (`kits/interiors/sets/marr.js`):** Buildings use `vnBody` so they are ready for hollow interiors when a `marr` interior furnishing set is added; on the kit sheet `VERN.interiors` is `false` so all exteriors render solid with room-card backed glazing.
