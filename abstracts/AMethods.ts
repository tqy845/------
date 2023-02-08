abstract class AMethods {
  protected abstract getElement(
    tagName: string,
    tagId?: string,
    tagClass?: string,
  ): HTMLElement;

  protected abstract setElementStyle(
    attributes: Object,
  ): boolean;

  protected abstract addToElement(
    mountElement: HTMLElement,
    position: "top" | "bottom" | "insert",
    insertBefore?: HTMLElement,
  ): boolean;

  protected abstract mountElementToAG(
    mountName: string,
  ): boolean;
}