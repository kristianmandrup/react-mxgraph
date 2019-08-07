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
  beginUpdate(): void;
  endUpdate(): void;
  getTopmostCells(cells: ImxCell[]): ImxCell[];
  getRoot(): ImxCell;
  getChildCount(root: ImxCell): number;
  getChildren(cell: ImxCell): ImxCell;
  addListener(action: string, listener: (sender: IGraphModel, evt: IMxEventObject) => void): void;
  isVertex(cell: ImxCell): boolean;
  isEdge(cell: ImxCell): boolean;
}

interface IGeometry {
  x: number;
  y: number;
  relative: boolean;
}

interface IView {
  scale: number;
  translate: {
    x: number;
    y: number;
  };
  getState(cell: ImxCell): IMxCellState | null;
  addListener(action: string, listener: (sender: IGraphModel, evt: IMxEventObject) => void): void;
}

interface IMxStyle {
  shape: string;
  align: string;
  startSize: string;
  endArrow: string;
  endSize: string;
  fontColor: string;
  fontStyle: string;
  rounded: boolean;
  strokeColor: string;
}

// tslint:disable-next-line: no-empty-interface
export interface IMxShape {
  apply(state: IMxCellState): void;
  redraw(): void;
}

// tslint:disable-next-line: no-empty-interface
interface IMxText extends IMxShape{

}

// tslint:disable-next-line: no-empty-interface
export interface IMxConnectionConstraint {

}

export interface IMxCellState {
  x: number;
  y: number;
  view: IView;
  cell: ImxCell;
  style: IMxStyle | null;
  shape: IMxShape;
  text: IMxText;
}

interface IMxMouseEvent{
  graphX: number;
  graphY: number;
  evt: PointerEvent;
  getState(): IMxCellState;
  getCell(): ImxCell;
  getEvent(): PointerEvent;
}

export interface IAddMouseListener {
  currentState: IMxCellState | null;
  previousStyle: IMxStyle | null;
  dragEnter(evt: PointerEvent, state: IMxCellState): void;
  dragLeave(evt: PointerEvent, state: IMxCellState): void;
  mouseDown(sender: IMxGraph, me: IMxMouseEvent): void;
  mouseUp(sender: IMxGraph, me: IMxMouseEvent): void;
  mouseMove(sender: IMxGraph, me: IMxMouseEvent): void;
}

export interface IMxGraph {
  popupMenuHandler: {
    autoExpand: boolean;
    factoryMethod(menu: IMxMenu, cell: ImxCell | null, evt: () => {}): void;
  };
  container: HTMLDivElement;
  view: IView;
  // cspell: disable-next-line
  autoscroll: boolean;
  isMouseDown: boolean;
  model: IGraphModel;
  gridSize: number;
  getModel(): IGraphModel;
  getView(): IView;
  getDefaultParent(): IParent;
  getCellGeometry(cell: ImxCell): IGeometry;
  getSelectionCells(): ImxCell[];
  getAllConnectionConstraints(state: IMxCellState, source: boolean): IMxConnectionConstraint[];
  insertVertex(parent: IParent, id?: string | null, value?: string, x?: number, y?: number, width?: number, height?: number, style?: string, relative?: string): IVertex;
  insertEdge(parent: IParent, id?: string | null, value?: string, source?: IVertex, target?: IVertex): IEdge;
  importCells(cells: ImxCell[], x: number, y: number, target: ImxCell): ImxCell[] | null;
  scrollCellToVisible(cells: ImxCell[]): void;
  setSelectionCells(cells: ImxCell[]): void;
  isEnabled(): boolean;
  isEditing(): boolean;
  isSelectionEmpty(): boolean;
  isCellLocked(target: ImxCell): boolean;
  removeCells(cells?: ImxCell[]): ImxCell[];
  moveCells(cell: ImxCell, dx: number, dy: number): void;
  cloneCells(cells: ImxCell[]): ImxCell[];
  zoomIn(): void;
  zoomOut(): void;
  fit(): void;
  zoomActual(): void;
  addMouseListener(obj: IAddMouseListener): void;
}
