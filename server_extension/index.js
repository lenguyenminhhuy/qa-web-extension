const express = require('express')
const bodyParser = require('body-parser')
var cors = require('cors')
const app = express()
const db = require('./queries')
const port = 3000


app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(require('body-parser').json()); 
app.use(require('body-parser').urlencoded({ extended: true }));

app.get('/', (request, response) => {
  response.json({ info: 'extension' })
})


app.post('/rating_answer', db.addBestAnswer)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})