import { range } from "lodash";
import * as React from "react";

export interface MovesTableProps {
  roleNames?: string[];
  movesByTurn: string[][];
  errorsByTurn: (string | undefined)[][];
  turnNumber?: number;
  setTurnNumber: (turnNumber: number) => void;
}

// Turns '( place 3 1 )' into '(place 3 1)'
function prettifyMove(move: string): string {
  move = move.replace(/\( +/g, "(");
  move = move.replace(/ +\)/g, ")");
  return move;
}

export class MovesTable extends React.Component<MovesTableProps, {}> {
  public render() {
    return <table>
      <thead>{ this.getRoleNameHeader() }</thead>
      <tbody>{ this.getPreMovesRow() }{ this.getMoveRows() }</tbody>
    </table>;
  }

  private getRoleNameHeader(): JSX.Element {
    if (this.props.roleNames) {
      return <tr>
        <th>Turn</th>
        { this.props.roleNames.map((roleName, index) => {
          return <th key={index}>{roleName}</th>;
        }) }
      </tr>;
    } else if (this.props.movesByTurn.length > 0) {
      const numRoles = this.props.movesByTurn[0].length;
      return <tr><th>Turn</th><th colSpan={numRoles}>Loading...</th></tr>;
    } else {
      return <tr><th>Turn</th><th>Loading...</th></tr>;
    }
  }

  private getPreMovesRow(): JSX.Element {
    let arrow = (0 === this.props.turnNumber) ? "> " : "";
    return <tr key={"premoves"} onClick={() => { this.props.setTurnNumber(0); }}>
        <td key="moveNum" className="turn-number">{arrow + 0}</td>
        {
          this.getPreMovesCells(this.props.roleNames ? this.props.roleNames.length :
           (this.props.movesByTurn.length > 0 ? this.props.movesByTurn[0].length : 1))
        }
      </tr>;
  }

  private getPreMovesCells(count: number): JSX.Element[] {
    return range(count).map((index) => <td key={index}>&mdash;</td>);
  }

  private getMoveRows(): JSX.Element[] {
    return this.props.movesByTurn.map((moves, index) => {
      const errors = this.props.errorsByTurn[index];
      let turnNumber = index + 1;
      let arrow = (turnNumber === this.props.turnNumber) ? "> " : "";
      return <tr key={turnNumber} onClick={() => { this.props.setTurnNumber(turnNumber); }}>
        <td key="moveNum" className="turn-number">{arrow + turnNumber}</td>
        { moves.map((move, roleIndex) => {
          const error = errors[roleIndex];
          const title = !!error ? error : "";
          const classNames = !!error ? "error-cell" : "";
          return <td className={classNames} key={roleIndex} title={title}>{prettifyMove(move)}</td>;
        })}
      </tr>;
    });
  }
}
