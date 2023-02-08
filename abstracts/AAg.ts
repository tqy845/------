import AStorage from "./AStorage";

export default abstract class AAg<T> extends AStorage {
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
      element.style[key] = attributes[key];
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
        if (insertBefore) mountElement.insertBefore(this.element, insertBefore);
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
