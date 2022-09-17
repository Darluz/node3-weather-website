const path = require('path'); // core module of node for file path manipulation
const express = require('express'); // exposes a single function
const hbs = require('hbs');
const geocode = require("./utils/geocode");
const forecast = require("./utils/forecast");

console.log(__dirname); // gives the route information about where the file lives
console.log(__filename);// gives the route information about the actual file

const app = express(); // here we are creating our express application

// DEFINE PATHS FOR EXPRESS CONFIG
const publicDirectoryPath = path.join(__dirname, '../public'); // using the path module and function join to normalize the introduced path as we were writing in the command line
const viewsPath = path.join(__dirname, '../templates/views'); // defining a new path to views or templates folder
const partialsPath = path.join(__dirname, '../templates/partials');

// SETUP HANDLEBARS ENGINE AND VIEWS LOCATION
app.set('view engine', 'hbs'); // allows us to set a value for a given express setting, this case we are setting the module for use
app.set('views', viewsPath); // this setting is not required if we create the views directory in the root of the project
hbs.registerPartials(partialsPath); // telling to hbs where our partials are

// SETUP STATIC DIRECTORY TO SERVE
app.use(express.static(path.join(__dirname, '../public'))); // a way to customize the server, bringing static elements, not dynamic
// this will ensure that static resources like img or css will be detected when looking for them in files, even hbs types in views folder

app.get('', (req, res) => { // in this case, instead of send, using this will configure express to use and render with the view engine hbs
    res.render('index', { // this object is injecting values into the template
        title: 'Weather',
        name: 'Darío Luz'
    });
}) // it does not need the file extension, it will look after the views folder and render the matching file name

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Darío Luz'
    });
})

app.get('/help', (req, res) => {
    res.render('help', {
        helpText: 'This is some helpful text.',
        title: 'Help',
        name: 'Darío Luz'
    })
})

// app.get('/help', (req, response) => { // visiting this page will result in a json response back, express is going to detect that we provide an object and automatically stringify the json for us 
//     response.send([{
//         name: 'Darío'
//     }, {
//         name: 'Andrew'
//     }]);
// })

app.get('/weather', (req, res) => {
    if(!req.query.address){
        return res.send({
            error: 'You must provide an address!'
        })
    }

    geocode(req.query.address, (error, {latitude, longitude, location} = {}) => {
        if (error) {
            return res.send({ error })
        }
        forecast(latitude, longitude, (error, forecastData) => {
            if(error){
                return res.send({error})
            }

            res.send({
                forecast: forecastData,
                location,
                address: req.query.address
            })
        })
    })

    // res.send({
    //     forecast: 'It is snowing',
    //     location: 'Philadelphia',
    //     address: req.query.address
    // });
})

app.get('/products', (req, res) => {
    if(!req.query.search) {
        return res.send({
            error: 'You must provide a search term'
        })
    }

    res.send({
        products : []
    })
})

app.get('/help/*', (req, res) => { // matching a bunch of request that have an specific pattern
    res.render('404', {
        title: '404',
        name: 'Darío Luz',
        errorMessage: 'Help article not found.'
    })
})

app.get('*', (req, res) => { // * is a wild card that express provides to match anything that is not specified yet
    res.render('404', {
        title: '404',
        name: 'Darío Luz',
        errorMessage: 'Page not found'
    })
}) // this needs to come last (be the last app.get), to correctly compose the routes that express matches during a search (every call is tried against every route in the order specified)
 
app.listen(3000, () => {// starting the server up indicating the port in which will be deployed and the function to execute when the server initiate
    console.log('Server is up on port 3000.');
}); // using ctrl + C in command line, we can quit the execution 