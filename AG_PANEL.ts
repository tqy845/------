(function () {
  "use strict";

  interface IRequest {
    request(url: string, params: object, ...args: any): Promise<IResponse<{}>>;
  }

  interface IResponse<T> {
    code: number;
    msg: string;
    data: T;
  }

  abstract class AMethods {
    protected abstract getElement(
      tagName: string,
      tagId?: string,
      tagClass?: string,
    ): HTMLElement;

    protected abstract setElementStyle(attributes: Object): boolean;

    protected abstract addToElement(
      element: HTMLElement,
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert",
      insertBefore?: HTMLElement,
    ): boolean;

    protected abstract mountElementToAG(
      element: HTMLElement,
      mountName: string,
    ): boolean;
  }

  abstract class AStorage extends AMethods {}

  abstract class AAg<T> extends AStorage {
    protected getElement(
      tagName: string,
      tagId?: string,
      tagClass?: string,
      tagContent?: string,
      tagInnerHTML?: string,
    ): HTMLElement {
      const tag = document.createElement(tagName);
      if (tagId) tag.setAttribute("id", tagId);
      if (tagClass) tag.setAttribute("class", tagClass);
      if (tagContent) tag.textContent = tagContent;
      if (tagInnerHTML) tag.innerHTML = tagInnerHTML;
      return tag;
    }

    protected setElementStyle(
      element: HTMLElement,
      attributes: Object = {},
    ): boolean {
      if (!element || !Object.keys(attributes).length) return false;
      for (const key in attributes) {
        // @ts-expect-error
        this.element.style[key] = attributes[key];
      }
      return true;
    }

    protected addToElement(
      element: HTMLElement,
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert" = "top",
      insertBefore?: HTMLElement,
    ): boolean {
      if (!element || !mountElement) return false;
      mountElement.querySelector(`#${element.id}`)?.remove();
      switch (position) {
        case "top":
          mountElement.prepend(element);
          break;
        case "bottom":
          mountElement.append(element);
          break;
        case "insert":
          if (insertBefore) mountElement.insertBefore(element, insertBefore);
          else new Error("error:insertBefore cannot be empty...");
          break;
      }
      return true;
    }

    protected mountElementToAG(
      element: HTMLElement,
      mountName: string,
    ): boolean {
      if (!element || !mountName) return false;
      const body: any = document.body;
      if (!body.AG) body.AG = {};
      body.AG[mountName] = element;
      return true;
    }
  }

  class Ag<T> extends AAg<T> implements IRequest {
    protected element: T | undefined;
    request(url: string, params: object, ...args: any): Promise<IResponse<{}>> {
      throw new Error("Method not implemented.");
    }
  }

  abstract class AButton<T> extends Ag<T> {}

  class ButtonImpl extends AButton<HTMLElement> {
    constructor(buttonName: string) {
      super();
      this.element = this.getElement("button");
    }
  }

  abstract class APanel<T> extends Ag<T> {
    protected abstract show(): void;
  }

  class PanelImpl extends APanel<HTMLElement> {
    private static instance: PanelImpl;
    private constructor(panelName: string) {
      super();
      const panel = this.getElement("div", panelName);
      this.setElementStyle(panel, {
        width: "600px",
        height: "500px",
        position: "fixed",
        zIndex: "9999",
        left: "0",
        top: "0",
        backgroundColor: "#121212",
        border: "2px solid #434343",
      });

      const columnLeft = this.getElement("div");
      this.setElementStyle(columnLeft, {});

      const columnCenter = this.getElement("div");

      const columnRight = this.getElement("div");

      const options: Array<{ label: string; index: number }> = [
        {
          label: "前言",
          index: 0,
        },
        {
          label: "开始",
          index: 1,
        },
        {
          label: "配置",
          index: 2,
        },
        {
          label: "捐助",
          index: 3,
        },
      ];
      for (const item of options) {
        const button: ButtonImpl = new ButtonImpl(item.label);
        console.log(button);
      }

      const result: boolean =
        this.addToElement(panel, document.body, "top") &&
        this.mountElementToAG(panel, "panel");

      console.log(`panel:${result ? "挂载成功" : "挂载失败"}`);
    }

    public static getInstance(panelName?: string) {
      if (panelName && !this.instance) this.instance = new PanelImpl(panelName);
      return this.instance;
    }

    public show(): void {}
  }

  PanelImpl.getInstance(`ag-panel`).show();
})();
