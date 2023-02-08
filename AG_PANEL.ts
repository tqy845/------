// ==UserScript==
// @name         爱果：学xx国
// @namespace    狗子未遂胆儿肥.
// @version      23.2.8.4
// @description  自动获取今日学xx国电脑版的积分
// @author       谭期元
// @match        https://pc.xuexi.cn/points/*
// @match        https://www.xuexi.cn/*
// @match        https://article.xuexi.cn/articles/*
// @match        https://preview-pdf.xuexi.cn/preview/*
// @icon         https://www.xuexi.cn/favicon.ico
// @grant        none
// @updateURL    http://www.tqy.pub:9000/down/enjzDgv30c13.js
// @run-at       document-end
// ==/UserScript==
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
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert",
      insertBefore?: HTMLElement,
    ): boolean;

    protected abstract mountElementToAG(mountName: string): boolean;
  }

  abstract class AStorage extends AMethods {}

  abstract class AAg<T> extends AStorage {
    protected abstract element: T | undefined;
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

    protected setElementStyle(attributes: Object = {}): boolean {
      if (
        !(this.element instanceof HTMLElement) ||
        !Object.keys(attributes).length
      )
        return false;
      for (const key in attributes) {
        // @ts-expect-error
        this.element.style[key] = attributes[key];
      }
      return true;
    }

    protected addToElement(
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert" = "top",
      insertBefore?: HTMLElement,
    ): boolean {
      if (!(this.element instanceof HTMLElement) || !mountElement) return false;
      mountElement.querySelector(`#${this.element.id}`)?.remove();
      switch (position) {
        case "top":
          mountElement.prepend(this.element);
          break;
        case "bottom":
          mountElement.append(this.element);
          break;
        case "insert":
          if (insertBefore)
            mountElement.insertBefore(this.element, insertBefore);
          else new Error("error:insertBefore cannot be empty...");
          break;
      }
      return true;
    }

    protected mountElementToAG(mountName: string): boolean {
      if (!(this.element instanceof HTMLElement) || !mountName) return false;
      const body: any = document.body;
      if (!body.AG) body.AG = {};
      body.AG[mountName] = this.element;
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
      this.element = this.getElement("div", panelName);
      this.setElementStyle({
        width: "600px",
        height: "500px",
        position: "fixed",
        zIndex: "9999",
        left: "0",
        top: "0",
        backgroundColor: "#121212",
        border: "2px solid #444444",
      });

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
        this.addToElement(document.body, "top") &&
        this.mountElementToAG("panel");

      console.log(`panel:${result ? "挂载成功" : "挂载失败"}`);
    }

    public static getInstance(panelName?: string) {
      if (panelName && !this.instance) this.instance = new PanelImpl(panelName);
      return this.instance;
    }

    public show(): void {}
  }

  let instance = PanelImpl.getInstance(`ag-panel`);
  instance.show();

  // Your code here...
})();
