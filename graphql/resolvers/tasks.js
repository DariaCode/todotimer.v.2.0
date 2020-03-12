/* ----------------------------------------------------
Node.js / Task resolver for GraphQL

Updated: 03/10/2020
Author: Daria Vodzinskaia
Website: www.dariacode.dev
-------------------------------------------------------  */

const Task = require('../../models/task');
const User = require('../../models/user');
const { transformTask } = require('../../graphql/resolvers/merge');


module.exports = {
    tasks: async () => {
        try {
            const tasks = await Task.find()
            return tasks.map(task => {
                return transformTask(task);
            });
        } catch (err) {
            throw err;
        }
    },
    createTask: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        }
        const task = new Task({
            title: args.taskInput.title,
            description: args.taskInput.description,
            price: +args.taskInput.price,
            date: new Date(args.taskInput.date),
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
            creator.createdTasks.push(task); //createdTasks from user.js/userSchema
            await creator.save();

            return createdTask;
        } catch (err) {
            console.log(err);
            throw err;
        };
    }
};