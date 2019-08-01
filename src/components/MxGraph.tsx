import * as React from "react";

// @ts-ignore
import * as mxGraphJs from "mxgraph-js";

// import {
//   _extractGraphModelFromEvent,
//   _pasteText,
// } from "../utils/Copy";
import {
  ClipboardContext,
} from "../context/ClipboardContext";
import {
  MxGraphContext
} from "../context/MxGraphContext";
import {
  ImxCell,
  IMxGraph,
  IMxUndoManager,
  IMxEventObject,
} from "../types/mxGraph";

import {
  IMxAction, IMxActions,
} from "../types/action";

const {
  mxClient,
  mxUtils,
  mxEvent,
  mxGraphModel,
  mxGeometry,
  mxPoint,
  mxUndoManager,
  mxTransient,
  mxObjectIdentity,
} = mxGraphJs;

window.mxGeometry = mxGeometry;
window.mxGraphModel = mxGraphModel;
window.mxPoint = mxPoint;

interface IState {
  graph?: IMxGraph;
}

export class MxGraph extends React.PureComponent<{}, IState> {
  public static contextType = ClipboardContext;
  private undoManager: IMxUndoManager;
  private action: IMxActions;
  private mouseX: number;
  private mouseY: number;

  constructor(props: {}) {
    super(props);
    this.state = {
      graph: undefined,
    };
    this.mouseX = 0;
    this.mouseY = 0;
    this.action = {
      copy: {}, cut: {}, paste: {}, redo: {}, undo: {},
    };
  }

  public setGraph = (graph: IMxGraph) => {
    if (this.state.graph) {
      return;
    }
    this.initAction(graph);
    console.log(this.action);

    this.undoManager = new mxUndoManager();
    this.addUndoEvent(graph);

    this.addCopyEvent(graph);

    this.setState({
      graph,
    });
  }

  public addUndoEvent = (graph: IMxGraph) => {
    const listener = (_sender, evt: IMxEventObject) => {
      console.log(_sender);
      this.undoManager.undoableEditHappened(evt.getProperty("edit"));
    };
    graph.getModel()
      .addListener(mxEvent.UNDO, listener);
    graph.getView()
      .addListener(mxEvent.UNDO, listener);
  }

  // tslint:disable-next-line: max-func-body-length
  public addCopyEvent = (graph: IMxGraph) => { // , textInput: HTMLTextAreaElement, copy: ICopy) => {
    // tslint:disable-next-line: deprecation
    const { copy, textInput } = this.context;
    copy.gs = graph.gridSize;
    this.initTextInput(textInput);

    graph.container.onmousemove = (evt) => {
      this.mouseX = evt.offsetX;
      this.mouseY = evt.offsetY;
    };

    mxEvent.addListener(document, "keydown", (evt: KeyboardEvent) => {
      const source = mxEvent.getSource(evt);
      if (graph.isEnabled() && !graph.isMouseDown && !graph.isEditing() && source.nodeName !== "INPUT") {
        // tslint:disable-next-line: deprecation
        if (evt.keyCode === 224 /* FF */ || (!mxClient.IS_MAC && evt.keyCode === 17 /* Control */) || (mxClient.IS_MAC && evt.keyCode === 91 /* Meta */)) {
          // tslint:disable-next-line: deprecation
          this.context.beforeUsingClipboard(graph, copy, textInput);
        }
      }
    });

    mxEvent.addListener(document, "keyup", (evt: KeyboardEvent) => {
      // tslint:disable-next-line: deprecation
      if (copy.restoreFocus && (evt.keyCode === 224 || evt.keyCode === 17 || evt.keyCode === 91)) {
        // tslint:disable-next-line: deprecation
        this.context.afterUsingClipboard(graph, copy, textInput);
      }
    });

    mxEvent.addListener(textInput, "copy", mxUtils.bind(this, (_evt: ClipboardEvent) => {
      // tslint:disable-next-line: deprecation
      this.context.copyFunc(graph, copy, textInput);
    }));

    mxEvent.addListener(textInput, "cut", mxUtils.bind(this, (_evt: ClipboardEvent) => {
      // tslint:disable-next-line: deprecation
      this.context.cutFunc(graph, copy, textInput);
    }));

    mxEvent.addListener(textInput, "paste", (evt: ClipboardEvent) => {
      // tslint:disable-next-line: deprecation
      this.context.pasteFunc(evt, graph, copy, textInput, this.mouseX, this.mouseY);
    });

  }

  public componentWillMount(): void {
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
    }
  }

  public handleMouseMove = (event: React.MouseEvent) => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  public render(): React.ReactNode {

    return (
      // tslint:disable-next-line: react-a11y-event-has-role
      <div className="graph" >
        <MxGraphContext.Provider
          value={{
            graph: this.state.graph,
            setGraph: this.setGraph,
            undoManager: this.undoManager,
            action: this.action,
          }}
        >
          {this.props.children}
        </MxGraphContext.Provider>
      </div>
    );
  }

  private readonly initTextInput = (textInput: HTMLTextAreaElement) => {
    mxUtils.setOpacity(textInput, 0);
    textInput.style.width = "1px";
    textInput.style.height = "1px";
    textInput.value = " ";
  }

  private readonly initAction = (graph: IMxGraph) => {
    this.addAction("paste", () => {
      navigator.clipboard.readText()
        .then(
          // tslint:disable-next-line: promise-function-async
          (result) => {
            // tslint:disable-next-line: no-console
            console.log("Successfully retrieved text from clipboard", result);
            // tslint:disable-next-line: deprecation
             this.context.textInput.focus(); // no listener
            // // tslint:disable-next-line: deprecation
             this.context.pasteFuncForMenu(result, graph, this.context.copy, this.context.textInput, this.context.menu.triggerX, this.context.menu.triggerY);
            return Promise.resolve(result);
          }
        )
        .catch(
          (err) => {
            throw new Error("Error! read text from clipboard");
          });
    }, "Paste", "Ctrl+V");
    this.addAction("copy", () => {
      document.execCommand("copy");
    }, "..", "Ctrl+C");
  }

  private readonly addAction = (name: string, func: () => void, label: string, shortcut: string) => {
    Object.assign(this.action[name], { func, label, shortcut });
  }
}
