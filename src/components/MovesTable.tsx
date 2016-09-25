import * as React from "react";

export interface MovesTableProps {
  roleNames?: string[];
  movesByTurn: string[][];
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
      <tbody>{ this.getMoveRows() }</tbody>
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

  getMoveRows(): JSX.Element[] {
    return this.props.movesByTurn.map((moves, index) => {
      return <tr key={index}>
        <td key="moveNum">{index + 1}</td>
        { moves.map((move, roleIndex) => {
          return <td key={roleIndex}>{prettifyMove(move)}</td>
        })}
      </tr>
    });
  }
}
