// ============================================================
// CARD CLASH — pure game logic + state machine (reducer)
// Scoring rule (locked with the user):
//   diff = actualTricks - bid
//   0 <= diff <= 2  ->  +bid   (made the bid, up to +2 tolerance)
//   otherwise       ->  -bid   (fell short, or overshot by 3+)
// ============================================================

export const MIN_BID = 5;
export const MAX_BID = 13;
export const TOTAL_TRICKS = 13;

export function computeTeamPoints(bid, actual) {
  const diff = actual - bid;
  return diff >= 0 && diff <= 2 ? bid : -bid;
}

export const fmt = (n) => (n > 0 ? '+' : '') + n;

export const initialState = {
  screen: 'setup', // setup | bidding | scoring | summary | final
  teams: [
    { name: '', color: 'a', players: [{ name: '', score: 0 }, { name: '', score: 0 }] },
    { name: '', color: 'b', players: [{ name: '', score: 0 }, { name: '', score: 0 }] },
  ],
  numRounds: 5,
  round: 1,
  bids: [7, 7],
  cumulative: [0, 0],
  history: [], // [{ round, bids:[a,b], actual:[a,b], points:[a,b], contributions:[[{name,score}..]] }]
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROUNDS':
      return { ...state, numRounds: clamp(action.value, 1, 20) };

    case 'START': {
      const { team, players } = action.names;
      const teams = [
        {
          name: (team[0] || '').trim() || 'Team A', color: 'a',
          players: [
            { name: (players[0] || '').trim() || 'Player 1', score: 0 },
            { name: (players[1] || '').trim() || 'Player 2', score: 0 },
          ],
        },
        {
          name: (team[1] || '').trim() || 'Team B', color: 'b',
          players: [
            { name: (players[2] || '').trim() || 'Player 3', score: 0 },
            { name: (players[3] || '').trim() || 'Player 4', score: 0 },
          ],
        },
      ];
      return { ...state, teams, round: 1, bids: [7, 7], cumulative: [0, 0], history: [], screen: 'bidding' };
    }

    case 'SET_BID': {
      const bids = [...state.bids];
      bids[action.team] = clamp(bids[action.team] + action.delta, MIN_BID, MAX_BID);
      return { ...state, bids };
    }

    case 'GO_SCORING': {
      const teams = state.teams.map((t) => ({ ...t, players: t.players.map((p) => ({ ...p, score: 0 })) }));
      return { ...state, teams, screen: 'scoring' };
    }

    case 'SET_SCORE': {
      const teams = state.teams.map((t, ti) =>
        ti !== action.team ? t : {
          ...t,
          players: t.players.map((p, pi) =>
            pi !== action.player ? p : { ...p, score: clamp(p.score + action.delta, 0, TOTAL_TRICKS) }
          ),
        }
      );
      return { ...state, teams };
    }

    case 'END_ROUND': {
      const actual = state.teams.map((t) => t.players.reduce((s, p) => s + p.score, 0));
      const points = state.teams.map((t, i) => computeTeamPoints(state.bids[i], actual[i]));
      const cumulative = state.cumulative.map((c, i) => c + points[i]);
      const entry = {
        round: state.round,
        bids: [...state.bids],
        actual,
        points,
        contributions: state.teams.map((t) => t.players.map((p) => ({ name: p.name, score: p.score }))),
      };
      return { ...state, cumulative, history: [...state.history, entry], screen: 'summary' };
    }

    case 'NEXT_ROUND':
      return state.round < state.numRounds
        ? { ...state, round: state.round + 1, bids: [7, 7], screen: 'bidding' }
        : { ...state, screen: 'final' };

    case 'PLAY_AGAIN':
      return { ...state, round: 1, bids: [7, 7], cumulative: [0, 0], history: [], screen: 'setup' };

    default:
      return state;
  }
}
