const _ = require('underscore');
const shortid = require('shortid');
const express = require('express');
const bodyParser = require('body-parser');
const tasks = require('json-fs-store')(__dirname + '/tasks');
const app = express();

app.use(bodyParser.json({limit: '5mb'}));

app.get('/tasks', (req, res) => {
    tasks.list(function(err, tasks) {
        if (err) {
            res.status(500);
            res.send(err);
            return;
        }
        res.send(tasks);
    });
});

app.post('/tasks', (req, res) => {
    req.body.id = shortid.generate();
    tasks.add(req.body, function(err) {
        if (err) {
            res.status(500);
            res.send(err);
            return;
        }
        res.send(req.body);
    });

});

app.put('/tasks', (req, res) => {
    let task = _.findWhere(tasks, { id: req.body.id });

    tasks.add(req.body, function(err) {
        if (err) {
            res.status(500);
            res.send(err);
            return;
        }
        _.extend(task, req.body);
        res.send(task);
    });
});

app.delete('/tasks/:taskId', (req, res) => {
    tasks.remove(req.params.taskId, function(err) {
        if (err) {
            res.status(500);
            res.send(err);
            return;
        }
        res.end();
    });
});

app.post('/tasks/:taskId/images', (req, res) => {
    tasks.load(req.params.taskId, function(err, task) {
        if (err) {
            res.status(500);
            res.send(err);
            return;
        }
        if (!task.images) {
            task.images = [];
        }
        task.images.push(req.body.data);
        tasks.add(task, function(err) {
            if (err) {
                res.status(500);
                res.send(err);
                return;
            }
            res.send(task);
        });
    });
});

app.delete('/tasks/:taskId/images/:index', (req, res) => {

    tasks.load(req.params.taskId, function(err, task) {
        if (err) {
            res.status(500);
            res.send(err);
            return;
        }
        if (task.images && +req.params.index < task.images.length) {
            task.images.splice(+req.params.index, 1);
        }
        tasks.add(task, function(err) {
            if (err) {
                res.status(500);
                res.send(err);
                return;
            }
            res.send(task);
        });
    });
});

app.listen(3001);