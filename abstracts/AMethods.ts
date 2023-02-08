abstract class AMethods {
  protected abstract getElement(
    tagName: string,
    tagId?: string,
    tagClass?: string,
  ): HTMLElement;

  protected abstract setElementStyle(
    element: HTMLElement,
    attributes: Object,
  ): boolean;

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