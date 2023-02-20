// ==UserScript==
// @name         爱果面板TS重制版
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://pc.xuexi.cn/points/my-points.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xuexi.cn
// @grant        none
// ==/UserScript==

(() => {
  "use strict";
  // 爱果接口
  interface IResponse<T> {
    code: number;
    msg: string;
    data: T;
  }

  interface IRequest<T> {
    request(url: string, type: string, data: object): Promise<IResponse<T>>;
  }

  class AGRequest<T> implements IRequest<T> {
    private static instance: AGRequest<any>;
    private constructor() {}

    static getInstance<R>() {
      if (!AGRequest.instance) AGRequest.instance = new AGRequest<R>();
      return AGRequest.instance;
    }

    async request(
      url: string,
      type: string,
      data: object,
    ): Promise<IResponse<T>> {
      const body: RequestInit = {
        method: type,
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      };
      if (type.toUpperCase() !== "GET") {
        body.body = JSON.stringify(data);
      }
      try {
        const response = await fetch(`xxx/AG${url}`, body);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resData = await response.json();
        if (!resData || typeof resData !== "object") {
          throw new Error("Unexpected response data format");
        }
        const data: IResponse<T> = resData as IResponse<T>;
        return data;
      } catch (error) {
        console.error(error);
        return { code: -1, msg: "", data: {} } as IResponse<T>;
      }
    }
  }

  // 爱果存储
  interface IAGStorage {
    set(key: string, value: string | object, type: "local" | "session"): void;
    get(
      key: string,
      type: "local" | "session",
      parse: true | false,
    ): string | object | null;

    increase(key: string, type: "local" | "session"): number;

    remove(key: string, type: "local" | "session"): void;

    clear(): void;
  }

  class AGStorage implements IAGStorage {
    private static storage: AGStorage;
    private static PREFIX = "AG_STORAGE_";
    private constructor() {}

    static getInstance() {
      if (!AGStorage.storage) AGStorage.storage = new AGStorage();
      return AGStorage.storage;
    }

    set(
      key: string,
      value: number | string | object,
      type: "local" | "session" = "local",
    ): void {
      key = AGStorage.PREFIX.concat(key.toUpperCase());
      if (value instanceof Object && value !== null)
        value = JSON.stringify(value);
      type === "local"
        ? localStorage.setItem(key, String(value))
        : sessionStorage.setItem(key, String(value));
    }

    get(
      key: string,
      type: "local" | "session" = "local",
      parse: boolean = false,
    ): string | object | null {
      key = AGStorage.PREFIX.concat(key.toUpperCase());
      const result =
        type === "local"
          ? localStorage.getItem(key)
          : sessionStorage.getItem(key);
      return parse && result ? JSON.parse(result) : result;
    }
    increase(key: string, type: "local" | "session"): number {
      const value = Number(this.get(key));
      if (isNaN(value)) throw new Error("error:非数字不可自增");
      this.set(key, value + 1, type);
      return Number(this.get(key));
    }
    remove(key: string, type: "local" | "session"): void {
      key = AGStorage.PREFIX.concat(key.toUpperCase());
      type === "local"
        ? localStorage.removeItem(key)
        : sessionStorage.removeItem(key);
    }
    clear(): void {
      const handler = (instance: Storage) => {
        Object.keys(instance).forEach((item) => {
          if (item.startsWith(AGStorage.PREFIX)) {
            instance.removeItem(item);
          }
        });
      };
      handler(localStorage);
      handler(sessionStorage);
    }
  }

  // 爱果元素
  abstract class AAGElement {
    protected abstract setStyle(
      attributes: { [key: string]: string },
      important: "important" | undefined,
    ): boolean;

    protected abstract setText(text: string): void;

    protected abstract setAttr(
      key: string,
      value: boolean | string | number,
    ): void;

    protected abstract getStyle(...attributes: Array<string>): {
      [key: string]: string;
    };
    protected abstract getAttr(key: string): string;

    protected abstract elementMountTo(
      mountElement: AGElement | HTMLElement,
      append: boolean,
      position: "top" | "bottom" | "insert",
      insertBefore?: HTMLElement | AGElement,
    ): boolean;

    protected abstract toHTMLElement(): HTMLElement;
  }

  class AGElement extends AAGElement {
    private element: HTMLElement;

    constructor(
      tagOrSelector: HTMLElement | string,
      tagClass?: string,
      tagId?: string,
      tagAttributes?: { [key: string]: string },
    ) {
      super();
      let element: HTMLElement | null = null;
      if (tagOrSelector instanceof HTMLElement) {
        element = tagOrSelector;
      } else if (typeof tagOrSelector === "string") {
        if (
          tagOrSelector.startsWith(".") ||
          tagOrSelector.startsWith("#") ||
          (tagOrSelector.startsWith("[") && tagOrSelector.endsWith("]"))
        )
          element = document.querySelector(tagOrSelector);
        else element = document.createElement(tagOrSelector);
      }
      this.element = element as HTMLElement;
      if (tagClass) this.element.setAttribute("class", tagClass);
      if (tagId) this.element.setAttribute("id", tagId);
      if (tagAttributes) {
        for (const key in tagAttributes) {
          if (tagAttributes.hasOwnProperty(key)) {
            this.element.setAttribute(key, tagAttributes[key]);
          }
        }
      }
    }

    setAttr(key: string, value: boolean | string | number): void {
      this.element.setAttribute(key, String(value));
    }

    setStyle(
      attributes: { [key: string]: string },
      important: "important" | undefined = "important",
    ): boolean {
      const keys = Object.keys(attributes);
      if (!keys.length) return false;
      for (const key of keys) {
        if (key in this.element.style) {
          this.element.style.setProperty(
            key.replace(/([A-Z])/g, "-$1").toLowerCase(),
            attributes[key],
            important,
          );
        }
      }
      return true;
    }

    setText(text: string): void {
      this.element.innerHTML = text;
    }

    getStyle(...attributes: Array<string>): { [key: string]: string } {
      if (!attributes.length) return {};
      const result: { [key: string]: string } = {};
      const elementStyle = window.getComputedStyle(this.element, null);
      for (const key of attributes) {
        switch (key) {
          case "innerHTML":
            result[key] = this.element.innerHTML;
            break;
          case "textContent":
            result[key] = this.element.textContent || "";
            break;
          case "innerText":
            result[key] = this.element.innerText;
            break;
          default:
            const camelKey = key.replace(/-([a-z])/g, (match, letter) => {
              return letter.toUpperCase();
            });
            if (Object.prototype.hasOwnProperty.call(elementStyle, camelKey)) {
              result[camelKey] = elementStyle.getPropertyValue(key);
            }
        }
      }
      return result;
    }

    getAttr(key: string) {
      return this.element.getAttribute(key) as string;
    }

    elementMountTo(
      mountElement: HTMLElement | AGElement,
      append: boolean = false,
      position: "top" | "bottom" | "insert" = "bottom",
      insertBefore?: HTMLElement | AGElement,
    ): boolean {
      if (!mountElement) return false;
      if (mountElement instanceof AGElement)
        mountElement = mountElement.element;
      if (insertBefore && insertBefore instanceof AGElement)
        insertBefore = insertBefore.element;
      if (!append) {
        let selector = "";
        if (this.element.id) selector = `#${this.element.id}`;
        if (this.element.className) {
          selector = this.element.className
            .split(" ")
            .map((className) => `.${className}`)
            .join("");
        }
        if (selector)
          document.querySelectorAll(selector).forEach((item) => item.remove());
      }
      switch (position) {
        case "top":
          mountElement.prepend(this.element);
          break;
        case "bottom":
          mountElement.append(this.element);
          break;
        case "insert":
          if (insertBefore) {
            mountElement.insertBefore(this.element, insertBefore);
          } else new Error("error:insertBefore cannot be empty...");
          break;
      }
      return true;
    }

    toHTMLElement() {
      return this.element;
    }

    static elementsMountTo(
      elements: Array<AGElement | HTMLElement>,
      mountElement: AGElement | HTMLElement,
      position: "top" | "bottom" | "insert" = "bottom",
      insertBefore?: HTMLElement | AGElement,
    ): boolean {
      if (!mountElement || !elements) return false;
      elements.forEach((element) => {
        if (element instanceof AGElement) element = element.element;
        if (mountElement instanceof AGElement)
          mountElement = mountElement.element;
        if (insertBefore && insertBefore instanceof AGElement)
          insertBefore = insertBefore.element;
        switch (position) {
          case "top":
            mountElement.prepend(element);
            break;
          case "bottom":
            mountElement.append(element);
            break;
          case "insert":
            if (insertBefore) {
              mountElement.insertBefore(element, insertBefore);
            } else {
              throw new Error("error:insertBefore cannot be empty...");
            }
            break;
        }
      });

      return true;
    }

    static setStyles(
      elements: Array<AGElement | HTMLElement>,
      attributes: { [key: string]: string },
      important: "important" | undefined = "important",
    ) {
      const keys = Object.keys(attributes);
      if (!keys.length) return false;
      elements.forEach((element) => {
        if (element instanceof AGElement) element = element.element;
        for (const key of keys) {
          if (key in element.style) {
            element.style.setProperty(
              key.replace(/([A-Z])/g, "-$1").toLowerCase(),
              attributes[key],
              important,
            );
          }
        }
      });

      return true;
    }
  }

  // 爱果方法
  abstract class AAGMethods {
    protected abstract handlerAGError(): void;
    protected abstract registerAGMessageListenerHandler(
      callback: (e: MessageEvent<any>) => {},
    ): void;
    protected abstract sendMessageToAGMessageListenerHandler(
      message: string,
    ): void;

    protected abstract scrollElementIntoView(element: HTMLElement): void;
    protected abstract waitForElement(selector: string): void;
  }

  abstract class AGMethods extends AAGMethods {
    protected handlerAGError(): void {
      window.addEventListener("error", (event: ErrorEvent) => {
        console.error(event.error);
      });

      window.addEventListener("unhandledrejection", (event) => {
        console.error(event.reason);
      });
    }

    protected registerAGMessageListenerHandler(
      callback: (e: MessageEvent<any>) => {},
    ): void {
      window.addEventListener(
        "message",
        (e: MessageEvent<any>) => callback(e),
        false,
      );
    }

    protected sendMessageToAGMessageListenerHandler(message: string): void {
      window.parent.postMessage(message, "*");
    }

    protected scrollElementIntoView(element: HTMLElement) {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const scrollY = elementTop - viewportHeight / 2 + rect.height / 2;
      window.scrollTo(0, scrollY);
    }

    protected waitForElement(selector: string) {
      return new Promise((resolve) => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
              if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(true);
              }
            }
          });
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    }
  }

  // 爱果组件
  abstract class AAGComponent {}

  class AGComponent extends AAGComponent {
    static Form = class Form {
      private form: AGElement;
      private inputs: { [key: string]: AGElement } = {};

      constructor() {
        this.form = new AGElement("form", "ag-form");
      }

      public addInput(
        type: string,
        labelText?: string,
        value?: string | number,
        name?: string,
        id?: string,
        checkboxLabelText?: string,
      ): boolean {
        const input = new AGElement("input");
        input.setAttr("type", type);
        input.setAttr("value", value ? value.toString() : "");
        if (id) input.setAttr("id", id);
        if (name) input.setAttr("name", name);
        this.inputs[
          labelText || id || `input-${Object.keys(this.inputs).length}`
        ] = input;

        const line = new AGElement("div", "form-line");

        const label = new AGElement("label");
        label.setText(labelText || "");
        label.elementMountTo(line);
        input.elementMountTo(line);

        if (checkboxLabelText) {
          const checkbox = new AGElement("input");
          checkbox.setAttr("type", "checkbox");
          const checkboxLabel = new AGElement("label");
          checkboxLabel.setText(checkboxLabelText);
          const checkboxContainer = new AGElement("div");
          checkbox.elementMountTo(checkboxContainer);
          checkboxLabel.elementMountTo(checkboxContainer);
          checkboxContainer.elementMountTo(line);
        }

        line.elementMountTo(this.form);
        return true;
      }

      public getInputsData(): {
        [key: string]: { value: string; checkbox: boolean };
      } {
        const result: {
          [key: string]: { value: string; checkbox: boolean };
        } = {};
        Object.keys(this.inputs).forEach((key) => {
          const ele = this.inputs[key].toHTMLElement() as HTMLInputElement;
          const checkboxEle = ele.nextElementSibling
            ?.firstChild as HTMLInputElement;
          result[key] = {
            value: ele.value,
            checkbox: checkboxEle ? checkboxEle?.checked : false,
          };
        });
        return result;
      }

      public getInstance() {
        return this.form;
      }
    };

    static Table = class Table {
      private table: AGElement;
      private headers: Array<string> = [];
      private rows: Array<Array<string | AGElement | HTMLInputElement>> = [];
      constructor() {
        this.table = new AGElement("table", "ag-table");
      }

      public addHeader(...header: Array<string>) {
        this.headers = header;
        const headerRow = new AGElement("tr");
        header.forEach((headerText) => {
          const headerCell = new AGElement("th");
          headerCell.setText(headerText);
          headerCell.elementMountTo(headerRow);
        });
        headerRow.elementMountTo(this.table);
      }

      public addRow(...row: Array<string | AGElement | HTMLInputElement>) {
        this.rows.push(row);
        const rowElement = new AGElement("tr");
        row.forEach((cellItem) => {
          const cell = new AGElement("td");
          if (cellItem instanceof HTMLInputElement)
            new AGElement(cellItem).elementMountTo(cell);
          else if (cellItem instanceof AGElement) cellItem.elementMountTo(cell);
          else cell.setText(cellItem);
          cell.elementMountTo(rowElement);
        });
        rowElement.elementMountTo(this.table);
      }
      getInputsData() {
        const inputsData: { [key: string]: boolean } = {};

        // 遍历每个行
        for (let i = 0; i < this.rows.length; i++) {
          // 从 1 开始以跳过标题行
          const row = this.rows[i];
          const label = row[0] as string;
          const checkbox =
            row[1] instanceof AGElement
              ? (row[1].toHTMLElement() as HTMLInputElement).checked
              : false;
          inputsData[label] = checkbox;
        }

        return inputsData;
      }

      public getInstance() {
        return this.table;
      }
    };
  }

  // 爱果样式
  abstract class AAGStyles {
    protected abstract mount(): void;
  }

  class AGStyles extends AAGStyles {
    private AGStyles: string = `
        li.ag-options[ag-active="true"] { color:orange;  }
        li.ag-options:hover { color:orange; }
        li.ag-options { color:#999999; }
        .ag-row-margin-10 { margin:10px 0;}

        .ag-form {
          display: flex;
          flex-wrap:wrap;
        }

        .ag-form .form-line{
          margin:8px 5px;
          height:30px;
        }

        .ag-form .form-line div{
          position:relative;
          top:-25px;
          left:130px;
          width:60px;
          line-height:16px;
        }

        .ag-form .form-line div input{
          height:15px;
          width:15px;
        }

        .ag-form label {
          padding:0 3px;
        }

        .ag-form input {
          height:30px;
          border: 1px solid orange;
          border-radius: 5px;
          background:rgba(255, 0, 0, 0) !important;
          width:150px;
        }

        .ag-table{
          width:100%;
          text-align:center;
        }

        `;
    private element: AGElement;

    constructor() {
      super();
      const style = new AGElement("style", "ag-style");
      style.setText(this.AGStyles);
      this.element = style;
    }

    mount() {
      this.element.elementMountTo(document.head);
    }
  }

  // 爱果用户
  abstract class AUser {
    protected abstract uid: string;
    protected abstract nick: string;
    protected abstract address: string;
    protected abstract password: string;
  }

  class User extends AUser {
    uid: string;
    nick: string;
    address: string;
    password: string;
    kami: string;

    constructor(params: any) {
      super();
      const init = {
        uid: "",
        nick: "未登录",
        address: "",
        password: "",
        kami: "0/0",
      };
      const { uid, nick, address, password, kami } = params || init;
      this.uid = uid || init.uid;
      this.nick = nick || init.nick;
      this.address = address || init.address;
      this.password = password || init.password;
      this.kami = kami || init.kami;
    }

    static isUser(params: object | null | string): boolean {
      if (!(params instanceof Object)) return false;
      const keys = Object.keys(params);
      if (
        keys.length != 4 ||
        !keys.includes("uid") ||
        !keys.includes("nick") ||
        !keys.includes("address") ||
        !keys.includes("password")
      )
        return false;
      return true;
    }

    static coverText(
      text: string | number,
      leftShow: number,
      rightShow: number,
    ) {
      const str = String(text);
      const result = `${str.substring(0, leftShow)}...${str.substring(
        str.length - rightShow,
        str.length,
      )}`;
      return result;
    }
  }

  // 爱果面板
  abstract class APanel extends AGMethods {
    protected abstract AGStyles: string;
    protected abstract AGStorage: AGStorage;
    protected abstract mount(): void;
    protected abstract setStatusBarText(text: string): void;
    protected abstract appendMessage(message: string): void;
  }

  class PanelImpl extends APanel {
    private static instance: PanelImpl;
    protected AGStyles: string = "";
    protected AGStorage: AGStorage = AGStorage.getInstance();
    private panel: AGElement;
    private draw: AGElement;
    private statusBar: AGElement;
    private user: User;
    private constructor(panelName: string) {
      super();

      // 初始化爱果全局异常监听事件
      // this.handlerAGError();

      // 初始化爱果全局样式
      new AGStyles().mount();

      // 初始化爱果用户信息
      this.user = new User(this.AGStorage.get("user", "local", true));

      // 初始化爱果面板
      const panel = new AGElement("panel", panelName);
      panel.setStyle({
        fontSize: "15px",
        width: "25px",
        height: "450px",
        position: "fixed",
        zIndex: "9999",
        left: "0",
        top: "0",
        backgroundColor: "#121212",
        border: "1px solid #434343",
        transition: "width 0.5s ease",
        display: "flex",
        color: "#999999",
        borderRadius: "0 5px 5px 0",
      });
      this.panel = panel;

      // 初始化画板
      this.draw = new AGElement("div");

      // 初始化状态栏
      this.statusBar = new AGElement("div", "ag-draw");

      // 菜单列表
      const options: Array<{ label: string; event: Function }> = [
        {
          label: "前言",
          event: () => {
            console.log("前言 begin");
            const ulItem = new AGElement("ul", "ag-draw");
            ulItem.setStyle({
              paddingLeft: "20px",
              cursor: "default",
              overflowX: "hidden",
              margin: "0",
            });
            const messages = [
              {
                textContent:
                  "本工具为个人制作，仅供交流学习使用，请不要用于商业传播，否则后果自负！使用本工具即代表您同意本条款。",
                color: "",
                backgroundColor: "",
              },
              {
                textContent:
                  "工具的初衷是为了让使用者释放双手，解决方案并未包含入侵的攻击和技术，仅模拟人工打开相应的任务进行操作，对程序本身不会造成任何影响，如果对平台技术层面有影响请转告我们。",
                color: "",
                backgroundColor: "",
              },
              {
                textContent:
                  "使用者在使用本软件前已经得知可能涉嫌《非法入侵计算机信息系统罪》，但滥用本软件造成的—切后果自行承担!",
                color: "",
                backgroundColor: "",
              },
              {
                textContent:
                  "使用方法：点击【开始任务】即可自动完成电脑端每日任务（除【登录】任务），期间可以切到后台，但不要最小化，中断后可以点击【开始/继续任务】即可继续任务。",
                color: "white",
                backgroundColor: "orange",
              },
            ];
            for (const item of messages) {
              const liItem = new AGElement("li");
              const { textContent, color, backgroundColor } = item;
              liItem.setText(textContent);
              liItem.setStyle({
                color,
                backgroundColor,
                margin: "5px 0",
              });
              liItem.elementMountTo(ulItem);
            }
            ulItem.elementMountTo(this.draw);
            console.log("前言 end");
          },
        },
        {
          label: "开始",
          event: () => {
            console.log("开始...");
            const divStatusBar = this.statusBar;
            this.statusBar.setStyle({
              height: "30px",
              lineHeight: "30px",
            });
            this.setStatusBarText("未开始");

            const ulItem = new AGElement("ul", "ag-draw");
            ulItem.setStyle({
              fontSize: "15px",
              cursor: "default",
              overflowX: "hidden",
              color: "orange",
              margin: "0",
              marginBottom: "15px",
              height: "332px",
              backgroundColor: "#1e1e1e",
              borderRadius: "10px",
              display: "inline-table",
              listStyleType: "decimal",
              paddingLeft: "25px",
            });

            this.appendMessage(`已准备就绪...`);

            const buttonItem = new AGElement("button", "ag-draw");
            buttonItem.setText("开始任务");
            buttonItem.setStyle({
              backgroundColor: "#e22b2b00",
              color: "orange",
              border: "1px solid orange",
              borderRadius: "10px",
              height: "28px",
              fontSize: "14px",
              margin: "0 auto",
              padding: "0 70px",
              width: "auto",
              cursor: "pointer",
            });
            buttonItem.toHTMLElement().onclick = () => {
              console.log("点击..");
            };

            divStatusBar.elementMountTo(this.draw);

            ulItem.elementMountTo(this.draw, true);

            buttonItem.elementMountTo(this.draw, true);
          },
        },
        {
          label: "配置",
          event: () => {
            console.log("配置　begin");

            const divRowOne = new AGElement("div", "ag-draw");

            const formSettings = new AGComponent.Form();
            formSettings.addInput("text", "地址");
            formSettings.addInput("password", "卡密");
            formSettings.addInput(
              "password",
              "题库",
              undefined,
              undefined,
              "启用",
            );
            formSettings.getInstance().elementMountTo(divRowOne);

            this.splitLine(divRowOne);

            const tableSettings = new AGComponent.Table();
            tableSettings.addHeader("任务", "启用");

            tableSettings.getInstance().elementMountTo(divRowOne);

            const tasks: Array<{
              name: string;
              event: Function;
              element: undefined | HTMLInputElement;
            }> = [
              {
                name: "每日答题",
                event: () => {},
                element: undefined,
              },
              {
                name: "专项答题",
                event: () => {},
                element: undefined,
              },
              {
                name: "每周答题",
                event: () => {},
                element: undefined,
              },
              {
                name: "视听学习/时长",
                event: () => {},
                element: undefined,
              },
              {
                name: "我要选读文章",
                event: () => {},
                element: undefined,
              },
            ];
            const localTableSettings: any = this.AGStorage.get(
              "table_settings",
              "local",
              true,
            );
            tasks.forEach((item) => {
              const { name } = item;
              const checkbox = new AGElement("input");
              checkbox.setAttr("type", "checkbox");
              if (
                localTableSettings &&
                typeof localTableSettings === "object"
              ) {
                (checkbox.toHTMLElement() as HTMLInputElement).checked =
                  localTableSettings[name];
              }
              tableSettings.addRow(name, checkbox);
            });

            divRowOne.elementMountTo(this.draw);
            this.splitLine(this.draw);

            const divRowTwo = new AGElement("div", "ag-draw ag-row-margin-10");
            divRowTwo.setStyle({
              display: "flex",
              justifyContent: "space-evenly",
            });
            const buttonVerification = new AGElement("button");
            buttonVerification.setText("验证");
            buttonVerification.setStyle({
              backgroundColor: "#e22b2b00",
              color: "rgb(0 201 0)",
              border: "1px solid rgb(0 201 0)",
              borderRadius: "10px",
              height: "28px",
              fontSize: "14px",
              width: "100px",
              cursor: "pointer",
            });
            buttonVerification.toHTMLElement().onclick = () => {
              console.log("验证配置");
            };

            const buttonSave = new AGElement("button");
            buttonSave.setText("保存");
            buttonSave.setStyle({
              backgroundColor: "#e22b2b00",
              color: "orange",
              border: "1px solid orange",
              borderRadius: "10px",
              height: "28px",
              fontSize: "14px",
              width: "100px",
              cursor: "pointer",
            });
            buttonSave.toHTMLElement().onclick = () => {
              console.log("保存配置");
              console.log(formSettings.getInputsData());
              console.log(tableSettings.getInputsData());
              this.AGStorage.set("form_settings", formSettings.getInputsData());
              this.AGStorage.set(
                "table_settings",
                tableSettings.getInputsData(),
              );
            };

            buttonVerification.elementMountTo(divRowTwo);
            buttonSave.elementMountTo(divRowTwo);
            divRowTwo.elementMountTo(this.draw, true);

            console.log("配置　end");
          },
        },
        {
          label: "捐助",
          event: () => {
            console.log("捐助 begin");
            const ulItem = new AGElement("ul", "ag-draw");
            ulItem.setStyle({
              paddingLeft: "20px",
              cursor: "default",
              overflowX: "hidden",
              margin: "0",
            });
            const messages = [
              {
                textContent: `基于TS重制的爱果面板开源了，喜欢代码或者对这块感兴趣的可以自己去看，Github地址：<a href='https://github.com/tqy845/AG_Currency'>https://github.com/tqy845/AG_Currency</a>`,
                color: "",
                backgroundColor: "",
              },
              {
                textContent: `教程/资源（Ｂ站）：<a href='https://space.bilibili.com/421403163'>全栈在学谭同学</a>`,
                color: "",
                backgroundColor: "",
              },
              {
                textContent: `教程/资源（抖音）：<a href='https://www.douyin.com/user/MS4wLjABAAAAy6urBE8O_sJ_DSMS_QR7Uu-Oxdb0LbaAH88UAGFB0dlfY2kbymHlUpj5vi88Rhys'>全栈在学谭同学</a>`,
                color: "",
                backgroundColor: "",
              },
              {
                textContent: `作品：<a href='https://qm.qq.com/cgi-bin/qm/qr?k=k1CvaaHVA96aedx5Ied0MdfEHBEG1Jx1&jump_from=webapi&authKey=yIYZHJNp9SdDb5FReSkLibAmYn5aX+3gyK/yeyABc0F+UXt/vMZiJm1VxTZu5zcn'>私有云/助农电商/学X通/智X树/学XX国</a>`,
                color: "",
                backgroundColor: "",
              },
            ];
            for (const item of messages) {
              const liItem = new AGElement("li");
              const { textContent, color, backgroundColor } = item;
              liItem.setText(textContent);
              liItem.setStyle({
                color,
                backgroundColor,
                margin: "5px 0",
              });
              liItem.elementMountTo(ulItem);
            }
            ulItem.elementMountTo(this.draw);

            this.splitLine(this.draw);

            const divDonation = new AGElement("div");
            divDonation.elementMountTo(this.draw, true);

            const divItem = new AGElement("div", "ag-draw ag-row-margin-10");
            divItem.setStyle({
              display: "flex",
              justifyContent: "space-evenly",
            });
            const imgArr = [
              {
                name: `微信`,
                src: "https://i.328888.xyz/2023/01/30/8UXlo.png",
                color: `#05C160`,
              },
              {
                name: `支付宝`,
                src: "https://i.328888.xyz/2023/01/30/8UpYA.png",
                color: `#1777FF`,
              },
            ];

            for (const item of imgArr) {
              const button = new AGElement("button");
              button.setText(item.name);
              button.setStyle({
                background: item.color,
                borderRadius: "5px",
                border: "1px solid white",
                color: "white",
                height: "25px",
                lineHeight: "23px",
                cursor: "pointer",
              });
              button.toHTMLElement().onclick = () => {
                const divDonationItem = new AGElement(
                  "div",
                  "ag-draw donation",
                );
                divDonationItem.setStyle({
                  display: "inline-flex",
                });
                const spanMessage = new AGElement("span");
                spanMessage.setText(
                  "插件本身免费，但是你不会介意捐助我一杯咖啡or奶茶的吧？捐助的时候记得备注联系方式或邮箱，卡密会在我收到捐助后第一时间给你。对了，不同的捐助会有区别对待（额外的奖励等），包括但不限于本插件。",
                );
                spanMessage.setStyle({
                  backgroundColor: "orange",
                  color: "white",
                });
                const imgPhoto = new AGElement("img");
                imgPhoto.setAttr("src", item.src);
                imgPhoto.setStyle({
                  width: "50%",
                  height: "50%",
                });
                spanMessage.elementMountTo(divDonationItem);
                imgPhoto.elementMountTo(divDonationItem);
                divDonationItem.elementMountTo(divDonation);
              };
              button.elementMountTo(divItem);
            }

            divItem.elementMountTo(this.draw, true);
            console.log("捐助 end");
          },
        },
      ];

      // 左列
      const columnLeft = new AGElement("div");
      columnLeft.setStyle({
        backgroundColor: "#292929",
        width: "150px",
        height: "100%",
        display: "none",
      });

      {
        const rowOne = new AGElement("div");
        rowOne.setStyle({
          height: "30px",
        });

        const rowTwo = new AGElement("div");
        rowTwo.setStyle({
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

        const rowTowItem = new AGElement("span");
        console.log(this.user);
        rowTowItem.setText(this.user.nick);
        rowTowItem.setStyle({
          height: "80px",
          width: "80px",
          backgroundColor: "#121212",
          borderRadius: "100%",
          display: "block",
          lineHeight: "80px",
          textAlign: "center",
          overflowY: "hidden",
          fontSize: "20px",
          cursor: "default",
        });
        rowTowItem.elementMountTo(rowTwo);

        const rowThree = new AGElement("div");
        rowThree.setText(User.coverText(this.user.uid, 3, 3));
        rowThree.setStyle({
          height: "20px",
          lineHeight: "20px",
          color: "#bfbfbf",
          textAlign: "center",
          margin: "5px 0",
          fontSize: "18px",
          cursor: "default",
        });

        const rowFour = new AGElement("div");
        rowFour.setText(
          `卡密次数: ${this.user.kami} <span style='color:#2579cd;cursor:pointer'>说明</span>`,
        );
        rowFour.setStyle({
          height: "20px",
          lineHeight: "20px",
          textAlign: "center",
          margin: "5px 0",
          fontSize: "13px",
          marginTop: "10px",
          cursor: "default",
        });
        AGElement.elementsMountTo(
          [rowOne, rowTwo, rowThree, rowFour],
          columnLeft,
        );
        const menu = new AGElement("ul");
        menu.setStyle({
          listStyleType: "none",
          letterSpacing: "10px",
          paddingLeft: "0",
          textAlign: "center",
          marginTop: "20px",
        });
        menu.elementMountTo(columnLeft);

        const agOptionsActive = this.AGStorage.get("options_active");
        for (const item of options) {
          const li = new AGElement("li", `ag-options`);
          li.toHTMLElement().setAttribute("ag-title", item.label);
          li.setText(item.label);
          li.setStyle({
            cursor: "pointer",
            height: "40px",
            lineHeight: "40px",
            fontSize: "16px",
          });
          li.toHTMLElement().onclick = () => {
            item.event();
            const ele = document.querySelector("[ag-active=true]");
            if (ele && ele instanceof HTMLElement) {
              new AGElement(ele).setAttr("ag-active", false);
            }
            li.setAttr("ag-active", "true");
            const agTitle = li.getAttr("ag-title");
            if (agTitle) this.AGStorage.set("options_active", agTitle);
          };
          if (item.label == agOptionsActive) {
            setTimeout(() => li.toHTMLElement().click(), 0);
          }
          li.elementMountTo(menu);
        }
      }

      // 中列
      const columnCenter = new AGElement("div");
      columnCenter.setStyle({
        width: "425px",
        height: "100%",
        display: "none",
      });

      {
        const rowOne = new AGElement("div");
        rowOne.setText(`爱果 - 学XX国 v23.X.X`);
        rowOne.setStyle({
          height: "30px",
          lineHeight: "30px",
          textAlign: "center",
          fontSize: "15px",
        });

        const rowTwo = this.draw;
        rowTwo.setStyle({
          height: "420px",
          display: "flex",
          padding: "0 15px",
          flexDirection: "column",
        });

        AGElement.elementsMountTo([rowOne, rowTwo], columnCenter);
      }

      // 右列
      const columnRight = new AGElement("div");
      columnRight.setText(`展开控制台`);
      columnRight.setStyle({
        backgroundColor: "#121212",
        width: "25px",
        height: "100%",
        display: "inline-flex",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        position: "absolute",
        right: "0",
        top: "0",
        fontWeight: "bold",
        borderLeft: "1px solid #434343",
        borderRadius: "0 5px 5px 0",
      });
      columnRight.toHTMLElement().onclick = () => {
        const styles = panel.getStyle("textContent");
        const status = styles["textContent"].includes("展开");
        let width = status ? "600px" : "25px";
        let textContent = status ? "收起控制台" : "展开控制台";
        let display = status ? "block" : "none";
        panel.setStyle({
          width,
        });
        setTimeout(
          () => {
            columnRight.setText(textContent);
            columnLeft.setStyle({
              display,
            });
            columnCenter.setStyle({
              display,
            });
          },
          status ? 200 : 0,
        );
      };

      AGElement.elementsMountTo([columnLeft, columnCenter, columnRight], panel);
    }

    public static getInstance(panelName?: string) {
      console.log(`panel:实例化 begin`);
      if (panelName && !this.instance) this.instance = new PanelImpl(panelName);
      console.log(`panel:实例化 end`);
      return this.instance;
    }

    public mount(): void {
      console.log("panel:挂载 begin");
      const result = this.panel.elementMountTo(document.body, false, "top");
      console.log(`panel:挂载${result ? "成功" : "失败"} end`);
    }

    public setStatusBarText(text: string): void {
      Promise.resolve().then(() => {
        this.statusBar.setText(`状态栏：${text}`);
      });
    }

    public appendMessage(message: string): void {
      const liItem = new AGElement("li");
      liItem.setText(`${new Date().toLocaleTimeString()}：${message}`);
      liItem.setStyle({
        margin: "5px 0",
      });
      Promise.resolve().then(() => {
        const ul = this.draw.toHTMLElement().querySelector("ul");
        if (ul && ul instanceof HTMLElement) liItem.elementMountTo(ul);
      });
    }

    private splitLine(mountElement: AGElement): void {
      const divSplitLine = new AGElement("div", "ag-draw");
      divSplitLine.setStyle({
        width: "100%",
        height: "1px",
        background: "#999999",
        margin: "10px 0",
      });
      divSplitLine.elementMountTo(mountElement, true);
    }
  }

  PanelImpl.getInstance(`ag-panel`).mount();
})();
