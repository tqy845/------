import RequestImpl from "../interfaces/impl/RequestImpl";
import IResponse from "../interfaces/IResponse";

export default abstract class ARequest extends AMethods implements RequestImpl {
  request(
    url: string,
    params: object,
    ...args: any
  ): Promise<IResponse<Object>> {
    throw new Error("Method not implemented.");
  }
}
