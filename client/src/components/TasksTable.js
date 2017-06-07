import React, { Component } from 'react';
import _ from 'underscore';

import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';


class TasksTable extends Component {
    state = {
        selected: {},
        tasks: []
    };

    render() {
        return (
            <Table onRowSelection={this.taskSelect}>
                <TableHeader>
                    <TableRow>
                        <TableHeaderColumn>Description</TableHeaderColumn>
                        <TableHeaderColumn width="10%">Status</TableHeaderColumn>
                        <TableHeaderColumn width="10%">Type</TableHeaderColumn>
                        <TableHeaderColumn width="15%">Owner</TableHeaderColumn>
                        <TableHeaderColumn width="15%">Assignee</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody deselectOnClickaway={false}>
                    {this.state.tasks.map(task =>
                        <TableRow key={task.id} selected={this.state.selected[task.id]}>
                            <TableRowColumn>{task.description}</TableRowColumn>
                            <TableRowColumn width="10%">{task.status}</TableRowColumn>
                            <TableRowColumn width="10%">{task.type}</TableRowColumn>
                            <TableRowColumn width="15%">{task.owner}</TableRowColumn>
                            <TableRowColumn width="15%">{task.assignee}</TableRowColumn>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        );
    }

    taskSelect = (selection) => {
        if (selection.length) {

            this.setState({
                selected: _.chain(selection)
                    .map((index) => this.state.tasks[index])
                    .indexBy("id")
                    .mapObject(() => true)
                    .value()
            });

            let task = selection.length === 1 ? this.state.tasks[selection[0]] : null;
            this.props.onTaskSelect(task);

        }
        else {
            this.setState({
                selected: {}
            });
            this.props.onTaskSelect(null);
        }
    };

    componentWillReceiveProps(props) {
        this.setState({
            tasks: props.tasks
        });
        if (props.selectedTask) {
            this.setState({
                selected: { [props.selectedTask.id]: true }
            });
        }
    }

}

export default TasksTable;
