# Arkham Riddle Generator

Riddle me this, Viewer—can you hear me? Of course you can.
A neon-green web app that serves you randomized Batman: Arkham riddles (Asylum / City / Knight). 
You answer, we check, and we log your fate as Solved or Revealed in a bottom-right ledger. 
Data is loaded via the Fetch API from a JSON “API” you host with the app.

# Features

Random Riddle Generator from Arkham Asylum / City / Knight.

Filters per game (toggle checkboxes).

Answer Checking with normalized matching (simple equality + containment).

Reveal Answer logs as Revealed and auto-advances.

Solved vs Revealed Ledger (bottom-right), capped to recent 25 items.

No Immediate Repeats (shuffled deck; reshuffles only after you exhaust the pool).

Loading / Error UI for the Fetch step.

Riddler Neon UI (green glow on dark, readable over GIF).

Background Music (DL.mp3) loops; attempts autoplay, falls back to first click/keypress "x".


# Project Structure

- RG/                      # project root
- ├─ index.html            # UI skeleton
- ├─ style.css             # neon Riddler theme
- ├─ app.js                # app logic (Fetch, state, events, rendering)
- ├─ Riddlers-room.gif     # background animation (non-repeating)
- ├─ DL.mp3                # background music (optional; same folder as index.html)
- └─ data/
  -  └─ riddles.json       # our "API" source

# Content disclaimer

Batman: Arkham names and references are property of their respective owners (WB Games / Rocksteady). 
This project is for educational purposes only and ships no copyrighted text from the games—only student-authored riddle data.

# Author
De'ray Lowe
