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
    protected abstract createGlobalErrorHandler(): void;

    protected abstract getElement(
      tagName: string,
      tagId?: string,
      tagClass?: string,
    ): HTMLElement;

    protected abstract setElementStyleOrText(
      element: HTMLElement,
      attributes: object,
      important: "important" | undefined,
    ): boolean;

    protected abstract getElementStyle(
      element: HTMLElement,
      ...attributes: Array<string>
    ): { [key: string]: string };

    protected abstract addToElement(
      element: HTMLElement,
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert",
      insertBefore?: HTMLElement,
    ): boolean;

    protected abstract addToElements(
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert",
      insertBefore?: HTMLElement,
      ...element: Array<HTMLElement>
    ): boolean;

    protected abstract mountElementToAG(
      element: HTMLElement,
      mountName: string,
    ): boolean;
  }

  abstract class AStorage extends AMethods {}

  abstract class AAg<T> extends AStorage {}

  class Ag<T> extends AAg<T> implements IRequest {
    protected element: T | undefined;

    protected createGlobalErrorHandler() {
      window.addEventListener("unhandledrejection", (event) => {
        console.log(event);
      });

      window.onerror = (message, source, lineno, colno, error) => {
        console.log(message, error);
      };
    }

    protected getElement(
      tagName: string,
      tagId?: string,
      tagClass?: string,
    ): HTMLElement {
      const tag = document.createElement(tagName);
      if (tagId) tag.setAttribute("id", tagId);
      if (tagClass) tag.setAttribute("class", tagClass);

      return tag;
    }

    protected setElementStyleOrText(
      element: HTMLElement,
      attributes: { [key: string]: string },
      important: "important" | undefined = undefined,
    ): boolean {
      const keys = Object.keys(attributes);
      if (!element || !keys.length) return false;
      const storage = ["textContent", "innerHTML", "innerText"];
      for (const key of keys) {
        if (storage.includes(key)) element.innerHTML = attributes[key];
        else if (Object.prototype.hasOwnProperty.call(element.style, key)) {
          element.style.setProperty(
            key.replace(/([A-Z])/g, "-$1").toLowerCase(),
            attributes[key],
            important,
          );
        }
      }
      return true;
    }

    protected getElementStyle(
      element: HTMLElement,
      ...attributes: Array<string>
    ): { [key: string]: string } {
      if (!element || !attributes.length) return {};
      const storage = ["textContent", "innerHTML", "innerText"];
      const resultAttributes: { [key: string]: string } = {};
      for (const key of attributes) {
        // @ts-expect-error
        if (storage.includes(key)) resultAttributes[key] = element[key];
        else if (Object.prototype.hasOwnProperty.call(element.style, key)) {
          resultAttributes[key] = window
            .getComputedStyle(element, null)
            .getPropertyValue(key);
        }
      }
      return resultAttributes;
    }

    protected addToElement(
      element: HTMLElement,
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert" = "top",
      insertBefore?: HTMLElement,
    ): boolean {
      if (!element || !mountElement) return false;

      if (element.id) document.querySelector(`#${element.id}`)?.remove();
      else if (element.className)
        document.querySelector(`.${element.className}`)?.remove();
      else if (mountElement.contains(element))
        mountElement.removeChild(element);

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

    protected addToElements(
      mountElement: HTMLElement,
      position: "top" | "bottom" | "insert" = "top",
      insertBefore?: HTMLElement,
      ...element: Array<HTMLElement>
    ): boolean {
      for (const item of element) {
        this.addToElement(item, mountElement, position, insertBefore);
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

    request(url: string, params: object, ...args: any): Promise<IResponse<{}>> {
      throw new Error("Method not implemented.");
    }
  }

  abstract class APanel<T> extends Ag<T> {
    protected abstract mount(): void;
  }

  class PanelImpl extends APanel<HTMLElement> {
    private static instance: PanelImpl;
    private panel: HTMLElement;
    private constructor(panelName: string) {
      super();
      this.createGlobalErrorHandler();

      const panel = this.getElement("div", panelName);
      this.panel = panel;
      this.setElementStyleOrText(panel, {
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

      const columnLeft = this.getElement("div");
      this.setElementStyleOrText(columnLeft, {
        backgroundColor: "#292929",
        width: "150px",
        height: "100%",
        display: "none",
      });

      {
        const rowOne = this.getElement("div");
        this.setElementStyleOrText(rowOne, {
          height: "30px",
        });

        const rowTwo = this.getElement("div");
        this.setElementStyleOrText(rowTwo, {
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

        const rowTowItem = this.getElement("span");
        this.setElementStyleOrText(rowTowItem, {
          textContent: "谭期元",
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
        this.addToElement(rowTowItem, rowTwo);

        const rowThree = this.getElement("div");
        this.setElementStyleOrText(rowThree, {
          textContent: "16...63",
          height: "20px",
          lineHeight: "20px",
          color: "#bfbfbf",
          textAlign: "center",
          margin: "5px 0",
          fontSize: "18px",
          cursor: "default",
        });

        const rowFour = this.getElement("div");
        this.setElementStyleOrText(rowFour, {
          innerHTML:
            "卡密次数: 1/40 <span style='color:#2579cd;cursor:pointer'>说明</span>",
          height: "20px",
          lineHeight: "20px",
          textAlign: "center",
          margin: "5px 0",
          fontSize: "13px",
          marginTop: "10px",
          cursor: "default",
        });

        this.addToElements(
          columnLeft,
          "bottom",
          undefined,
          rowOne,
          rowTwo,
          rowThree,
          rowFour,
        );

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
        const menu = this.getElement("ul");
        this.setElementStyleOrText(menu, {
          listStyleType: "none",
          letterSpacing: "10px",
          paddingLeft: "0",
          textAlign: "center",
          marginTop: "20px",
        });
        this.addToElement(menu, columnLeft, "bottom");
        for (const item of options) {
          const li = this.getElement("li");
          this.setElementStyleOrText(li, {
            textContent: item.label,
            cursor: "pointer",
            height: "40px",
            lineHeight: "40px",
            color: "#999999",
            fontSize: "16px",
          });
          li.onmouseover = () => {
            this.setElementStyleOrText(li, {
              color: "orange",
            });
          };
          li.onmouseleave = () => {
            this.setElementStyleOrText(li, {
              color: "#999999",
            });
          };
          this.addToElement(li, menu, "bottom");
        }
      }

      const columnCenter = this.getElement("div");
      this.setElementStyleOrText(columnCenter, {
        width: "425px",
        height: "100%",
        display: "none",
      });

      {
        const rowOne = this.getElement("div");
        this.setElementStyleOrText(rowOne, {
          textContent: "爱果学习强国　v23.2.X",
          height: "30px",
          textAlign: "center",
        });

        const rowTwo = this.getElement("div");
        this.setElementStyleOrText(rowTwo, {
          height: "420px",
          display: "flex",
          padding: "0 15px",
        });

        const rowTwoItem = this.getElement("ul");
        this.setElementStyleOrText(rowTwoItem, {
          paddingLeft: "15px",
          cursor: "default",
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
              "使用方法：点击【开始任务】即可自动完成电脑端每日任务（除【登录】任务），期间可以切到后台，但不要最小化，中断后可以点击【开始/继续任务】即可继续任务。",
            color: "white",
            backgroundColor: "orange",
          },
        ];
        for (const item of messages) {
          const liItem = this.getElement("li");
          const { textContent, color, backgroundColor } = item;
          this.setElementStyleOrText(liItem, {
            textContent,
            color,
            backgroundColor,
          });
          this.addToElement(liItem, rowTwoItem, "bottom");
        }

        this.addToElement(rowTwoItem, rowTwo, "bottom");
        this.addToElements(columnCenter, "bottom", undefined, rowOne, rowTwo);
      }

      const columnRight = this.getElement("div");
      this.setElementStyleOrText(columnRight, {
        textContent: "展开控制台",
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
      columnRight.onclick = () => {
        const styles = this.getElementStyle(panel, "textContent");
        const status = styles["textContent"].includes("展开");
        let width = status ? "600px" : "25px";
        let textContent = status ? "收起控制台" : "展开控制台";
        let display = status ? "block" : "none";
        this.setElementStyleOrText(panel, {
          width,
        });
        setTimeout(
          () => {
            this.setElementStyleOrText(columnRight, {
              textContent,
            });
            this.setElementStyleOrText(columnLeft, {
              display,
            });
            this.setElementStyleOrText(columnCenter, {
              display,
            });
          },
          status ? 200 : 0,
        );
      };

      this.addToElements(
        panel,
        "bottom",
        undefined,
        columnLeft,
        columnCenter,
        columnRight,
      );
    }

    public static getInstance(panelName?: string) {
      console.log(`panel:实例化 begin`);
      if (panelName && !this.instance) this.instance = new PanelImpl(panelName);
      console.log(`panel:实例化 end`);
      return this.instance;
    }

    public mount(): void {
      console.log("panel:挂载 begin");
      const result: boolean =
        this.addToElement(this.panel, document.body, "top") &&
        this.mountElementToAG(this.panel, "panel");
      console.log(`panel:挂载${result ? "成功" : "失败"} end`);
    }
  }

  PanelImpl.getInstance(`ag-panel`).mount();
})();
