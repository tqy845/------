/*
 * @Author: 谭期元
 * @Version v23.2.7
 * @Date: 2023-02-07 23:19:59
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-02-08 00:44:26
 * @Description: [爱果]主面板
 */

import AAg from "./abstracts/AAg";

class Ag extends AAg {
  title: string;
  constructor(title: string) {
    super();
    this.title = title;
  }
}

abstract class AButton extends Ag {
  constructor(buttonName: string) {
    super(buttonName);
  }
}

class ButtonImpl extends AButton {
  constructor(buttonName: string) {
    super(buttonName);
    const tag = this.getElement("button");
    this.setElementStyle(tag, {});
  }
}

abstract class APanel extends Ag {
  constructor(panelName: string) {
    super(panelName);
    const panel = this.getElement("div", this.title);
    this.setElementStyle(panel, {
      width: "600px",
      height: "500px",
      position: "fixed",
      zIndex: "9999",
      left: "0",
      top: "0",
      backgroundColor: "#121212",
    });
    const result =
      this.addToElement(panel, document.body, "top") &&
      this.mountElementToAG(panel, "panel");

    console.log(`panel:${result ? "挂载成功" : "挂载失败"}`);
  }

  protected abstract show(): void;
}
class PanelImpl extends APanel {
  protected static instance: PanelImpl;

  private constructor(panelName: string) {
    super(panelName);
  }

  public static getInstance(panelName?: string) {
    if (panelName && !this.instance) this.instance = new PanelImpl(panelName);
    return this.instance;
  }

  public show(): void {}
}

let instance = PanelImpl.getInstance(`ag-panel`);
instance.show();
