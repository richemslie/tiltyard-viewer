

export interface Game {
  name: string;
}

export interface TiltyardMatch {
  randomToken?: string, // Base-64 encoded
  playerNamesFromHost: string[],
  moves: string[][],
  states: string[],
  scrambled?: boolean,
  goalValues?: number[],
  isPlayerHuman?: boolean[],
  playClock: number,
  startTime: number,
  stateTimes: number[],
  tournamentNameFromHost?: string,
  errors: string[][],
  matchHostSignature?: string,
  startClock: number,
  matchId: string,
  gameMetaURL?: string,
  matchHostPK?: string,
  previewClock?: number,
  isAborted: boolean,
  isCompleted: boolean,
}
