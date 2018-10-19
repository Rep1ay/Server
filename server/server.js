const express = require('express')
const bodyParser = require('body-parser');

const cors = require('cors');
const api = require('./routes/api')
const app = express()
const PORT = process.env.PORT || '3000';

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(cors())
app.use(bodyParser.json())

app.use('/api', api)

app.get('/', function(req, res){
    res.send('Hello from server')
})

app.listen(PORT, function(){
    console.log('Server running on' + PORT)
})