import * as React from "react";
import { TiltyardGameRawMetadata, TiltyardMatch } from "../types";
import { MovesTable } from "./MovesTable";

export interface MatchInfoProps {
  match: TiltyardMatch;
  gameMetadata?: TiltyardGameRawMetadata;
  turnNumber?: number;
  setTurnNumber: (turnNumber: number) => void;
}

export class MatchInfo extends React.Component<MatchInfoProps, {}> {
 public render() {
    return <div>
      <p>Game: { this.getGameName() }</p>
      <p>Start clock: {this.props.match.startClock}<br/>
         Play clock: {this.props.match.playClock}</p>
      <div>Players involved:<br/>
        {this.getPlayersInvolved()}</div>
      {this.props.match.isAborted ? this.getAbortedMessage() : ""}
      <div className="moves-table-holder">
        <MovesTable roleNames={this.props.gameMetadata && this.props.gameMetadata.roleNames}
          movesByTurn={this.props.match.moves}
          errorsByTurn={this.props.match.errors}
          turnNumber={this.props.turnNumber}
          setTurnNumber={this.props.setTurnNumber} />
      </div>
    </div>;
  }

  private getAbortedMessage(): React.ReactChild {
    return <p>
      (This match has been aborted.)
    </p>;
  }

  private getGameName(): React.ReactChild {
    const metaUrl = this.props.match.gameMetaURL;
    if (this.props.gameMetadata) {
      const searchTerm = "//games.ggp.org/";
      let foundIndex = metaUrl.indexOf(searchTerm);
      if (foundIndex >= 0) {
        let repoStartIndex = foundIndex + searchTerm.length;
        let repoEndIndex = metaUrl.indexOf("/", repoStartIndex);
        let repoName = metaUrl.slice(repoStartIndex, repoEndIndex);
        let slashAfterGamesIndex = metaUrl.indexOf("/", repoEndIndex + 1);
        const humanUrl = metaUrl.slice(0, foundIndex)
          + "//www.ggp.org/view/all/games/"
          + repoName
          + metaUrl.slice(slashAfterGamesIndex);
        return <a href={humanUrl}>{this.props.gameMetadata.gameName}</a>;
      }
      return <text>{this.props.gameMetadata.gameName}</text>;
    }
    return <text>{metaUrl}</text>;
  }

  private getPlayersInvolved(): React.ReactChild[] {
    return this.props.match.playerNamesFromHost.map((playerName, index) => {
      return <div key={index}>{playerName || "Anonymous"} as {getRoleIdentifier(this.props.gameMetadata, index)}
        {getGoalInfo(this.props.match, index)}</div>;
    });
  }
}

function getRoleIdentifier(gameMetadata: TiltyardGameRawMetadata, playerIndex: number): React.ReactChild {
  if (gameMetadata != undefined && gameMetadata.roleNames != undefined) {
    return gameMetadata.roleNames[playerIndex];
  }
  return "player " + (playerIndex + 1);
}

function getGoalInfo(match: TiltyardMatch, playerIndex: number): React.ReactChild {
  if (match != undefined && match.goalValues != undefined) {
    return " (" + match.goalValues[playerIndex] + ")";
  }
  return "";
}
