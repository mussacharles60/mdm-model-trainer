import React from "react";
import "./index.css";
// import { v4 as uuidv4 } from "uuid";
// import * as fr from "face-recognition";
import * as faceapi from "face-api.js";
// import fetch from "node-fetch";
import MDMServer, { photo_url } from "../../service";
import { Virtuoso } from "react-virtuoso";

// const Canvas = (props: any) => <canvas {...props}/>
const MODEL_URL = "/models";
// const minConfidence = 0.6;

export default class Main extends React.Component<
  {},
  {
    session_id: string;
    input_image: string;

    is_initializing: boolean;
    is_running_process: boolean;
    logs: Array<Log>;
  }
> {
  private mdmServer: MDMServer = new MDMServer();
  private didMount: boolean = false;
  private virtuoso: any;
  private no_result_data_count: number = 0;

  constructor(props: any) {
    super(props);

    this.state = {
      session_id: "mdm_session_02",
      input_image: "",
      is_initializing: true,
      is_running_process: false,
      logs: [],
    };

    this.virtuoso = React.createRef();

    this.onSessionIdChanged = this.onSessionIdChanged.bind(this);
    this.onStartSessionBtnClick = this.onStartSessionBtnClick.bind(this);
    this.onStopSessionBtnClick = this.onStopSessionBtnClick.bind(this);
  }

  async componentDidMount() {
    this.didMount = true;
    this.addLog("info", "Initializing...");
    await this.loadModels();
    console.log(faceapi.nets);
    this.setState({ is_initializing: false });
    this.addLog("success", "Initialization completed.");
  }

  componentWillUnmount() {
    this.didMount = false;
  }
  async loadModels() {
    return Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
  }
  onSessionIdChanged(event: any) {
    this.setState({ session_id: event.target.value });
    this.addLog("info", "Session changed. " + this.state.session_id);
  }

  private onStartSessionBtnClick() {
    if (this.state.is_running_process) return;
    if (this.state.session_id.length === 0) return;
    this.setState({ is_running_process: true, is_initializing: true });
    this.addLog("success", "Session started for " + this.state.session_id);
    this.queSession(this.state.session_id);
  }

  private queSession(session_id: string) {
    this.mdmServer
      .getQueryPhoto(session_id)
      .then((result) => {
        // console.log("result: ", result);

        this.setState({ is_initializing: false });
        if (
          result &&
          result.success &&
          result.success.data &&
          result.success.data.length > 0
        ) {
          this.no_result_data_count = 0;
          if (result.success.message)
            this.addLog("success", result.success.message);
          const device: DeviceInfo | null = result.success.data[0];
          if (device && this.state.is_running_process) {
            this.processResult(device);
          } else {
            this.reQueSession();
          }
        } else {
          if (result.error && result.error.meessage) {
            this.addLog("fail", result.error.message);
          }
          this.no_result_data_count++;
          if (this.no_result_data_count > 6) {
            this.no_result_data_count = 0;
            this.addLog(
              "fail",
              "Session caught! could not retreive image data."
            );
          }

          this.reQueSession();
        }
      })
      .catch((err) => {
        this.addLog(
          "fail",
          "Session caught! something went wrong on main process."
        );
        this.setState({ is_initializing: false });
        console.log(err);
      });
  }

  private processResult(device: DeviceInfo) {
    this.addLog(
      "info",
      "processing image input no. " + device.sn + " from remote device..."
    );
    const image_url = photo_url + device.sessionId + "/" + device.fileName;
    const imgElement = document.getElementById("input-img");
    const canvasElement = document.getElementById("canvas");
    const outCanvasElement = document.getElementById("canvas-output");
    global.HTMLImageElement = window.HTMLImageElement;
    if (
      imgElement &&
      canvasElement &&
      outCanvasElement &&
      (imgElement as HTMLImageElement) &&
      (canvasElement as HTMLCanvasElement) &&
      (outCanvasElement as HTMLCanvasElement)
    ) {
      (imgElement as HTMLImageElement).onload = async () => {
        if (!this.didMount) return;
        this.mdmServer
          .clearQuery(this.state.session_id)
          .then((result) => {
            if (result && result.success) {
              this.addLog("success", result.success.message);
              // console.log(result.success);
            } else if (result && result.error) {
              this.addLog("fail", result.error.message);
              // console.log(result.error);
            } else {
              this.addLog(
                "fail",
                "Session caught! could not perform remote image query clearing."
              );
            }
          })
          .catch((error) => {
            this.addLog(
              "fail",
              "Session caught! something went wrong on main process."
            );
            console.log(error);
          });
        //
        (canvasElement as HTMLCanvasElement).width =
          imgElement.getBoundingClientRect().width;
        (canvasElement as HTMLCanvasElement).height =
          imgElement.getBoundingClientRect().height;
        (outCanvasElement as HTMLCanvasElement).width =
          imgElement.getBoundingClientRect().width;
        (outCanvasElement as HTMLCanvasElement).height =
          imgElement.getBoundingClientRect().height;
        const ctx = (canvasElement as HTMLCanvasElement).getContext("2d");
        if (ctx)
          ctx.drawImage(
            imgElement as HTMLImageElement,
            0,
            0,
            (canvasElement as HTMLCanvasElement).width,
            (canvasElement as HTMLCanvasElement).height
          );
        const ctx_up = (outCanvasElement as HTMLCanvasElement).getContext("2d");
        if (ctx_up)
          ctx_up.clearRect(
            0,
            0,
            (outCanvasElement as HTMLCanvasElement).width,
            (outCanvasElement as HTMLCanvasElement).height
          );
        this.addLog("info", "Recognition started.");
        const detectionResult = await faceapi
          .detectAllFaces(canvasElement as HTMLCanvasElement)
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()
          .withFaceDescriptors();

        this.addLog("success", "Recognition completed.");
        console.log("detectionResult: ", detectionResult);
        if (detectionResult && detectionResult.length) {
          if (!this.didMount) return;
          const displaySize = {
            width: (canvasElement as HTMLCanvasElement).width,
            height: (canvasElement as HTMLCanvasElement).height,
          };
          faceapi.matchDimensions(
            outCanvasElement as HTMLCanvasElement,
            displaySize
          );
          const resizedDetections = faceapi.resizeResults(
            detectionResult,
            displaySize
          );
          faceapi.draw.drawDetections(
            outCanvasElement as HTMLCanvasElement,
            resizedDetections
          );
          faceapi.draw.drawFaceLandmarks(
            outCanvasElement as HTMLCanvasElement,
            resizedDetections
          );
          const minProbability = 0.05;
          faceapi.draw.drawFaceExpressions(
            outCanvasElement as HTMLCanvasElement,
            resizedDetections,
            minProbability
          );
          // const descriptor = singleResult[0];
          const faceMatcher = new faceapi.FaceMatcher(detectionResult);
          // const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
          this.addLog("info", "Face match processing");
          console.log("faceMatcher: ", faceMatcher); //output
          detectionResult.forEach((fd) => {
            const bestMatch = faceMatcher.findBestMatch(fd.descriptor);
            this.addLog(
              "success",
              "result for image input no. " +
                device.sn +
                " > " +
                bestMatch.toString()
            );
            console.log("bestMatch: ", bestMatch.toString());
          });
          this.reQueSession();
        } else {
          this.addLog(
            "fail",
            "Queue caught! could not perform face recognition."
          );
          this.reQueSession();
        }
      };
      if (!this.didMount) return;
      this.setState({ input_image: image_url });
    }
  }

  private reQueSession() {
    this.addLog("info", "Requeing session started...");
    setTimeout(() => {
      if (!this.didMount) return;
      if (this.state.is_running_process) {
        this.queSession(this.state.session_id);
      }
    }, 100);
  }

  private onStopSessionBtnClick() {
    // if (this.sessionInterval) clearInterval(this.sessionInterval);
    this.setState({ is_running_process: false, is_initializing: false });
    this.addLog("info", "Session stoped successfully.");
  }

  private addLog(logType: Log["type"], message: string) {
    if (!this.didMount) return;
    const logs: Array<Log> = this.state.logs;
    logs.push({
      date_millis: new Date().valueOf(),
      message: message,
      type: logType,
    });
    this.setState({ logs: logs });
    if (this.virtuoso && this.virtuoso.current)
      this.virtuoso.current.scrollToIndex({
        index: this.state.logs.length - 1,
        align: "end",
        behavior: "smooth",
      });
  }

  render() {
    return (
      <div className="mdm-main">
        <div className="header-main"></div>
        <div className="main-lay">
          <div className="admin-lay mdm-shadow">
            <div className="title-lay">Session</div>
            <i
              className="las la-spinner la-spin progress-icon"
              style={{
                display: this.state.is_initializing ? "flex" : "none",
              }}
            ></i>
            <span className="session-id-title">Session Id</span>
            <input
              className="session-id-input input"
              name="text"
              value={this.state.session_id}
              onChange={this.onSessionIdChanged}
              type="text"
              placeholder="Enter Enter Session Id (without space)"
            />
            {!this.state.is_initializing && (
              <div className="btns-lay">
                {this.state.session_id.length > 0 && (
                  <div
                    className="start-btn"
                    style={{
                      display: this.state.is_running_process ? "none" : "flex",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      this.onStartSessionBtnClick();
                    }}
                  >
                    {/* <i className="fa fa-plus add-icon"></i> */}
                    <span>Start Session</span>
                  </div>
                )}
                <div
                  className="stop-btn"
                  style={{
                    display: this.state.is_running_process ? "flex" : "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.onStopSessionBtnClick();
                  }}
                >
                  {/* <i className="fa fa-trash stop-icon"></i> */}
                  <span>Stop Session</span>
                </div>
              </div>
            )}
          </div>
          <div className="process-lay mdm-shadow">
            <div className="title-lay">Process</div>
            <div className="process-cont">
              <div className="image-lay">
                <div className="image-frame">
                  <img
                    className="img-input"
                    alt=""
                    id="input-img"
                    crossOrigin="anonymous"
                    src={this.state.input_image}
                  />
                </div>
              </div>
              <div className="output-lay">
                <div className="image-frame">
                  <canvas className="img-input" id="canvas" />
                  <canvas
                    className="img-input canvas-output"
                    id="canvas-output"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="output-lay mdm-shadow">
            <div className="title-lay">Output</div>
          </div>
        </div>
        <div className="bottom-lay">
          <div className="left-lay"></div>
          <div className="center-lay">
            <div className="title-lay">Logs</div>
            <Virtuoso
              className="logs-lay"
              ref={this.virtuoso}
              style={{ width: "100%", height: "calc(100% - 30px)" }}
              totalCount={this.state.logs.length}
              components={{
                Footer: () => {
                  return (
                    <div className="log-cont">
                      <span className={`log-time log-info-text`}>
                        {"> " + new Date()}
                      </span>
                      <span
                        className={`log-text log-info-text text-cursor-anim`}
                        style={{
                          animation: `animated-text 4s steps(${
                            this.state.logs.length + 19
                          }, end) 1s 1 normal both,
                      animated-cursor 600ms steps(${
                        this.state.logs.length + 19
                      }, end) infinite`,
                        }}
                      >
                        {` *** ${this.state.logs.length} entries ...`}
                      </span>
                    </div>
                  );
                },
              }}
              itemContent={(index) => (
                <LogView
                  date_millis={this.state.logs[index].date_millis}
                  message={this.state.logs[index].message}
                  type={this.state.logs[index].type}
                />
              )}
            />
          </div>
          <div className="right-lay"></div>
        </div>
      </div>
    );
  }
}

interface Log {
  date_millis: number;
  message: string;
  type: "success" | "fail" | "info";
}

interface DeviceInfo {
  sn: number;
  fileName: string;
  // prefixName: string;
  userId: string;
  sessionId: string;
  location: string;
  battery: string;
  charging: number;
  checked: number;
  dateCreated: number;
}

// interface ImageInputInterface {
//   image: string;
//   key: string;
//   //   onImageClick(): void;
//   onCancelClick(): void;
// }

const LogView = (props: Log) => {
  const time = new Date(props.date_millis);
  return (
    <div className="log-cont">
      <span className={`log-time log-${props.type}-text`}>{"> " + time}</span>
      <span className={`log-text log-${props.type}-text`}>
        {" " + props.message}
      </span>
    </div>
  );
};
