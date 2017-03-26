import * as React from "react";
import { VerticalMatchList } from "./match-list/VerticalMatchList";
import { TiltyardMatchSummary } from "./MatchSelectingDisplay";
import { SingleMatchDisplay } from "./SingleMatchDisplay";
import { HorizonalMatchList } from "./match-list/HorizontalMatchList";
import { MatchSummary } from "./match-list/MatchSummary";


export interface MatchSelectingDisplayProps {
}

// TODO: Implement "load more" and/or infinite scrolling
export interface MatchSelectingDisplayState {
  curMatchUrl?: string;
  availableMatchSummaries?: MatchSummary[];
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
            }} />
        </div>
      </div>;
  }

  renderWithHorizontalMatchList(): JSX.Element {
    // TODO: Style these so they have consistent space
    return <div>
        <HorizonalMatchList
          matchSummaries={this.state.availableMatchSummaries || []}
          onSelectMatch={(matchId: string) => {
            this.setState({curMatchUrl: matchId});
          }} />
        {this.state.curMatchUrl
         ? <SingleMatchDisplay matchUrl={this.state.curMatchUrl} />
         : "No match selected."}
      </div>;
  }

  componentDidMount(): void {
    // The hash is the identifier for Tiltyard specifically
    let matchListUrl = "http://database.ggp.org/query/filter,recent,90bd08a7df7b8113a45f1e537c1853c3974006b2";
    fetch(matchListUrl)
      .then((response) => { return response.text() })
      .then((body) => {
        console.info(body);
        let rawMatchesList: RawMatchesList = JSON.parse(body);
        let summaries: MatchSummary[] = rawMatchesList.queryMatches.map(toMatchSummary);

        this.setState({
          curMatchUrl: summaries.length > 0 ? summaries[0].matchURL : undefined,
          availableMatchSummaries: summaries,
        });
      });
  }
}

function toMatchSummary(rawMatch: TiltyardMatchSummary): MatchSummary {
  return {
    matchURL: rawMatch.matchURL,
    gameName: hackyGameNameRetrieval(rawMatch.gameMetaURL),
    playerNames: rawMatch.playerNamesFromHost,
  };
}

function hackyGameNameRetrieval(gameMetaUrl: string): string {
  if (gameMetaUrl.startsWith("http://games.ggp.org/")) {
    let components = gameMetaUrl.split("/");
    if (components.length >= 6) {
      return components[5];
    }
  }
  return gameMetaUrl;
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
}
