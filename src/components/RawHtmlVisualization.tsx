import * as React from "react";

export interface RawHtmlVisualizationProps {
  html: string;
}

export class RawHtmlVisualization extends React.Component<RawHtmlVisualizationProps, {}> {
  public render(): JSX.Element {
    return <div dangerouslySetInnerHTML={this.getContents()} />;
  }

  private getContents() {
    return {
      __html: this.props.html,
    };
  }
}
