import AStorage from "./AStorage";

export default abstract class AAg extends AStorage {
  abstract title: string;

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

  protected setElementStyle(
    element: HTMLElement,
    attributes: Object = {},
  ): boolean {
    if (!element || !Object.keys(attributes).length) return false;
    for (const key in attributes) {
      // @ts-expect-error
      element.style[key] = attributes[key];
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

  protected mountElementToAG(element: HTMLElement, mountName: string): boolean {
    if (!element || !mountName) return false;
    const body: any = document.body;
    if (!body.AG) body.AG = {};
    body.AG[mountName] = element;
    return true;
  }
}
