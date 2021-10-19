import React from "react";
import "./index.css";
import { v4 as uuidv4 } from "uuid";

export default class Main extends React.Component<
  {},
  {
    user_id: string;
    input_images: Array<string>;
  }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      user_id: "",
      input_images: [],
    };

    this.onUserIdChanged = this.onUserIdChanged.bind(this);
    this.onAddBtnClick = this.onAddBtnClick.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  onUserIdChanged(event: any) {
    this.setState({ user_id: event.target.value });
  }

  onAddBtnClick() {
    const inputFile = document.getElementById("input-file");
    if (inputFile) {
      inputFile.click();
    }
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
            <div className="title-lay">
              <span>Add User's Photos</span>
              <div
                className="add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.onAddBtnClick();
                }}
              >
                <i className="fa fa-plus add-icon"></i>
                <span>Add</span>
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
                      onImageClick={() => {}}
                      onCancelClick={() => {}}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="trainer-lay mdm-shadow">
            <div className="title-lay">Train Model</div>
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
  onImageClick(): void;
  onCancelClick(): void;
}

const ImageInput = (props: ImageInputInterface) => {
  return (
    <div className="img-view-cont">
      <img className="img-input" alt="..." src={props.image} />
    </div>
  );
};
