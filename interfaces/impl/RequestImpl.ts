import IRequest from "../IRequest";
import IResponse from "../IResponse";

export default class RequestImpl implements IRequest<Object> {
  request(
    url: string,
    params: object,
    ...args: any
  ): Promise<IResponse<Object>> {
    throw new Error("Method not implemented.");
  }
}
