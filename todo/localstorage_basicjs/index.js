'use strict'
const { readFile } = require('fs').promises;
const express = require('express')

// Create the express app
const app = express()

// Routes and middleware
// app.use(/* ... */)
// app.get(/* ... */)

app.get('/', async (req, res) => {
  res.send(
      await readFile('./home.html', 'utf-8')
          .catch(err => 'Sorry, try again later\n' + err)
          .finally(() => console.log('done'))
      );
});

// Error handlers
app.use(function fourOhFourHandler (req, res, next) {
  res.status(404).send('404')
  // console.log(req)
  // next()
})
app.use(function fiveHundredHandler (err, req, res, next) {
  console.error(err)
  res.status(500).send()
})



// Start server
var port = process.env.PORT || 3000;
app.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Started at http://localhost:${port}/`)
})
