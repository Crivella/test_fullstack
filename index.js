// console.log(process.env.USER);

// process.on('exit', function(){
//     console.log('exit');
// });

// const { EventEmitter } = require('events');
// const eventEmitter = new EventEmitter();

// eventEmitter.on('lunch', () => {
//     console.log('lunch');
// });

// eventEmitter.emit('lunch');
// eventEmitter.emit('lunch');

/*****************************************************************
// Read file synv vs async with callback
// const { readFile, readFileSync } = require('fs');
// console.log(txt);
// const txt = readFileSync('./hello.txt', 'utf-8');
// readFile('./hello.txt', 'utf-8', (err, txt) => {
//     console.log(txt);
// });
// console.log("end");
// */

/*****************************************************************
// Read file with promise
const { readFile } = require('fs').promises;
async function hello(){
    const txt = await readFile('./hello.txt', 'utf-8');
    console.log(txt);
}
hello();
console.log("end");
// */

// const myModule = require('./my-module');
// console.log(myModule);

const { readFile } = require('fs').promises;
const express = require('express');

const app = express();

app.get('/', async (req, res) => {
    res.send(
        await readFile('./home.html', 'utf-8')
            .catch(err => 'Sorry, try again later\n' + err)
            .finally(() => console.log('done'))
        );
});

app.get('/todo/basicjs', async (req, res) => {
    res.send(
        await readFile('./todo/basic_js.html', 'utf-8')
            .catch(err => 'Sorry, try again later\n' + err)
            .finally(() => console.log('done'))
        );
});

app.listen(process.env.PORT || 3000, () => console.log('Server is running on http://localhost:3000'));