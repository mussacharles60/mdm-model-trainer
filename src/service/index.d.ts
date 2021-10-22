import axios from "axios";

const host = "http://localhost:3000";
const api_key = "jZ42J20n9PEIY7rvIvQMoCYxeJzssmtX";

export default class MDMServer {
  public getQueryPhoto(session_id: string): Promise<any> {
    const request = {
        key: api_key,
        action: "oldest",
        sessionId: session_id
    }

    return new Promise<void> ((resolve, reject) => {
        try {

         const url = host + '/api/v1/sessions';
         axios({
             url: url,
             method: 'post',
             responseType: 'json',
             data: request,
             headers: { 
                 'Accept': 'application/json',
                 'Content-Type': 'application/x-www-form-urlencoded',
                 // 'cache-control': 'no-cache',
                 // 'pragma': 'no-cache'
             },
             })
             .then((result: any) => {
                 resolve(result.data ? result.data : null);
             })
             .catch((err: any) => {
                 console.error("> axios error: ", err.message);
                 reject(err.message);
             });

     } catch (e: any) {
         console.error(e);
         reject(e);
     }
     });
  }
}
