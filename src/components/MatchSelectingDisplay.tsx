import * as React from "react";
import { securifyUrl } from "../util/html";
import { MatchSummary } from "./match-list/MatchSummary";
import { VerticalMatchList } from "./match-list/VerticalMatchList";
import { TiltyardAllGamesMetadata, TiltyardMatchSummary } from "./MatchSelectingDisplay";
import { SingleMatchDisplay } from "./SingleMatchDisplay";

export interface MatchSelectingDisplayProps {
}

// TODO: Implement "load more" and/or infinite scrolling
export interface MatchSelectingDisplayState {
  curMatchUrl?: string;
  availableMatchSummaries?: MatchSummary[];
  allGamesMetadata?: TiltyardAllGamesMetadata;
}

export class MatchSelectingDisplay extends React.Component<MatchSelectingDisplayProps, MatchSelectingDisplayState> {
  private reloadMatchesRef: number;

  constructor(props?: MatchSelectingDisplayProps, context?: any) {
    super(props, context);
    this.state = {};
  }

  public render(): JSX.Element {
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

  public componentDidMount(): void {
    const matchListUrl = "http://simulated.tech:8888/summary";
    fetch(matchListUrl)
      .then((response) => { return response.text(); })
      .then((body) => {
        const rawMatchesList: RawMatchesList = JSON.parse(body);

        const summaries: MatchSummary[] = rawMatchesList.queryMatches.map(toMatchSummary);

        this.setState({
          availableMatchSummaries: summaries,
          curMatchUrl: summaries.length > 0 ? summaries[0].matchUrl : undefined,
        });
      });

    const gameMetadataUrl = "https://games.ggp.org/base/games/metadata";
    fetch(gameMetadataUrl)
      .then((response) => { return response.text(); })
      .then((body) => {
        const gamesMetadata: TiltyardAllGamesMetadata = JSON.parse(body);

        this.setState({
          allGamesMetadata: gamesMetadata,
        });
      });

    // Start the regular match reloader
    this.reloadMatchesRef = setInterval(() => this.reloadMatches(), 20000);
  }

  public componentWillUnmount() {
    clearInterval(this.reloadMatchesRef);
  }

  private reloadMatches() {
    const oldSummaries = this.state.availableMatchSummaries;
    if (oldSummaries === undefined) {
      // Wait for that to load the first time
      return;
    }
    const matchListUrl = "http://simulated.tech:8888/summary";
    fetch(matchListUrl)
      .then((response) => { return response.text(); })
      .then((body) => {
        const rawMatchesList: RawMatchesList = JSON.parse(body);
        const newSummaries: MatchSummary[] = rawMatchesList.queryMatches.map(toMatchSummary);
        this.mergeOldSummariesIntoNew(oldSummaries, newSummaries);

        this.setState({
          availableMatchSummaries: newSummaries,
          // TODO: In certain situations, we may also want to update the curMatchUrl
        });
      });
  }

  // Warning: Mutates newSummaries
  private mergeOldSummariesIntoNew(oldSummaries: MatchSummary[], newSummaries: MatchSummary[]): void {

    let alreadyAdded: Set<string> = new Set<string>(newSummaries.map((summary) => summary.matchUrl));
    oldSummaries.forEach((summary) => {
      if (!alreadyAdded.has(summary.matchUrl)) {
        newSummaries.push(summary);
      }
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
  if (gameMetaUrl.startsWith("http://games.ggp.org/")
      || gameMetaUrl.startsWith("https://games.ggp.org/")) {
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
  };
}

function toMatchSummary(rawMatch: TiltyardMatchSummary): MatchSummary {
  return {
    aborted: rawMatch.isAborted,
    gameMetaUrl: securifyUrl(rawMatch.gameMetaURL),
    goalValues: rawMatch.goalValues,
    matchUrl: rawMatch.matchURL,
    playerNames: rawMatch.playerNamesFromHost.map(transformPlayerName),
  };
}

function transformPlayerName(rawName: string): string {
  if (rawName == undefined || rawName === "") {
    return "Anonymous";
  }
  return rawName;
}

export interface RawMatchesList {
  queryMatches: TiltyardMatchSummary[];
}

export interface TiltyardMatchSummary {
  //randomToken: string;
  playerNamesFromHost: string[];
  hasErrors: boolean;
  //lastUpdated: number;
  //moveCount: number;
  //scrambled: boolean;
  //allErrors: boolean;
  //isPlayerHuman: boolean[];
  matchURL: string;
  //startTime: number;
  //playClock: number;
  //tournamentNameFromHost: string;
  matchLength: number;
  //allErrorsForPlayer: boolean[];
  //hashedMatchHostPK: string;
  //hasErrorsForPlayer: boolean[];
  //startClock: number;
  matchId: string;
  //matchRoles: number;
  gameMetaURL: string;
  isAborted: boolean;
  isCompleted: boolean;
  //allErrorsForSomePlayer: boolean;
  goalValues?: number[];
}
