/* ----------------------------------------------------
Node.js / Task resolver for GraphQL

Updated: 03/10/2020
Author: Daria Vodzinskaia
Website: www.dariacode.dev
-------------------------------------------------------  */

const Task = require('../../models/task');
const User = require('../../models/user');
const {transformTask} = require('../../graphql/resolvers/merge');

module.exports = {
    tasks: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        }
        try {
            // to find only tasks for creator-user
            const tasks = await Task.find({creator: req.userId});
            return tasks.map(task => {
                return transformTask(task);
            });
        } catch (err) {
            throw err;
        }
    },
    createTask: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        } 
        const task = new Task({
            title: args.taskInput.title,
            priority: + args.taskInput.priority,
            date: args.taskInput.date,
            complete: args.taskInput.complete,
            creator: req.userId
        });
        let createdTask;
        try {
            const result = await task.save()
            createdTask = transformTask(result);
            const creator = await User.findById(req.userId);

            // Checking whether the user who is creating this task exists in the database.
            // If yes, we push this task to user's data and update it
            if (!creator) {
                throw new Error('User not found');
            }
            creator
                .createdTasks
                .push(task); //createdTasks from user.js/userSchema
            await creator.save();

            return createdTask;
        } catch (err) {
            console.log(err);
            throw err;
        };
    },
    updateTask: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        } 
        try {
            const task = await Task.findById(args.taskId);
            if (args.taskInput.title) {
                task.title = args.taskInput.title
            }
            if (args.taskInput.priority) {
                task.priority = args.taskInput.priority
            }
            if (args.taskInput.date) {
                task.date = args.taskInput.date
            }
            await Task
                .findByIdAndUpdate(args.taskId, {
                $set: {
                    title: task.title,
                    priority: +task.priority,
                    date: task.date,
                }
            })
                .exec();
            return await Task.findById(args.taskId);
        } catch (err) {
            throw err;
        };
    },
    completeTask: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        } 
        try {
            const task = await Task.findById(args.taskId);
            if (task.complete === false) {
                task.complete = true
            } else {
                task.complete = false
            }
            await Task
                .findByIdAndUpdate(args.taskId, {
                $set: {
                    complete: task.complete
                }
            })
                .exec();
            return await Task.findById(args.taskId);
        } catch (err) {
            throw err;
        };
    },
    deleteTask: async(args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        }
        try {
            const task = await Task.findById(args.taskId);
            await Task.deleteOne({_id: args.taskId});
            return task;
        } catch (err) {
            throw err;
        };
    }
};