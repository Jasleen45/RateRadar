const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const morgan = require('morgan'); 

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); 
app.use(morgan('dev')); 
const placesFilePath = path.join(__dirname, 'places.json');
const reviewsFilePath = path.join(__dirname, 'reviews.json');

const loadPlaces = () => {
    if (!fs.existsSync(placesFilePath)) {
        console.log("places.json file does not exist. Creating a new file.");
        return []; 
    }
    return JSON.parse(fs.readFileSync(placesFilePath)); 
};

const loadReviews = () => {
    if (!fs.existsSync(reviewsFilePath)) return {}; 
    return JSON.parse(fs.readFileSync(reviewsFilePath)); 
};

let places = loadPlaces(); 
let reviews = loadReviews();

app.get('/', (req, res) => {
    console.log("Rendering home page with places:", places); 
    res.render('index', { places });
});

app.get('/place/:id', (req, res) => {
    const place = places.find(p => p.id == req.params.id);
    if (!place) return res.status(404).send('Place not found');
    const placeReviews = reviews[place.id] || [];
    res.render('place', { place, reviews: placeReviews });
});

app.post('/add-place', (req, res) => {
    const { name, location } = req.body;
    const newId = places.length ? places[places.length - 1].id + 1 : 1; 
    const newPlace = { name, location, id: newId }; 
    places.push(newPlace); 

    console.log("New place added:", newPlace);
    console.log("Updated places array:", places);

    fs.writeFileSync(placesFilePath, JSON.stringify(places, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to places.json:', err); 
        }
    });

    res.redirect('/'); 
});

app.post('/place/:id/review', (req, res) => {
    const { name, comment } = req.body;
    const placeId = req.params.id;
    if (!reviews[placeId]) reviews[placeId] = []; 
    reviews[placeId].push({ name, comment }); 

    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));

    res.redirect(`/place/${placeId}`); 
});



app.get('/search', (req, res) => {
    const query = req.query.q?.toLowerCase(); 
    if (!query) {
        return res.render('search', { place: null, reviews: [], notFound: false }); 
    }

    const place = places.find(p => p.name.toLowerCase().includes(query));
    if (place) {
        const placeReviews = reviews[place.id] || []; 
        res.render('search', { place, reviews: placeReviews, notFound: false }); 
    } else {
        res.render('search', { place: null, reviews: [], notFound: true }); 
    }
});

app.use((err, req, res, next) => {
    if (!err.status) {
        err.status = 500;
    }
    res.status(err.status).send(`
        <h1>Error ${err.status}</h1>
        <p>${err.message}</p>
        <a href="/">Back to Home</a>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});