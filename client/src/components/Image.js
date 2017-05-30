import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

class ImageViewer extends Component {

    state = {
        open: false
    };

    constructor(props) {
        super(props);
        this.width = props.width || 200;
        this.height = props.height || 200;
    }

    render() {

        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onTouchTap={this.handleClose}
            />
        ];

        return (
            <div style={{display:'inline-block',cursor:this.props.disableEnlarge?'default':'pointer'}} onTouchTap={this.enlargeImage}>
                <canvas ref="canvas" width={this.width} height={this.height}/>
                <Dialog
                    title="Image"
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    contentStyle={{maxWidth:'none'}}
                    onRequestClose={this.handleClose}>
                    <ImageViewer data={this.props.data} disableEnlarge={true} width={800} height={600}/>
                </Dialog>
            </div>
        );
    }

    componentDidMount() {
        const ctx = this.refs.canvas.getContext('2d');
        this.img = new Image();
        this.img.onload = () => {
            if (this.props.disableEnlarge) {
                this.refs.canvas.width = this.img.width;
                this.refs.canvas.height = this.img.height;
                ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
            }
            else {
                drawImageProp(ctx, this.img, 0, 0, this.width, this.height);
            }
        };
        this.img.src = this.props.data;
    }

    enlargeImage = () => {
        if (!this.props.disableEnlarge) {
            this.setState({
                open: true
            });
        }
    };

    handleClose = () => {
        this.setState({
            open: false
        });
    }

}

function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}

export default ImageViewer;
