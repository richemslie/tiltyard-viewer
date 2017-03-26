import * as React from "react";
import { TiltyardAllGamesMetadata } from "./MatchSelectingDisplay";
import { TiltyardMatchSummary } from "./MatchSelectingDisplay";
import { SingleMatchDisplay } from "./SingleMatchDisplay";
import { MatchSummary } from "./match-list/MatchSummary";
import { VerticalMatchList } from "./match-list/VerticalMatchList";



export interface MatchSelectingDisplayProps {
}

// TODO: Implement "load more" and/or infinite scrolling
export interface MatchSelectingDisplayState {
  curMatchUrl?: string;
  availableMatchSummaries?: MatchSummary[];
  allGamesMetadata?: TiltyardAllGamesMetadata;
}

export class MatchSelectingDisplay extends React.Component<MatchSelectingDisplayProps, MatchSelectingDisplayState> {
  constructor(props?: MatchSelectingDisplayProps, context?: any) {
    super(props, context);
    this.state = {};
  }

  render(): JSX.Element {
    return this.renderWithVerticalMatchList();
  }

  renderWithVerticalMatchList(): JSX.Element {
    return <div className="vertical-match-selecting-display">
        <div className="match-display-column">
          {this.state.curMatchUrl
            ? <SingleMatchDisplay matchUrl={this.state.curMatchUrl} />
            : "No match selected."}
         </div>
        <div className="match-selector-column">
          <VerticalMatchList
            matchSummaries={this.state.availableMatchSummaries || []}
            onSelectMatch={(matchId: string) => {
              this.setState({curMatchUrl: matchId});
            }}
            getGameName={this.state.allGamesMetadata != undefined
              ? gameNameFromMetadataGetter(this.state.allGamesMetadata)
              : GAME_NAME_FROM_URL_GETTER
            }
             />
        </div>
      </div>;
  }

  componentDidMount(): void {
    // The hash is the identifier for Tiltyard specifically
    const matchListUrl = "http://database.ggp.org/query/filter,recent,90bd08a7df7b8113a45f1e537c1853c3974006b2";
    fetch(matchListUrl)
      .then((response) => { return response.text() })
      .then((body) => {
        const rawMatchesList: RawMatchesList = JSON.parse(body);
        const summaries: MatchSummary[] = rawMatchesList.queryMatches.map(toMatchSummary);

        this.setState({
          curMatchUrl: summaries.length > 0 ? summaries[0].matchUrl : undefined,
          availableMatchSummaries: summaries,
        });
      });

    const gameMetadataUrl = "http://games.ggp.org/base/games/metadata";
    fetch(gameMetadataUrl)
      .then((response) => { return response.text() })
      .then((body) => {
        const gamesMetadata: TiltyardAllGamesMetadata = JSON.parse(body);

        this.setState({
          allGamesMetadata: gamesMetadata
        });
      });
  }
}

export interface TiltyardAllGamesMetadata {
  [gameKey: string]: TiltyardGameMetadata;
}

export interface TiltyardGameMetadata {
  gameName: string;
  version: number;
  numRoles: number;
  roleNames: string[];
  rulesheet: string;
  description?: string;
  stylesheet?: string;
  user_interface?: string;
}

const GAME_NAME_FROM_URL_GETTER = (matchSummary: MatchSummary) => {
  return getGameKeyFromMetaUrl(matchSummary.gameMetaUrl);
};

function getGameKeyFromMetaUrl(gameMetaUrl: string): string {
  if (gameMetaUrl.startsWith("http://games.ggp.org/")) {
    let components = gameMetaUrl.split("/");
    if (components.length >= 6) {
      return components[5];
    }
  }
  return gameMetaUrl;
}

function gameNameFromMetadataGetter(allGamesMetadata: TiltyardAllGamesMetadata): (ms: MatchSummary) => string {
  return (matchSummary: MatchSummary) => {
    const gameMetaUrl = matchSummary.gameMetaUrl;
    // Still kind of hacky: get the game key
    const gameKey = getGameKeyFromMetaUrl(gameMetaUrl);
    const gameMetadata = allGamesMetadata[gameKey];
    if (gameMetadata != undefined) {
      return gameMetadata.gameName;
    } else {
      return gameKey;
    }
  }
}

function toMatchSummary(rawMatch: TiltyardMatchSummary): MatchSummary {
  return {
    matchUrl: rawMatch.matchURL,
    gameMetaUrl: rawMatch.gameMetaURL,
    playerNames: rawMatch.playerNamesFromHost,
    goalValues: rawMatch.goalValues,
  };
}

export interface RawMatchesList {
  queryMatches: TiltyardMatchSummary[];
}

export interface TiltyardMatchSummary {
  randomToken: string;
  playerNamesFromHost: string[];
  hasErrors: boolean;
  lastUpdated: number;
  moveCount: number;
  scrambled: boolean;
  allErrors: boolean;
  isPlayerHuman: boolean[];
  matchURL: string;
  startTime: number;
  playClock: number;
  tournamentNameFromHost: string;
  matchLength: number;
  allErrorsForPlayer: boolean[];
  hashedMatchHostPK: string;
  hasErrorsForPlayer: boolean[];
  startClock: number;
  matchId: string;
  matchRoles: number;
  gameMetaURL: string;
  isAborted: boolean;
  isCompleted: boolean;
  allErrorsForSomePlayer: boolean;
  goalValues?: number[];
}
