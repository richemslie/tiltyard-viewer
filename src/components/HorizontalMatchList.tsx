import * as React from "react";

export interface MatchSummary {
  matchURL: string;
  gameName: string;
  playerNames: string[];
}

// TODO: Implement "load more" and/or infinite scrolling
export interface HorizonalMatchListProps {
  matchSummaries: MatchSummary[];
  onSelectMatch: (matchUrl: string) => void;
}

export class HorizonalMatchList extends React.Component<HorizonalMatchListProps, {}> {
  render(): JSX.Element {
    return <div> { "Matches: "}
      { this.props.matchSummaries.map(matchSummary =>
        <span><a onClick={() => this.props.onSelectMatch(matchSummary.matchURL)}>
          Match {matchSummary.gameName} with {matchSummary.playerNames.join(", ")}
        </a></span>
      )}
    </div>;
  }

}
