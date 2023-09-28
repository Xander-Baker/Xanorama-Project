const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

function occupiedCheck(occupiedSeats, i, j){
    for(let k = 0; k < occupiedSeats.length; k++){
        if(occupiedSeats[k][0] == j && occupiedSeats[k][1] == i){
            return true;
        }
    }
    return false;
}

function getScreenData(screenNum){
    return new Promise((resolve, reject) => {
        fs.readFile('screens.json', 'utf8', (err, data) => {
            if(err) {
                reject(err);
            } else {
                const screens = JSON.parse(data).screens;
                let screenInfo = [];
                let screenSeats = [];
                let occupiedSeats = [];
            
                screenInfo.push(screens[screenNum].rows);
                screenInfo.push(screens[screenNum].columns);
                screenInfo.push(screens[screenNum].gap);
                occupiedSeats = screens[screenNum].occupied;

                screenSeats = Array(screenInfo[0]).fill().map((_, j) => {
                    const totalCols = screenInfo[1] + Math.floor(screenInfo[1] / screenInfo[2]);
                    const row = [];
                    for (let i = 0; i < totalCols; i++) {
                        if ((i + 1) % (screenInfo[2] + 1) === 0) {
                            row.push(null);
                        } else {
                            if(occupiedCheck(occupiedSeats, i, j)){
                                row.push('occupied');
                            } else{
                                row.push('available');
                            }
                        }
                    }
                    return row;
                });

                resolve({screenInfo, screenSeats, occupiedSeats});
            }
        });
    });
}


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/seats/:screenNum', async function(req, res) {
    try {
        const screenData = await getScreenData(req.params.screenNum);
        res.json(screenData);
    } catch(err) {
        res.status(500).send(err);
    }
});

app.post('/buyTicket', (req, res) => {
    const screen = req.body.screen;
    const seat = req.body.seat;
    
    fs.readFile('screens.json', 'utf8', (err, data) => {
        if(err) throw err;

        const screens = JSON.parse(data);
        screens.screens[screen].occupied.push(seat);

        fs.writeFile('screens.json', JSON.stringify(screens, null, 2), (err) => {
            if (err) throw err;
        });
    });

    res.json({ status: 'success' });
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('App listening on port ' + port);
});