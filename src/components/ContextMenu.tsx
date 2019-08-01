// @ts-ignore
import * as mxGraphJs from "mxgraph-js";
import * as React from "react";

const {
  mxEvent,
  mxUtils,
  mxPopupMenuHandler,
} = mxGraphJs;

import {
  IMxGraphContext,
  MxGraphContext,
} from "../context/MxGraphContext";

import {
  MenuContext,
} from "../context/MenuContext";

import {
  ClipboardContext,
  IClipboardContext,
} from "../context/ClipboardContext";

import {
  IMenu,
  IMenus,
} from "../types/menu";

import {
  ImxCell,
  IMxGraph,
  IMxMenu,
} from "../types/mxGraph";

export class ContextMenu extends React.PureComponent {
  public static contextType = ClipboardContext;
  public menus: IMenus;
  public undoManager: any;

  constructor(props: {}) {
    super(props);
    this.menus =  {
      vertex: [],
      edge: [],
      canvas: []
    };
  }

  public render(): React.ReactNode {
    // tslint:disable-next-line: deprecation
    const { copy, textInput } = this.context;

    return (
      <MenuContext.Provider value={{setMenu: this.setMenu}}>
        {this.props.children}
        <MxGraphContext.Consumer>{(value: IMxGraphContext) => {
          const {
            graph,
            undoManager,
            action,
          } = value;
          console.log(action);
          mxEvent.disableContextMenu(document.body);

          if (graph) {
            this.undoManager = undoManager;
            graph.popupMenuHandler.autoExpand = true;
            graph.popupMenuHandler.factoryMethod = (menu, cell, _evt) => {
              const currentMenu: IMenu[] = this._getMenuFromCell(cell);
              if (currentMenu.length !== 0) {

                currentMenu.map((item) => {
                  const text = item.text ? item.text : "default";
                  // tslint:disable-next-line: prefer-switch
                  if (item.menuItemType === "separator") {
                    menu.addSeparator();
                  } else {
                    let func = this._getFuncFromType(item.menuItemType, graph, copy, textInput, menu);
                    if (item.menuItemType === "paste" || item.menuItemType === "copy") {
                      console.log(action);
                      func = action[item.menuItemType].func;
                      if(item.menuItemType === "paste") {
                        console.log(func);

                      }
                      console.log(func);
                    } 
                    const menuItem = menu.addItem(text, null, func);
                    // tslint:disable-next-line: prefer-switch
                    if (item.menuItemType === "copy" || item.menuItemType === "cut") {
                      this.addListener(menuItem, graph, copy, textInput);
                      const td = menuItem.firstChild.nextSibling.nextSibling;
                      const span = document.createElement('span');
                      span.style.color = 'gray';
                      mxUtils.write(span, "Ctrl + C");
                      td.appendChild(span);
                    }
                  }

                });

              } else {
                throw new Error("Menu is empty!Init menu failed");
              }
            };
          }
          return null;
        }}
        </MxGraphContext.Consumer>
      </MenuContext.Provider>
    );
  }
  private readonly addListener = (targetMenuItem: HTMLTableRowElement, graph: IMxGraph, copy: ICopy, textInput: HTMLTextAreaElement): void => {
    mxEvent.addListener(targetMenuItem, "pointerdown", (evt: PointerEvent) => {
      // tslint:disable-next-line: deprecation
      const source = mxEvent.getSource(evt);
      if (graph.isEnabled() && !graph.isEditing() && source.nodeName !== "INPUT") {
        // tslint:disable-next-line: deprecation
        this.context.beforeUsingClipboard(graph, copy, textInput);
      }
    });
    mxEvent.addListener(targetMenuItem, "pointerup", (_evt: PointerEvent) => {
      // tslint:disable-next-line: deprecation
      this.context.afterUsingClipboard(graph, copy, textInput);
    });
  }

  private readonly _getFuncFromType = (menuItemType: string, graph: IMxGraph, copy: ICopy, textInput: HTMLTextAreaElement, menu: IMxMenu) => {
    // tslint:disable-next-line: no-empty
    let func = () => { };
    // tslint:disable-next-line: prefer-switch
    switch (menuItemType) {
      case "paste":
        func = () => {
          navigator.clipboard.readText()
          .then(
            // tslint:disable-next-line: promise-function-async
            (result) => {
              // tslint:disable-next-line: no-console
              console.log("Successfully retrieved text from clipboard", result);
              textInput.focus(); // no listener
              // tslint:disable-next-line: deprecation
              this.context.pasteFuncForMenu(result, graph, copy, textInput, menu.triggerX, menu.triggerY);
              return Promise.resolve(result);
            }
          )
          .catch(
            (err) => {
              throw new Error("Error! read text from clipboard");
            });
        };
        break;
      case "copy":
        func = () => {
          document.execCommand("copy");
        };
        break;
      case "cut":
        func = () => {
          document.execCommand("cut");
        };
        break;
      case "undo":
        func = () => {
          this.undoManager.undo();
        };
        break;
      case "redo":
        func = () => {
          this.undoManager.redo();
        };
        break;
      case "zoomIn":
        func = () => {
          graph.zoomIn();
        };
        break;
      case "zoomOut" :
        func = () => {
          graph.zoomOut();
        };
        break;
      default:
        throw new Error("Unknown menu item type");
    }
    return func;
  }

  private readonly _getMenuFromCell = (cell: ImxCell | null) => {
    let name = "item";
    if (cell === null) {
      name = "canvas";
    }
    else if (cell.vertex) {
      name = "vertex";
    }
    else if (cell.edge) {
      name = "edge";
    }
    return this.menus[name];
  }

  private readonly setMenu = (name: string, menu: IMenu[]): void => {
    Object.assign(this.menus[name], menu);
  }

}
