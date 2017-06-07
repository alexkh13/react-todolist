import React, { Component } from 'react';
import update from 'immutability-helper';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ImageViewer from "./Image";

class TaskEditor extends Component {

    state = {
        task: null
    };

    static instances = [];

    statuses = [ "Open", "In Progress", "Closed" ];
    types = [ "Bug", "Feature" ];

    componentDidMount() {
        this.onPasteBind = this.onPaste.bind(this);
        document.addEventListener('paste', this.onPasteBind);
        TaskEditor.instances.push(this);
    }

    componentWillUnmount() {
        document.removeEventListener('paste', this.onPasteBind);
        let index = TaskEditor.instances.indexOf(this);
        TaskEditor.instances.splice(index, 1);
    }

    onPaste = (event) => {
        if (!this.state.task || !this.state.task.id) return;
        if (TaskEditor.instances[TaskEditor.instances.length-1]!==this) return;
        let items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file') {
                let blob = item.getAsFile();
                let reader = new FileReader();
                reader.onload = (event) => {
                    this.setState({
                        task: update(this.state.task, { images:
                            { $set: update(this.state.task.images || [], { $push: [event.target.result] }) }
                        })
                    });
                    fetch(`/tasks/${this.state.task.id}/images`, {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'POST',
                        body: JSON.stringify({
                            data: event.target.result
                        })
                    });
                };
                reader.readAsDataURL(blob);
            }
        }
    };

    render() {
        return (
            <div>{ this.state.task &&
                <div style={{display:'flex',flexDirection:'column'}}>
                    <TextField name="description" value={this.state.task.description} multiLine={true} onChange={this.onChange}
                        floatingLabelText="Description" fullWidth={true}/>
                    <SelectField name="status"
                                floatingLabelText="Status"
                                value={this.state.task.status}
                                onChange={(event, index) => this.updateAttribute("status", this.statuses[index]) }>{
                                    this.statuses.map(status =>
                                        <MenuItem key={status} value={status} primaryText={status}/>
                                )}
                    </SelectField>
                    <SelectField name="type"
                                 floatingLabelText="Type"
                                 value={this.state.task.type}
                                 onChange={(event, index) => this.updateAttribute("type", this.types[index]) }>{
                                     this.types.map(type =>
                                        <MenuItem key={type} value={type} primaryText={type}/>
                                )}
                    </SelectField>
                    <TextField name="owner" value={this.state.task.owner} onChange={this.onChange}
                               floatingLabelText="Owner"/>
                    <TextField name="assignee" value={this.state.task.assignee} onChange={this.onChange}
                               floatingLabelText="Assignee"/>


                    { this.state.task.id && (<div>
                        <h3>Images</h3>
                        {(this.state.task.images||[]).map((image,index) => (
                            <Paper zDepth={1} key={index} style={{position:'relative',display:'inline-block',margin:'10px'}}>
                                <ImageViewer data={image} />
                                <FloatingActionButton onTouchTap={()=>this.removeImage(index)} mini={true} secondary={true} style={{position:'absolute',top:-10,right:-10}}>
                                    <ActionDelete/>
                                </FloatingActionButton>
                            </Paper>)
                        )}
                        {(!this.state.task.images||!this.state.task.images.length)&& (
                            <div>
                                <div>No Images</div>
                            </div>
                        )}
                    </div>)}
                </div>
            }</div>
        );
    }

    removeImage = (index) => {
        fetch(`/tasks/${this.state.task.id}/images/${index}`, {
            method: 'DELETE'
        }).then(() => {
            this.setState({
                task: update(this.state.task, { images:
                    { $set: update(this.state.task.images, { $splice: [[index,1]]}) }
                })
            })
        });
    };

    onChange = (event, newValue) => {
        this.updateAttribute(event.target.name, newValue);
    };

    updateAttribute = (attribute, newValue) => {
        let updatedTask = update(this.state.task, {
            [attribute]: { $set: newValue }
        });
        this.setState({
            task: updatedTask
        });
        this.props.onChange(updatedTask);
    };

    componentWillReceiveProps(props) {
        this.setState({
            task: props.task
        });
    }

}

export default TaskEditor;
