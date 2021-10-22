import React from "react";
import "./index.css";
// import { v4 as uuidv4 } from "uuid";
// import * as fr from "face-recognition";
import * as faceapi from "face-api.js";
// import fetch from "node-fetch";
import MDMServer, { photo_url } from "../../service";
// import '../../service/faceEnvWorkerPatch';

// const Canvas = (props: any) => <canvas {...props}/>
const MODEL_URL = "/models";
// const minConfidence = 0.6;

export default class Main extends React.Component<
  {},
  {
    session_id: string;
    input_image: string;

    input_images: Array<string>;
    is_running_process: boolean;
    error: string | null;
  }
> {
  // private user_images: fr.ImageRGB[] = [];
  // private recognizer: fr.FaceRecognizer = fr.FaceRecognizer();
  private mdmServer: MDMServer = new MDMServer();
  private sessionInterval: any = null;

  constructor(props: any) {
    super(props);

    this.state = {
      session_id: "mdm_session_02",
      input_image: "",
      input_images: [],
      is_running_process: false,
      error: null,
    };

    this.onSessionIdChanged = this.onSessionIdChanged.bind(this);
    this.onAddBtnClick = this.onAddBtnClick.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.onRemoveAllBtnClick = this.onRemoveAllBtnClick.bind(this);
    this.onRemoveBtnClick = this.onRemoveBtnClick.bind(this);
    this.onStartSessionBtnClick = this.onStartSessionBtnClick.bind(this);
    this.onStopSessionBtnClick = this.onStopSessionBtnClick.bind(this);
  }

  async componentDidMount() {
    await this.loadModels();
    // console.log(faceapi.nets);
  }

  componentWillUnmount() {
    if (this.sessionInterval) clearInterval(this.sessionInterval);
  }

  onSessionIdChanged(event: any) {
    this.setState({ session_id: event.target.value });
  }

  onAddBtnClick() {
    if (this.state.is_running_process) return;
    const inputFile = document.getElementById("input-file");
    if (inputFile) {
      inputFile.click();
    }
  }

  onRemoveAllBtnClick() {
    if (this.state.is_running_process) return;
    this.setState({ input_images: [] });
  }

  onRemoveBtnClick(index: number) {
    if (this.state.is_running_process) return;
    const images = this.state.input_images;
    images.splice(index, 1);
    this.setState({ input_images: images });
  }

  handleFileChange(files: FileList | null) {
    console.log(files);
    if (files && files.length > 0) {
      const images: Array<string> = this.state.input_images;
      for (var i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          const filePath = URL.createObjectURL(file);
          images.push(filePath);
        }
      }
      this.setState({ input_images: images });
      console.log(this.state);
    }
  }

  private onStartSessionBtnClick() {
    if (this.state.is_running_process) return;
    if (this.state.session_id.length === 0) return;
    // if (this.sessionInterval) clearInterval(this.sessionInterval);
    this.setState({ is_running_process: true });
    this.queSession(this.state.session_id);
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

  private queSession(session_id: string) {
    this.mdmServer.getQueryPhoto(session_id).then((result) => {
      // console.log("result: ", result);
      if (
        result &&
        result.success &&
        result.success.data &&
        result.success.data.length > 0
      ) {
        const device: DeviceInfo | null = result.success.data[0];
        if (device) {
          const image_url =
            photo_url + device.sessionId + "/" + device.fileName;

          const imgElement = document.getElementById("input-img");
          const canvasElement = document.getElementById("canvas");
          const outCanvasElement = document.getElementById("canvas-output");
          // this.drawHTMLImage(this.canvas.current, testImageHTML, 296, 296);
          global.HTMLImageElement = window.HTMLImageElement;
          // var image = new Image();
          if (
            imgElement &&
            canvasElement &&
            outCanvasElement &&
            (imgElement as HTMLImageElement) &&
            (canvasElement as HTMLCanvasElement) &&
            (outCanvasElement as HTMLCanvasElement)
          ) {
            (imgElement as HTMLImageElement).onload = async () => {
              this.mdmServer
                .clearQuery(this.state.session_id)
                .then((result) => {
                  if (result && result.success) {
                    console.log(result.success);
                  } else if (result && result.error) {
                    console.log(result.error);
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
              //
              (canvasElement as HTMLCanvasElement).width =
                imgElement.getBoundingClientRect().width;
              (canvasElement as HTMLCanvasElement).height =
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
              setTimeout(async () => {
                const detectionResult = await faceapi
                  .detectAllFaces(canvasElement as HTMLCanvasElement)
                  .withFaceLandmarks()
                  .withFaceExpressions()
                  .withAgeAndGender()
                  .withFaceDescriptors();

                console.log("detectionResult: ", detectionResult);
                if (detectionResult && detectionResult.length) {
                  const displaySize = {
                    width: (canvasElement as HTMLCanvasElement).width,
                    height: (canvasElement as HTMLCanvasElement).height,
                  };
                  faceapi.matchDimensions((outCanvasElement as HTMLCanvasElement), displaySize);
                  const resizedDetections = faceapi.resizeResults(detectionResult, displaySize);
                  faceapi.draw.drawDetections((outCanvasElement as HTMLCanvasElement), resizedDetections);
                  faceapi.draw.drawFaceLandmarks((outCanvasElement as HTMLCanvasElement), resizedDetections);
                  const minProbability = 0.05
                  faceapi.draw.drawFaceExpressions((outCanvasElement as HTMLCanvasElement), resizedDetections, minProbability)
                  // const descriptor = singleResult[0];
                  const faceMatcher = new faceapi.FaceMatcher(detectionResult);
                  // const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
                  console.log(faceMatcher); //output
                  setTimeout(() => {
                    if (this.state.is_running_process)
                      this.queSession(this.state.session_id);
                  }, 500);
                } else {
                  setTimeout(() => {
                    if (this.state.is_running_process)
                      this.queSession(this.state.session_id);
                  }, 500);
                }
              }, 1000);
            };
            this.setState({ input_image: image_url });
          }
        } else {
          setTimeout(() => {
            if (this.state.is_running_process)
              this.queSession(this.state.session_id);
          }, 500);
        }
      } else {
        setTimeout(() => {
          if (this.state.is_running_process)
            this.queSession(this.state.session_id);
        }, 100);
      }
    });
  }

  private onStopSessionBtnClick() {
    // if (this.sessionInterval) clearInterval(this.sessionInterval);
    this.setState({ is_running_process: false });
  }

  render() {
    return (
      <div className="mdm-main">
        <div className="header-main"></div>
        <div className="main-lay">
          <div className="admin-lay mdm-shadow">
            <div className="title-lay">Session</div>
            {/* <div className="session-id-lay"> */}
            <span className="session-id-title">Session Id</span>
            <input
              className="session-id-input input"
              name="text"
              value={this.state.session_id}
              onChange={this.onSessionIdChanged}
              type="text"
              placeholder="Enter Enter Session Id (without space)"
            />
            {/* </div> */}
            <div className="btns-lay">
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
                  <canvas
                    className="img-input canvas-output"
                    id="canvas-output"
                  />
                </div>
              </div>
              <div className="output-text-lay">
                {/* <div className="image-frame">
                  <canvas
                    className="img-input"
                    id="canvas"
                  />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

interface DeviceInfo {
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

// const ImageInput = (props: ImageInputInterface) => {
//   return (
//     <div className="img-view-cont">
//       <img className="img-input" alt="..." src={props.image} />
//       <div
//         className="img-remove-btn"
//         onClick={(e) => {
//           e.stopPropagation();
//           e.preventDefault();
//           props.onCancelClick();
//         }}
//       >
//         Click To Remove
//       </div>
//     </div>
//   );
// };
