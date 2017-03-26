import * as React from "react";
import { MatchSummary } from "./MatchSummary";

// TODO: Implement "load more" and/or infinite scrolling
export interface HorizonalMatchListProps {
  matchSummaries: MatchSummary[];
  onSelectMatch: (matchUrl: string) => void;
}

export class HorizonalMatchList extends React.Component<HorizonalMatchListProps, {}> {
  render(): JSX.Element {
    return <div> { "Matches: "}
      { this.props.matchSummaries.map(matchSummary =>
        <span className="horiz-match-summary"><a onClick={() => this.props.onSelectMatch(matchSummary.matchURL)}>
          Match {matchSummary.gameName} with {matchSummary.playerNames.join(", ")}
        </a></span>
      )}
    </div>;
  }

}
