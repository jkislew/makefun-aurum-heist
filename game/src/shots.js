// AURUM — deterministic screenshot hooks. ?shot=<name>&seed=<n> freezes
// the game in a composed, real state of its own systems (never a mockup):
//   cover — casing mode, blueprint floor, marks placed, routes drawn
//   play  — mid-Gallery at alarm level 2, all five mandated elements in
//           one frame: room being crossed, guard cones, a camera cone,
//           the Comet loot target beyond the lasers, the alarm meter
//   twist — seconds after the Comet is lifted: cage closed, cones red,
//           van headlights on, escape objective up
//   tally — getaway tally with the itemised treasure list and grade

export function applyShotSetup(game, shot) {
  const { thief } = game;
  if (shot === "cover" || shot === "casing") {
    game.mode = "casing";
    game.plan.placeMark(300, 430);
    game.plan.placeMark(640, 330);
    game.plan.placeMark(1000, 430);
    thief.x = 200; thief.y = 380;
    return;
  }
  if (shot === "play") {
    game.mode = "play";
    game.clock.pips = 4; game.clock.level = 2;
    game.clock.announcement = "LEVEL 2 — LASERS ARM: Vault corridor lasers start blinking.";
    game.clock.announcementTimer = 99;
    game.cameras.forEach((c) => { c.awake = true; });
    thief.x = 620; thief.y = 400;
    // The thief visibly carries one painting (its case on the floor is
    // already empty, the "carrying 1" tag renders over the thief).
    game.treasures[3].taken = true;
    thief.carrying = [game.treasures[3]];
    game.lootValue = 450;
    game.objective = "Lift THE AURUM COMET from the Vault Wing";
    game.subObjective = "Lasers are armed — time the corridor or take the vent";
    const [bram, selin, odo] = game.guards;
    bram.x = 180; bram.y = 560; bram.angle = -0.6;
    selin.x = 765; selin.y = 205; selin.angle = 2.5; selin.state = "Curious"; selin.noticed = 0.8;
    odo.x = 1010; odo.y = 200; odo.angle = 0.7;
    game.laserOn = true;
    return;
  }
  if (shot === "twist") {
    game.mode = "play";
    game.twistFired = true;
    game.clock.pips = 7; game.clock.level = 3;
    game.clock.announcement = "THE COMET IS LIFTED — GET TO THE VAN";
    game.clock.announcementTimer = 99;
    game.cameras.forEach((c) => { c.awake = true; });
    const comet = game.treasures.find((t) => t.star);
    comet.taken = true;
    thief.carrying = [comet];
    thief.x = 1005; thief.y = 605;
    game.lootValue = 2450;
    game.objective = "THE COMET IS LIFTED — GET TO THE VAN";
    game.subObjective = "The direct corridor is caged shut — find another way back";
    game.guards[1].x = 760; game.guards[1].y = 430; game.guards[1].angle = 2.9;
    game.guards[1].state = "Chase"; game.guards[1].watched = 1;
    game.guards[2].x = 1150; game.guards[2].y = 380; game.guards[2].angle = 3.4;
    game.guards[2].state = "Curious"; game.guards[2].noticed = 0.9;
    game.laserOn = true;
    return;
  }
  if (shot === "tally" || shot === "end") {
    game.mode = "tally";
    const takenIds = ["painting-dawn", "painting-river", "sapphire", "comet"];
    for (const t of game.treasures) t.taken = takenIds.includes(t.id);
    game.thief.carrying = game.treasures.filter((t) => t.taken);
    game.lootValue = 3350;
    game.finishRun(true);
    return;
  }
  game.mode = "title";
}
