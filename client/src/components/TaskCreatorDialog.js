import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TaskEditor from "./TaskEditor";


class TaskCreatorDialog extends Component {

    state = {
        open: false,
        task: {}
    };

    render() {

        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleClose}
            />,
            <FlatButton
                label="Create"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleCreate}
            />,
        ];

        return (
            <Dialog
                title="Create Task"
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}>
                <TaskEditor task={this.state.task} onChange={this.onTaskChange}/>
            </Dialog>
        );
    }

    handleCreate = () => {
        this.props.onClose(this.state.task);
    };

    handleClose = () => {
        this.props.onClose();
    };

    onTaskChange = (task) => {
        this.setState({
            task: task
        });
    };

    componentWillReceiveProps(props) {
        this.setState({
            open: props.open
        }, () => {
            if (props.open) {
                this.setState({
                    task: {
                        name: "",
                        status: "Open"
                    }
                });
            }
        });
    }

}

export default TaskCreatorDialog;
