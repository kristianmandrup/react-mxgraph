// tslint:disable-next-line: no-empty-interface
export interface IEdge {

}

// tslint:disable-next-line: no-empty-interface
export interface IVertex {

}

// tslint:disable-next-line: no-empty-interface
export interface IParent {

}

export interface ImxCell {
  vertex: boolean;
  edge: boolean;
  source?: ImxCell;
  target?: ImxCell;
  parent?: ImxCell;
  geometry: IGeometry;
  mxObjectId: string;
  id: string;
  style: string;
  edges: ImxCell[];
  value: string;
  children: ImxCell[];
  setConnectable(isConnectable: boolean): void;
  getStyle(): string;
  setStyle(style: string): void;
  removeFromTerminal(isSource: boolean): void; // removes the edge from its source or target terminal
  getTerminal(isSource: boolean): ImxCell; // for edges
}

export interface IMxMenu {
  triggerX: number;
  triggerY: number;
  // cspell: disable-next-line
  addItem(text: string, sth: null, func: (() => void) | null, submenu?: HTMLTableRowElement): HTMLTableRowElement ;
  addSeparator(): void;
}

// tslint:disable-next-line: no-empty-interface
export interface IMxUndoableEdit {

}
// tslint:disable-next-line: no-empty-interface
export interface IMxConnectionConstraint {

}

export interface IMxUndoManager {
  undo(): void;
  redo(): void;
  undoableEditHappened(edit: IMxUndoableEdit): void;
}

export interface IMxEventObject {
  name: string;
  properties: {
    edit: {
      source: IGraphModel;
      changes: [];
    };
  };
  getProperty(property: string): IMxUndoableEdit;
}

export interface IGraphModel {
  cells: ImxCell[];
  beginUpdate(): void;
  endUpdate(): void;
  getTopmostCells(cells: ImxCell[]): ImxCell[];
  getCell(id: string): ImxCell;
  getRoot(): ImxCell;
  getChildCount(root: ImxCell): number;
  getChildren(cell: ImxCell): ImxCell;
  getValue(cell: ImxCell): string | null;
  getTerminal(edge: ImxCell, isSource: boolean): ImxCell; // returns the source or target mxCell of the given edge depending on the value of the boolean parameter
  setTerminal(edge: ImxCell, terminal: ImxCell, isSourse: boolean): void; // to current transaction
  setTerminals(edge: ImxCell, source: ImxCell, target: ImxCell): void; // in a single transaction
  setVisible(cell: ImxCell, visible: boolean): void; // to current transaction
  addListener(action: string, listener: (sender: IGraphModel, evt: IMxEventObject) => void): void;
  isVertex(cell: ImxCell): boolean;
  isEdge(cell: ImxCell): boolean;
  setValue(cell: ImxCell, value: string): void;
}

interface IMxPoint {
  x: number;
  y: number;
}

interface IGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  relative: boolean;
  offset?: number; // for edges.
  sourcePoint: IMxPoint; // the source mxPoint of the edge
  targetPoint: IMxPoint; // the target mxPoint of the edge
  points?: IMxPoint[]; // array of mxPoints which specifies the control points along the edge
  getTerminalPoint(isSource: boolean): IMxPoint;
  setTerminalPoint(point: IMxPoint, isSource: boolean): void;
}

interface IGraphView {
  scale: number;
  translate: {
    x: number;
    y: number;
  };
  getState(cell: ImxCell): IMxState | undefined;
  getTerminalPort(state: IMxState, terminal: ImxCell, isSource: boolean): IMxState;
  addListener(action: string, listener: (sender: IGraphModel, evt: IMxEventObject) => void): void;
}

export interface IMxState {
  x: number;
  y: number;
  view: IGraphView;
  shape: any;
  terminalDistance: number; // for edges
  segments: number[];
  style: ICellStyle;
  cell: ImxCell;
  cellBounds: any;// mxRectangle
  getVisibleTerminal(isSource: boolean): ImxCell;
  getVisibleTerminalState(isSource: boolean): IMxState;
  setVisibleTerminalState(terminalState: IMxState, isSource: boolean): void;
}

interface IMxSelectionModel {
  cells: ImxCell[];
  graph: IMxGraph;
}

export interface IStylesheet {
  createDefaultVertexStyle(): IStylesheet;
  putCellStyle(customName: string, customStyle: IStylesheet): void;
  /*
   * name - String of the form [(stylename|key=value);] that represents the style.
   * defaultStyle - Default style to be returned if no style can be found.
   */
  getCellStyle(name: string, defaultStyle?: IStylesheet): IStylesheet;
}

interface ICellStyle {
  shape: string;
  perimeter: string;
  points: Array<[number, number]>;
  fillColor: string; //.....
}

export interface IMxGraph {
  popupMenuHandler: {
    autoExpand: boolean;
    factoryMethod(menu: IMxMenu, cell: ImxCell | null, evt: () => {}): void;
  };
  container: HTMLDivElement;
  view: IGraphView;
  // cspell: disable-next-line
  autoscroll: boolean;
  isMouseDown: boolean;
  model: IGraphModel;
  gridSize: number;
  getModel(): IGraphModel;
  getView(): IGraphView;
  getDefaultParent(): ImxCell;
  getCellGeometry(cell: ImxCell): IGeometry;
  getCellStyle(cell: ImxCell): ICellStyle;
  getStylesheet(): IStylesheet;
  getSelectionCells(): ImxCell[];
  getSelectionCell(): ImxCell;
  getSelectionModel(): IMxSelectionModel;
  insertVertex(parent: ImxCell, id?: string | null, value?: string, x?: number, y?: number, width?: number, height?: number, style?: string, isRelative?: boolean): ImxCell;
  insertEdge(parent: ImxCell, id?: string | null, value?: string, source?: ImxCell, target?: ImxCell): IEdge;
  importCells(cells: ImxCell[], x: number, y: number, target: ImxCell): ImxCell[] | null;
  scrollCellToVisible(cells: ImxCell[]): void;
  setSelectionCells(cells: ImxCell[]): void;
  selectCell(isNext: boolean, isParent?: boolean, isChild?: boolean): void; //
  selectAll(parent: ImxCell, descendants: ImxCell[]): void; // select all children of the given parent cell
  selectCells(vertices: ImxCell[], edges: ImxCell[], parent: ImxCell): void;
  setHtmlLabels(bl: boolean): void;
  isEnabled(): boolean;
  isEditing(): boolean;
  isSelectionEmpty(): boolean;
  isCellLocked(target: ImxCell): boolean;
  removeCells(cells?: ImxCell[]): ImxCell[];
  resizeCell(cell: ImxCell, bounds: {x: number; y: number; width: number; height: number}, recurse?: boolean): void;
  moveCells(cell: ImxCell, dx: number, dy: number): void;
  cloneCells(cells: ImxCell[]): ImxCell[];
  zoomIn(): void;
  zoomOut(): void;
  // drill down
  isPort(cell: ImxCell): boolean;
  getTerminalForPort(portCell: ImxCell, isSource: boolean): ImxCell;
}
