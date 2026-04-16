export type Stage = 'group' | 'round_of_16' | 'quarter' | 'semi' | 'third_place' | 'final'
export type MatchStatus = 'upcoming' | 'live' | 'finished'
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'
export type EventType = 'goal' | 'assist' | 'yellow_card' | 'red_card'
export type PredictionWinner = 'home' | 'away' | 'draw'

export interface Team {
  id: string
  name: string
  code: string
  groupName: string | null
  flagUrl: string | null
}

export interface Player {
  id: string
  name: string
  teamId: string
  position: string | null
  shirtNumber: number | null
  isActive: boolean
  team?: Team
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  matchDate: string
  bettingClosesAt: string | null
  stage: Stage
  groupName: string | null
  venue: string | null
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  knockoutWinner: 'home' | 'away' | null
  penaltyHomeScore: number | null
  penaltyAwayScore: number | null
  isScored: boolean
  homeTeam: Team
  awayTeam: Team
  predictions?: Prediction[]
  matchEvents?: MatchEvent[]
}

export function isKnockout(stage: Stage): boolean {
  return stage !== 'group'
}

export interface MatchEvent {
  id: string
  matchId: string
  playerId: string
  eventType: EventType
  minute: number | null
  player?: Player
}

export interface Profile {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  isAdmin: boolean
  totalPoints: number
}

export interface Prediction {
  id: string
  userId: string
  matchId: string
  predictedWinner: PredictionWinner | null
  predictedHomeScore: number | null
  predictedAwayScore: number | null
  predictedPenaltyHomeScore: number | null
  predictedPenaltyAwayScore: number | null
  pointsEarned: number
  isScored: boolean
  predictionPlayers?: PredictionPlayer[]
}

export interface PredictionPlayer {
  id: string
  predictionId: string
  playerId: string
  eventType: 'goal' | 'assist'
  player?: Player
}

export interface ScoringRule {
  id: string
  ruleKey: string
  points: number
  description: string
}

export const STAGE_LABELS: Record<Stage, string> = {
  group:        'Fase de Grupos',
  round_of_16:  'Octavos de Final',
  quarter:      'Cuartos de Final',
  semi:         'Semifinal',
  third_place:  'Tercer Puesto',
  final:        'Final',
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  upcoming: 'Por jugar',
  live:     'En vivo',
  finished: 'Finalizado',
}
