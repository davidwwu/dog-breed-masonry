import React, { Component } from 'react';
import { Card, CardMedia } from "material-ui/Card";

class ImageCell extends Component {
    render() {
        return (
            <Card zDepth={2}>
                <CardMedia>
                    <img
                        src={this.props.src}
                        alt=""
                        style={{
                            width: "100%",
                            display: "block",
                            height: "300px"
                        }}
                    />
                </CardMedia>
            </Card>
        );
    }
}

export default ImageCell;