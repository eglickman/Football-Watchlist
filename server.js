require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;


//Connect to MongoDB using mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB..."))
    .catch(err => console.error("Could not connect to Mongo", err));

//define mongoose schema
const playerSchema = new mongoose.Schema({
    playerName: { type: String },
    team: { type: String },
    position: { type: String },
    backgroundInfo: { type: String },
});
const Player = mongoose.model("Player", playerSchema)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


app.get('/', async (req, res) => {
    res.render("index");
});

app.get('/add_player', (req, res) => {
    res.render("add_player");
});

app.post("/add_player", async (req, res) => {
    let {name, backgroundInfo} = req.body;
    baseURL = `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${name}`;
    try {
        let response = await fetch(baseURL);
        let data = await response.json();
        let playerName = data.player[0].strPlayer;
        let team = data.player[0].strTeam;
        let position = data.player[0].strPosition;
        //console.log(playerName + team + position);
        const doc = new Player({playerName, team, position, backgroundInfo});
        await doc.save();
        res.render("successful_add", { playerName: playerName });
    } catch (e) {
        console.log(e);
        res.render("error_add");
    } 
});

app.get('/view_watchlist', async (req, res) => {
    const players = await Player.find({})
    res.render("view_watchlist",{ players })
})

app.post('/clear', async (req, res) => {
    const players = await Player.deleteMany({});
    res.redirect("/view_watchlist");
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});