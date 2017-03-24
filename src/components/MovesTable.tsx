import * as React from "react";

export interface MovesTableProps {
  roleNames?: string[];
  movesByTurn: string[][];
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
  render() {
    return <table>
      <thead>{ this.getRoleNameHeader() }</thead>
      <tbody>{ this.getPreMovesRow() }{ this.getMoveRows() }</tbody>
    </table>
  }

  getRoleNameHeader(): JSX.Element {
    if (this.props.roleNames) {
      return <tr>
        <th>Turn</th>
        { this.props.roleNames.map(roleName => {
          return <th>{roleName}</th>
        }) }
      </tr>;
    } else if (this.props.movesByTurn.length > 0) {
      const numRoles = this.props.movesByTurn[0].length;
      return <tr><th>Turn</th><th colSpan={numRoles}>Loading...</th></tr>;
    } else {
      return <tr><th>Turn</th><th>Loading...</th></tr>;
    }
  }

  getPreMovesRow(): JSX.Element {
    let arrow = (0 === this.props.turnNumber) ? "> " : "";
    return <tr key={"premoves"} onClick={() => {this.props.setTurnNumber(0)}}>
        <td key="moveNum" className="turn-number">{arrow + 0}</td>
        {
          this.getPreMovesCells(this.props.roleNames ? this.props.roleNames.length :
           (this.props.movesByTurn.length > 0 ? this.props.movesByTurn[0].length : 1))
          //return <td key={roleIndex}>{prettifyMove(move)}</td>
        }
      </tr>
  }

  getPreMovesCells(count: number): JSX.Element[] {
    return new Array(count).fill(<td>&mdash;</td>);
  }

  getMoveRows(): JSX.Element[] {
    return this.props.movesByTurn.map((moves, index) => {
      let turnNumber = index + 1;
      let arrow = (turnNumber === this.props.turnNumber) ? "> " : "";
      return <tr key={turnNumber} onClick={() => {this.props.setTurnNumber(turnNumber)}}>
        <td key="moveNum" className="turn-number">{arrow + turnNumber}</td>
        { moves.map((move, roleIndex) => {
          return <td key={roleIndex}>{prettifyMove(move)}</td>
        })}
      </tr>
    });
  }
}
