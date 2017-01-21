const express = require('express');
const app = express();
const bp = require('body-parser');
const mongoose = require('mongoose');
const faker = require('faker');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Projects} = require('./models');

const projectRouter = require('./projectRouter');
const taskRouter = require('./taskRouter');

app.use(bp.json());
app.use(express.static('public'));


projectRouter.use('/:id/tasks', taskRouter);
app.use('/projects', projectRouter);



//Generate Data
const generateProjectName = () => {
  const parents = ["Node Capstone", "React Tutorial", "Clean Garage"];
  return parents[Math.floor(Math.random() * parents.length)];
}

const generateTime = () => {
  const hours = Math.floor(Math.random() * 24);
  let minutes = Math.floor(Math.random() * 60);
  if (minutes.toString().length === 1) {
    minutes = `0${minutes}`
  }
  return `${hours}:${minutes}`
}

const generateTaskLogEntry = () => {
  return {
    startTime: generateTime(),
    endTime: generateTime()
  }
}

const generateMasterLogEntry = () => {
  return {
    startTime: generateTime(),
    endTime: generateTime(),
    taskName: faker.lorem.word()
  }
}

const generateDataArray = (callback, maxLength) => {
  let arr = [];
  for (let i = 0; i < Math.random() * maxLength + 1; i++) {
    arr.push(callback())
  }
  return arr
}

const generateTask = () => {
  return {
    taskName: faker.lorem.word(),
    total: Math.floor(Math.random()*20),
    log: generateDataArray(generateTaskLogEntry, 2)

  }
}

const generateProject = () => {
  return {
    projectName: faker.lorem.word(),
    tasks: generateDataArray(generateTask, 3),
  }
}

const seedProjectData = () => {
  const seedData = {
    projects: generateDataArray(generateProject, 2),
    masterLog: generateDataArray(generateMasterLogEntry, 2)
  }

  return PomTracker.insertMany(seedData);
}

//seedProjectData()

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}


function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
