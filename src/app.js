const express = require('express');
const path = require('path');
const hbs = require('hbs');

const apiRoute = require('./api')

const app = express()
const port = 3000

// define path for express confing
const viewsPath = path.join(__dirname, '../frontend/views')
const partialsPath = path.join(__dirname, '../frontend/partials')

// setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// setup static directory to serve
app.use(express.static(
    path.join(__dirname, '../frontend')
))

app.use(express.json())
app.use(apiRoute)

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Twine Editor'
    })
})

app.listen(port, () => {
    console.log('Server is up on http://localhost:' + port);
})