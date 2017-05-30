const _ = require('underscore');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json({limit: '5mb'}));

const tasks = [
    { "id": 1, "name": "Task1", "status": "Open" },
    { "id": 2, "name": "Task2", "status": "Closed" }
];

const images = {};

let lastId = 2;

app.get('/tasks', (req, res) => {
    res.send(tasks);
});

app.post('/tasks', (req, res) => {
    req.body.id = ++lastId;
    tasks.push(req.body);
    res.send(req.body);
});

app.put('/tasks', (req, res) => {
    let task = _.findWhere(tasks, { id: req.body.id });
    _.extend(task, req.body);
    res.send(task);
});

app.get('/tasks/:taskId/images', (req, res) => {
    res.send(images[req.params.taskId] || []);
});

app.post('/tasks/:taskId/images', (req, res) => {
    if (!images[req.params.taskId]) {
        images[req.params.taskId] = [];
    }
    images[req.params.taskId].push(req.body.data);
    res.end();
});

app.delete('/tasks/:taskId/images/:index', (req, res) => {
    if (images[req.params.taskId] && +req.params.index < images[req.params.taskId].length) {
        images[req.params.taskId].splice(+req.params.index, 1);
    }
    res.send({});
});

app.listen(3001);