import * as React from "react";
import { TiltyardMatch } from "../types.ts";

export interface VisualizationProps {
  visualization: Node;
}

export class Visualization extends React.Component<VisualizationProps, {}> {
  render(): JSX.Element {
    return <div dangerouslySetInnerHTML={this.getContents()} />;
  }

  getContents() {
    var tmp: HTMLDivElement = document.createElement("div");
    tmp.appendChild(this.props.visualization);
    let vizHtml = tmp.innerHTML;
    tmp.remove();

    return {
      __html: vizHtml
    }
  }
}
