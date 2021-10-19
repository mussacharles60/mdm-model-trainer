import React from "react";
import "./index.css";

export default class Main extends React.Component<
  {},
  {
    user_id: string;
  }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      user_id: '',
    };

    this.onUserIdChanged = this.onUserIdChanged.bind(this);
  }

  onUserIdChanged(event: any) {}

  render() {
    return (
      <div className="mdm-main">
        <div className="header-main"></div>
        <div className="main-lay">
          <div className="input-lay mdm-shadow">
            <div className="title-lay">Input User's Photos</div>
            <div className="user-id-lay">
              <input
                className="user-id-input input"
                name="email"
                value={this.state.user_id}
                onChange={this.onUserIdChanged}
                type="text"
                placeholder="Enter User Email Address"
              />
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
