import axios from "axios";

const host = "http://localhost:3000";
const api_key = "jZ42J20n9PEIY7rvIvQMoCYxeJzssmtX";

export const photo_url = host + "/uploads/";

export default class MDMServer {
  // constructor() {}
  public getQueryPhoto(session_id: string): Promise<any> {
    const request = {
      key: api_key,
      action: "oldest",
      sessionId: session_id,
    };

    return new Promise<void>((resolve, reject) => {
      try {
        const url = host + "/api/v1/sessions";
        axios({
          url: url,
          method: "post",
          responseType: "json",
          data: request,
          headers: {
            Accept: "application/json"
          },
        })
          .then((result: any) => {
            resolve(result.data ? result.data : null);
          })
          .catch((err: any) => {
            console.log("> axios error: ", err.message);
            reject(err.message);
          });
      } catch (e: any) {
        console.log(e);
        reject(e);
      }
    });
  }

  public clearQuery(session_id: string): Promise<any> {
    const request = {
      key: api_key,
      action: "delete",
      sessionId: session_id,
    };

    return new Promise<void>((resolve, reject) => {
      try {
        const url = host + "/api/v1/sessions";
        axios({
          url: url,
          method: "post",
          responseType: "json",
          data: request,
          headers: {
            Accept: "application/json"
          },
        })
          .then((result: any) => {
            resolve(result.data ? result.data : null);
          })
          .catch((err: any) => {
            console.log("> axios error: ", err.message);
            reject(err.message);
          });
      } catch (e: any) {
        console.log(e);
        reject(e);
      }
    });
  }
}
