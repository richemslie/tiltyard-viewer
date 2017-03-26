import * as React from "react";
import { MatchSummary } from "./MatchSummary";

// TODO: Implement "load more" and/or infinite scrolling
export interface VerticalMatchListProps {
  matchSummaries: MatchSummary[];
  onSelectMatch: (matchUrl: string) => void;
}

export class VerticalMatchList extends React.Component<VerticalMatchListProps, {}> {
  render(): JSX.Element {
    return <div> { "Matches: "}
      { this.props.matchSummaries.map(matchSummary =>
        <div className="vertical-match-summary"><a onClick={() => this.props.onSelectMatch(matchSummary.matchURL)}>
          {matchSummary.gameName}:
          {matchSummary.playerNames.map(name => <div className="player-in-match-summary">{name}</div>)}
        </a></div>
      )}
    </div>;
  }

}
