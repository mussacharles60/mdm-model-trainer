import React from "react";
import "./index.css";
import { v4 as uuidv4 } from "uuid";

export default class Main extends React.Component<
  {},
  {
    user_id: string;
    input_images: Array<string>;
    is_training_process: boolean;
  }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      user_id: "",
      input_images: [],
      is_training_process: false,
    };

    this.onUserIdChanged = this.onUserIdChanged.bind(this);
    this.onAddBtnClick = this.onAddBtnClick.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.onRemoveAllBtnClick = this.onRemoveAllBtnClick.bind(this);
    this.onRemoveBtnClick = this.onRemoveBtnClick.bind(this);
  }

  onUserIdChanged(event: any) {
    this.setState({ user_id: event.target.value });
  }

  onAddBtnClick() {
    if (this.state.is_training_process) return;
    const inputFile = document.getElementById("input-file");
    if (inputFile) {
      inputFile.click();
    }
  }

  onRemoveAllBtnClick() {
    if (this.state.is_training_process) return;
    this.setState({ input_images: [] });
  }

  onRemoveBtnClick(index: number) {
    if (this.state.is_training_process) return;
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

  render() {
    return (
      <div className="mdm-main">
        <div className="header-main"></div>
        <div className="main-lay">
          <div className="input-lay mdm-shadow">
            <div className="title-lay">Input User's Details</div>
            <div className="user-id-lay">
              <span className="user-id-title">User Id</span>
              <input
                className="user-id-input input"
                name="email"
                value={this.state.user_id}
                onChange={this.onUserIdChanged}
                type="text"
                placeholder="Enter User Email Address"
              />
            </div>
            <div className="second-title-lay">
              <div
                className="add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.onAddBtnClick();
                }}
              >
                <i className="fa fa-plus add-icon"></i>
                <span>Add User's Photos</span>
              </div>
              <div
                className="remove-btn"
                style={{
                  display: this.state.input_images.length > 0 ? "flex" : "none",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.onRemoveAllBtnClick();
                }}
              >
                <i className="fa fa-trash remove-icon"></i>
                <span>Remove All Photos</span>
              </div>
            </div>
            <div className="images-main-lay">
              <input
                hidden={true}
                multiple={true}
                type="file"
                id="input-file"
                accept="image/*"
                onChange={(e) => {
                  e.preventDefault();
                  this.handleFileChange(e.target.files);
                }}
              />
              <div className="images-lay">
                {this.state.input_images.map((image: string, index: number) => {
                  return (
                    <ImageInput
                      image={image}
                      key={uuidv4()}
                      //   onImageClick={() => {}}
                      onCancelClick={() => {
                        this.onRemoveBtnClick(index);
                      }}
                    />
                  );
                })}
              </div>
              <div
                className="no-images-lay"
                style={{
                  display: this.state.input_images.length > 0 ? "none" : "flex",
                }}
              >
                <img
                  src={require("../../media/images/no-image.jpg").default}
                  alt="..."
                />
              </div>
            </div>
          </div>
          <div className="trainer-lay mdm-shadow">
            <div className="title-lay">Train Model</div>
            <div className="trainer-cont">
              <div
                className={
                  this.state.input_images.length > 0
                    ? "trainer-btn btn-active"
                    : "trainer-btn btn-deactive"
                }
              >
                Start To Train
              </div>
              <i
                className="las la-spinner la-spin progress-icon"
                style={{
                  display: this.state.is_training_process ? "flex" : "none",
                }}
              ></i>
              <span
                style={{
                  marginTop: "16px",
                  display: this.state.is_training_process ? "flex" : "none",
                }}
              >
                Processing please wait...
              </span>
            </div>
          </div>
          <div className="output-lay mdm-shadow">
            <div className="title-lay">Export User's Model</div>
          </div>
        </div>
      </div>
    );
  }
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
