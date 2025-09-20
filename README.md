# Evolab – Digitale Mini-Evolution (GitHub Pages)

**Was es ist:**  
Eine kleine, selbsterhaltende Evolutions-Webapp. Sie läuft komplett im Browser, speichert Zustand lokal (offline-fähig) und kann optional über GitHub Actions aggregierte Tages-Snapshots erzeugen.

**Wie es funktioniert (Kurz):**
- Der Browser erzeugt, mutiert und bewertet einfache „Genome“ (3 Werte in [0..1]).
- Fitness misst die Nähe zu einem Zielvektor (Standard: `[0.2,0.8,0.5]`).
- Beste Lösungen werden behalten, über Generationen immer besser.
- Zustand wird lokal gespeichert; bei erneutem Öffnen wird fortgesetzt.
- Export generiert `.jsonl`-Dateien (eine Zeile JSON pro Ergebnis) für PR-Einreichung.

## Start (lokal & GitHub Pages)
1. Repo auf GitHub anlegen, Dateien hochladen.
2. **GitHub Pages** aktivieren (Branch `main`, Ordner `/` oder `gh-pages`).
3. Seite öffnen → **Start** drücken. Läuft offline nach erstem Laden (PWA).

## Ergebnisse einreichen (optional)
- Button **„Bestes Ergebnis exportieren“** erzeugt eine `.jsonl`-Datei.
- Per Pull Request in `data/queue/` ablegen (z. B. `data/queue/user-<name>.jsonl` anhängen).
- Der Workflow `heartbeat.yml` fasst alle Einreichungen alle 30 Minuten zu `data/snapshots/YYYY-MM-DD.json` zusammen.

## Ordner
- `src/` – Logik und UI
- `data/queue/` – Einreichungen (JSONL)
- `data/snapshots/` – Tages-Snapshots (automatisch)
- `schemas/` – JSON-Schemas (Dokumentation)
- `assets/` – Manifest & Icon
- `.github/workflows/` – Aggregations-Workflow

## Sicherheit
- Keine Secrets im Client. Contributions nur via PR/Actions.
- CSP aktiv, PWA-Cache versioniert.

## Lizenz
MIT (oder nach Wunsch anpassen).
