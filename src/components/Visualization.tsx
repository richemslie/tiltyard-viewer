import * as React from "react";
import { TiltyardMatch } from "../types.ts";

export interface VisualizationProps {
  // matchId: string;
  // game: Game;
  // playerNames: string[];
  // startClock: number;
  // playClock: number;
  // match: TiltyardMatch;
  visualization: Node;
}

export class Visualization extends React.Component<VisualizationProps, {}> {
  render(): JSX.Element {
    // return <div>
    // </div>
    // this.props.children
    // React.createElement()
    return <div dangerouslySetInnerHTML={this.getContents()} />;
  }

  getContents() {
    var tmp = document.createElement("div");
    tmp.appendChild(this.props.visualization);
    let vizHtml = tmp.innerHTML;
    // tmp.removeChild(this.props.visualization);
    tmp.remove();
    return {
      __html: vizHtml
    }
  }
}
