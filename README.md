# makefun-aurum-heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/jkislew/makefun-aurum-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/jkislew/makefun-aurum-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

AURUM — The Clockwork Heist: case the museum, place 3 marks, lift 9 treasures past 4 guards, 3 cameras and a laser vault before the Midnight Clock fills — 3 wings, 5 alarm levels, 1 getaway van.

Case the Starlight Museum by day, mark your plan, then lift the Aurum Comet by night — while one brass alarm clock fills pip by pip whether you are seen or not, and every pip makes the museum meaner. The Midnight Clock gains a pip every 18 seconds on its own and never gives it back: at level 1 the cameras wake, at level 2 the vault lasers arm, at level 3 a fourth guard enters, at level 4 the vault reseals, and at level 5 only the service hatch stays open. Before nightfall you walk the floor as a visitor and place exactly 3 marks — a Coin Cache, a Blackout Fuse, a Rope Drop — so two players rob the same museum differently. Detection is graded (a NOTICED ring that makes guards investigate, a WATCHED core that means chase), every treasure you carry slows you 4%, and lifting the Comet fires the twist: +2 pips, the return corridor cages shut, and the getaway van starts a 90-second patience meter. One museum, 3 wings, 9 named treasures, throw-coins, vents, shadow pools, fuse panels, a WebAudio synth soundtrack of ticks and stings, and a getaway tally that grades you GHOST, JEWEL THIEF, CAT BURGLAR or SMASH-AND-GRAB. Vanilla canvas, no libraries, no network, deterministic seeded layout.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 — or hand the entry in with:
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Controls: WASD/arrows move · Shift sneak · Space throw a coin toward the mouse · E take treasure / crack the Comet case / work a camera panel · Tab cycle the mark kit in casing mode · Enter starts NIGHTFALL · P pause · M mute · R one more night.

---
<sub>Entered on [make.fun](https://make.fun/?ref=tpc75c2v&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
