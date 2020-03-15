/* ----------------------------------------------------
Node.js / merge functions for GraphQL

Updated: 03/10/2020
Author: Daria Vodzinskaia
Website: www.dariacode.dev
-------------------------------------------------------  */

const Task = require('../../models/task');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');


// tasks() and user() help to avoid infinite loop.
// $in is the special operator in mongoDB syntax
// to find all tasks with id.
const tasks = async taskIds => {
    try {
        const tasks = await Task.find({
            _id: {
                $in: taskIds
            }
        });
       return tasks.map(task => {
            return transformTask(task);
        });

    } catch (err) {
        throw err;
    }
};

// This function acts like .population(), mongoose's method that adds relation
// In this case - user's(creator's) info to the task
const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdTasks: tasks.bind(this, user._doc.createdTasks),
            password: null
        };
    } catch (err) {
        throw err;
    }
};

// A function for sending tasks
const singleTask = async taskId => {
    try {
        const task = await Task.findById(taskId);
        return transformTask(task);
    } catch (err) {
        throw err;
    }
};

// The function which transforms the task 
// into the object with the needed format.
// This function was created to replace repeated code. 
const transformTask = task => {
    return {
        ...task._doc,
        _id: task.id,
        date: dateToString(task._doc.date),
        creator: user.bind(this, task.creator)
    };
};

const transformSending = sending => {
    return {  
        ...sending._doc,
        _id: sending.id,
        user: user.bind(this, sending._doc.user),
        task: singleTask.bind(this, sending._doc.task),
        createdAt: dateToString(sending._doc.createdAt),
        updatedAt: dateToString(sending._doc.updatedAt)
    };
};


// exports.tasks = tasks;
// exports.user = user;
// exports.singleTask = singleTask;
exports.transformTask = transformTask;
exports.transformSending = transformSending;