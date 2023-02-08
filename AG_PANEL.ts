import AAg from "./abstracts/AAg";
import IRequest from "./interfaces/IRequest";
import IResponse from "./interfaces/IResponse";

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
      this.addToElement(document.body, "top") && this.mountElementToAG("panel");

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
