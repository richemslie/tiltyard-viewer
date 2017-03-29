import * as React from "react";
import { MatchSummary } from "./MatchSummary";

// TODO: Implement "load more" and/or infinite scrolling
export interface VerticalMatchListProps {
  matchSummaries: MatchSummary[];
  onSelectMatch: (matchUrl: string) => void;
  getGameName: (summary: MatchSummary) => string;
}

export class VerticalMatchList extends React.Component<VerticalMatchListProps, {}> {
  public render(): JSX.Element {
    return <div> { "Matches: "}
      { this.props.matchSummaries.map((matchSummary) =>
        <div className="vertical-match-summary" key={matchSummary.matchUrl}>
          <a onClick={() => this.props.onSelectMatch(matchSummary.matchUrl)}>
            <div className="game-name-in-match-summary">{this.props.getGameName(matchSummary)}:</div>
            {matchSummary.playerNames.map((name, index) =>
              <div className="player-in-match-summary" key={index}>
                {name + getGoalInfo(matchSummary, index)}
              </div>)}
          </a>
        </div>,
      )}
    </div>;
  }
}

function getGoalInfo(matchSummary: MatchSummary, index: number) {
  if (matchSummary.goalValues != undefined) {
    return " (" + matchSummary.goalValues[index] + ")";
  }
  return "";
}
