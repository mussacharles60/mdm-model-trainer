import React from 'react';
import './index.css';

export default class Main extends React.Component<{}> {

    // constructor(props: any) {
    //     super(props);
    // }

    render() {
        return (
            <div className="mdm-main">
                <div className="header-main"></div>
                <div className="main-lay">
                    <div className="input-lay mdm-shadow">

                    </div>
                    <div className="trainer-lay mdm-shadow">

                    </div>
                    <div className="output-lay mdm-shadow">

                    </div>
                </div>
            </div>
        );
    }
}