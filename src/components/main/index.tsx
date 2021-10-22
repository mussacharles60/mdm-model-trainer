import React from "react";
import "./index.css";
import { v4 as uuidv4 } from "uuid";
// import * as fr from "face-recognition";
import * as faceapi from "face-api.js";
import MDMServer, { photo_url } from "../../service";

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
      session_id: "",
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
    if (this.sessionInterval) clearInterval(this.sessionInterval);
    this.setState({ is_running_process: true})
    this.queSession(this.state.session_id);

    setInterval(() => this.queSession(this.state.session_id), 5000);

    // const user_images: fr.ImageRGB[] = [];
    // this.state.input_images.forEach((input_image) => {
    //   user_images.push(fr.loadImage(input_image));
    // });
    // this.recognizer.addFaces(user_images, this.state.session_id, 15);
  }

  private queSession(session_id: string) {
    this.mdmServer.getQueryPhoto(session_id).then((result) => {
      console.log("result: ", result);
      if (result && result.success && result.success.data && result.success.data.length > 0) {
        const device: DeviceInfo | null = result.success.data[0];
        if (device) {
          const image_url = photo_url + device.sessionId + "/" + device.fileName;
          this.setState({ input_image: image_url });
        }
      }
    })
  }

  // async loadModels() {
  //   const modelsPath = require("../../models");
  //   return Promise.all([
  //     faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
  //     faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath),
  //     faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath),
  //     faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath),
  //     faceapi.nets.ssdMobilenetv1.loadFromUri(modelsPath),
  //   ]);
  // }

  componentWillUnmount() {
    if (this.sessionInterval) clearInterval(this.sessionInterval);
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
                  this.onRemoveAllBtnClick();
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
                    src={this.state.input_image}
                  />
                </div>
              </div>
              <div className="output-lay"></div>
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

interface ImageInputInterface {
  image: string;
  key: string;
  //   onImageClick(): void;
  onCancelClick(): void;
}

const ImageInput = (props: ImageInputInterface) => {
  return (
    <div className="img-view-cont">
      <img className="img-input" alt="..." src={props.image} />
      <div
        className="img-remove-btn"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          props.onCancelClick();
        }}
      >
        Click To Remove
      </div>
    </div>
  );
};
