import * as React from "react";

export interface SingleMatchDisplayProps {
  matchId: string;
}

export class SingleMatchDisplay extends React.Component<SingleMatchDisplayProps, {}> {
  render() {
    return <div className="singleMatchDisplay">
      <div className="sidePanel">
        Match info goes here
      </div>
      <div className="mainPanel">
        Visualization goes here
      </div>
    </div>;
  }
}
