import IResponse from "./IResponse";

export default interface IRequest<T> {
  request(url: string, params: object, ...args: any): Promise<IResponse<T>>;
}
