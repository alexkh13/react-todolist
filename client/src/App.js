import _ from 'underscore';
import update from 'immutability-helper';
import React from 'react';
import { View } from 'react-native';
import ClassNames from 'classnames';
import debounce from 'javascript-debounce';

import AppBar from 'material-ui/AppBar';

import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ActionDelete from 'material-ui/svg-icons/action/delete';

import TasksTable from './components/TasksTable';
import TaskEditor from './components/TaskEditor';

import './App.css';
import TaskCreatorDialog from "./components/TaskCreatorDialog";

class App extends React.Component {

    state = {
        createTaskOpen: false,
        tasks: null,
        selectedTask: null
    };

    render() {

        return (
            <View style={{display:'flex'}} className="fill">
                <AppBar title="Tasks" iconElementRight={ <div className="top-icons">
                    <IconButton onTouchTap={this.openCreateTask}><ContentAdd/></IconButton>
                    { this.state.selectedTask && <IconButton onTouchTap={this.deleteSelectedTasks}><ActionDelete/></IconButton> }
                </div> } />
                <View style={{flex:1,flexDirection:'row'}} className="fill scroll">
                    <TasksTable style={{flex:1}} tasks={this.state.tasks} selectedTask={this.state.selectedTask} onTaskSelect={this.onTaskSelect}></TasksTable>
                    <View className={ClassNames("right-panel", {"show":!!this.state.selectedTask})}>
                        <TaskEditor task={this.state.selectedTask} onChange={this.onTaskChange}></TaskEditor>
                    </View>
                </View>
                <TaskCreatorDialog open={this.state.createTaskOpen} onClose={this.onTaskCreateClose}/>
            </View>
        );
  }

  openCreateTask = () => {
      this.setState({createTaskOpen: true});
  };

  deleteSelectedTasks = () => {
      let taskIndex = this.state.tasks.indexOf(this.state.selectedTask);
      fetch('/tasks/' + this.state.selectedTask.id, {
          method: 'DELETE'
      })
          .then(task => this.setState({
              selectedTask: null,
              tasks: update(this.state.tasks, { $splice: [[taskIndex, 1]]})
          }));
  };

  onTaskCreateClose = (task) => {
      this.setState({createTaskOpen: false});
      if (task) {
          fetch('/tasks', {
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
              body: JSON.stringify(task)
          })
              .then(res => res.json())
              .then(task => this.setState({
                  selectedTask: task,
                  tasks: update(this.state.tasks, { $push: [task]})
              }));
      }
  };

  onTaskSelect = (task) => {
    this.setState({
        selectedTask: task
    });
  };

  pendingTasks = {};

  savePendingTask = debounce(() => {
      _.each(this.pendingTasks, (task) => {
          fetch('/tasks', {
              headers: { 'Content-Type': 'application/json' },
              method: 'PUT',
              body: JSON.stringify(task)
          }).then(() => {
              delete this.pendingTasks[task.id];
          });
      });
  }, 1000);

  onTaskChange = (_task) => {
    let task = _.findWhere(this.state.tasks, { id: _task.id });
    let index = this.state.tasks.indexOf(task);

    this.pendingTasks[_task.id] = _task;

      this.savePendingTask();

      this.setState({
          selectedTask: _task,
          tasks: update(this.state.tasks, { [index]: { $set: _task }})
      })

  };

    componentDidMount() {
        fetch('/tasks')
            .then(res => res.json())
            .then(tasks => this.setState({ tasks }));
    }

}

export default App;
