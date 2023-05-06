'use strict'
const express = require('express')
const request = require('request-promise');

// Create the express app
const app = express()

// Routes and middleware
async function get_todos(req, res){
  const todo_data = request.get('http://localhost:8000/todo/api/');
  // console.log(todo_data)
  const list = JSON.parse(await todo_data)
    .map(e => `<li>${e.title}</li>`);
  // console.log(list)
  let html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Expressjs</title>
    </head>
    <body>
      <ul id="todos">
      ${list.join('\n')}
      </ul>
    </body>
  </html>
  `
  res.send(html);
}

// app.use(express.json());
app.get('/', get_todos);
// app.get('/', function (req, res) {
//   res.send('Hello, world!')
// })
// app.use(/* ... */)
// app.get(/* ... */)

// Error handlers
app.use(function fourOhFourHandler (req, res) {
  res.status(404).send()
})
app.use(function fiveHundredHandler (err, req, res, next) {
  console.error(err)
  res.status(500).send()
})

// Start server
const port = process.env.PORT || 3000
app.listen(port, function (err) {
  if (err) {
    return console.error(err)
  }

  console.log(`Started at http://localhost:${port}/`)
})
