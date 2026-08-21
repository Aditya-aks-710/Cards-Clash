// Pure game logic for the server (kept dependency-free so it's easy to unit-test).

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Resolve teams from each player's partner pick.
 * - If any mutual pick exists (A→B and B→A), that pair is a team and the other two form the second.
 * - Otherwise pair randomly and return a per-player explanation message.
 * Seating puts partners opposite: [teamA0, teamB0, teamA1, teamB1].
 *
 * @param {{id:string,name:string}[]} players  exactly the 4 players
 * @param {Record<string,string>} picks        playerId -> chosen partner id
 */
export function resolveTeams(players, picks) {
  const ids = players.map((p) => p.id);
  const nameOf = (id) => players.find((p) => p.id === id)?.name ?? '?';

  let pair = null;
  for (const x of ids) {
    const y = picks[x];
    if (y && picks[y] === x) { pair = [x, y]; break; }
  }

  let teamA;
  let teamB;
  let random = false;

  if (pair) {
    teamA = pair;
    teamB = ids.filter((id) => id !== pair[0] && id !== pair[1]);
  } else {
    random = true;
    const s = shuffle(ids);
    teamA = [s[0], s[1]];
    teamB = [s[2], s[3]];
  }

  const seats = [teamA[0], teamB[0], teamA[1], teamB[1]];

  const messages = {};
  if (random) {
    for (const id of ids) {
      const picked = picks[id];
      messages[id] = picked && picks[picked] !== id
        ? `${nameOf(picked)} didn't pick you back — teams were randomised.`
        : 'No mutual match — teams were randomised.';
    }
  }

  return { teamA, teamB, seats, random, messages };
}
