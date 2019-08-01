import * as React from "react";
import { IMxGraph, IMxUndoManager } from "../types/mxGraph";
import { IMxActions } from "../types/action";


export interface IMxGraphContext {
  graph?: IMxGraph;
  setGraph(graph: IMxGraph): void;
  undoManager? : IMxUndoManager;
  action? : IMxActions;
}

export const MxGraphContext = React.createContext<IMxGraphContext>({
  graph: undefined,
  // tslint:disable-next-line: no-empty
  setGraph: () => {},
});
