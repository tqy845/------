import IResponse from "./IResponse";

export default interface IRequest {
  request(url: string, params: object, ...args: any): Promise<IResponse<{}>>;
}
