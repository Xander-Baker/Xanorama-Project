//Import three.js from web link
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { PointerLockControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/PointerLockControls.js';

let numOfRows = 0;
let numOfCols = 0;
let gap = 0;
let occupiedSeats = [];
let occupiedSeats3D = [];
let requestId;
let scene, camera, renderer, controls;
let cinemaSeatMeshes = Array(numOfRows).fill().map(() => Array(numOfCols).fill(null));
let seats = [];


let selectedSeat = {row: null, col: null};
document.getElementById('selectedSeat').innerHTML = "No seat selected";
showOpenBtn();

function showOpenBtn() {
    if (selectedSeat.row !== null) {
        document.getElementById('openBtn').style.display = 'block';
    } else {
        document.getElementById('openBtn').style.display = 'none';
    }
}

function bookButton(){
    if(selectedSeat.row !== null){
        document.getElementById('buyBtn').classList.remove('disabled');
        document.getElementById('buyBtn').onclick = function() {
            buyTicket();
        };
    } else {
        document.getElementById('buyBtn').classList.add('disabled');
        document.getElementById('buyBtn').onclick = null;
    }
}


window.loadScreen = function loadScreen() {
    selectedSeat = {row: null, col: null};
    document.getElementById('selectedSeat').innerHTML = "No seat selected";
    showOpenBtn();
    bookButton();
    let screenNum = document.getElementById('screenChoice').value;
    fetch(`/api/seats/${screenNum}`)
    .then(res => res.json())
    .then(data => {
        seats = data.screenSeats;
        numOfRows = data.screenInfo[0];
        numOfCols = data.screenInfo[1];
        gap = data.screenInfo[2];
        occupiedSeats = data.occupiedSeats;
        occupiedSeats3D = occupiedSeats.map(([row, col]) => [row, (col+1) - Math.floor((col+1) / (gap+1)) - 1]);
        updateSeatMap();
        
    });
}

function updateSeatMap() {
    const seatMapContainer = document.getElementById('seatMapContainer');
    const seatMap = document.getElementById('seatMap');
    if (document.getElementById('noScreen')){
        seatMapContainer.removeChild(document.getElementById('noScreen'));
    }
    seatMap.innerHTML = '';
    const screen = document.createElement('div');
    screen.className = 'mapScreen';
    seats.forEach((row, rowIndex) => {
        const rowElement = document.createElement('tr');
        row.forEach((seat, colIndex) => {
            const seatElement = document.createElement('td');
            seatElement.className = seat || 'gap';
            seatElement.onclick = function() {
                if (seat === 'available') {
                    if (selectedSeat.row !== null) {
                        seats[selectedSeat.row][selectedSeat.col] = 'available';
                    }
                    seats[rowIndex][colIndex] = 'selected';
                    selectedSeat = {row: rowIndex, col: colIndex};
                    document.getElementById('selectedSeat').innerHTML = `Row: ${rowIndex + 1} - Seat: ${(colIndex+1) - Math.floor((colIndex+1) / (gap+1))}`;
                    showOpenBtn();
                    bookButton();
                }
                updateSeatMap();
            };
            rowElement.appendChild(seatElement);
        });
        seatMap.appendChild(rowElement);
    });
}

window.buyTicket = function buyTicket(){
    const screenNum = document.getElementById('screenChoice').value;
    const seatNum = [selectedSeat.row, selectedSeat.col];
    console.log(screenNum);
    console.log(seatNum);
    const data = {
        screen: screenNum,
        seat: seatNum
    };
    console.log(data);

    fetch('/buyTicket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        ticketBought();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
};




function ticketBought(){
    let screenNum = document.getElementById('screenChoice').value;
    document.getElementById('seatMenu').removeChild(document.getElementById('seatMapMenu'));
    document.getElementById('seatMenu').removeChild(document.getElementById('seatSelection'));
    document.getElementById('seatMenu').removeChild(document.getElementById('buyTicket'));
    document.getElementById('seatMenu').removeChild(document.getElementsByClassName('vl')[0]);
    document.getElementById('seatMenu').removeChild(document.getElementsByClassName('vl')[0]);
    
    let ticketBoughtDiv = document.createElement('div');
    ticketBoughtDiv.id = 'ticketBought';
    ticketBoughtDiv.innerHTML = "<h1>You have successfully booked seat " + ((selectedSeat.col+1) - Math.floor((selectedSeat.col+1) / (gap+1))) + " on row " + (selectedSeat.row+1) + " for Screen " + screenNum + "</h1>";
    document.getElementById('seatMenu').appendChild(ticketBoughtDiv);

    let backToMenuBtn = document.createElement('button');
    backToMenuBtn.id = 'backToMenuBtn';
    backToMenuBtn.innerHTML = 'Book Another Ticket';
    document.getElementById('seatMenu').appendChild(backToMenuBtn);
    document.getElementById('backToMenuBtn').onclick = function() {
        window.location.href = 'index.html';
    };
    document.getElementById('seatMenu').style.flexDirection = 'column';
}

function createCinemaSeat() {
    const seatStandGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const seatGeometry = new THREE.BoxGeometry(1, 0.2, 1);
    const seatCushionGeometry = new THREE.BoxGeometry(0.9, 0.05, 0.9);
    const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x101010 });
    const cushionMaterial = new THREE.MeshLambertMaterial({ color: 0x941515 });
    const seatStand = new THREE.Mesh(seatStandGeometry, seatMaterial);
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 0.325, 0);
    seatStand.add(seat);
    const seatCushion = new THREE.Mesh(seatCushionGeometry, cushionMaterial);
    seatCushion.position.set(0, 0.45, 0);
    seatStand.add(seatCushion);

    const backGeometry = new THREE.BoxGeometry(1, 1.25, 0.15);
    const backCushionGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.05);
    const backCushion = new THREE.Mesh(backCushionGeometry, cushionMaterial);
    backCushion.position.set(0, 1, 0.45);
    seatStand.add(backCushion);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0, 0.85, 0.55);
    seatStand.add(back);

    const armRestGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.9);
    const armRest1 = new THREE.Mesh(armRestGeometry, seatMaterial);
    armRest1.position.set(0.6, 0.8, 0.1);
    seatStand.add(armRest1);
    const armRest2 = new THREE.Mesh(armRestGeometry, seatMaterial);
    armRest2.position.set(-0.6, 0.8, 0.1);
    seatStand.add(armRest2);

    return seatStand;
  }


function generateCinemaSeats(rows, cols, seatSpacing, occupiedSeats) {
    cinemaSeatMeshes = [];
    const seats = new THREE.Group();
    for (let i = 0; i < rows; i++) {
        let xOffset = 0;
        let seatRow = [];
        for (let j = 0; j < cols; j++) {
        if (j % gap == 0 && j != 0) {
            xOffset += seatSpacing;
        }
        const seat = createCinemaSeat();
        seat.position.set(
            j * seatSpacing + xOffset - (cols * seatSpacing) / 2,
            0,
            i * seatSpacing
        );
        seats.add(seat);
        const seatIsOccupied = occupiedSeats.some(([row, col]) => row === i && col === j);
        if (seatIsOccupied) {
            const bodyGeometry = new THREE.BoxGeometry(0.75, 1.25, 0.55);
            const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x909090 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            const headGeometry = new THREE.SphereGeometry(0.4, 36, 36);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 1.05, 0);
            body.add(head);
            body.position.set(0, 1, 0); 
            seat.add(body);
        }
        seatRow.push(seat);
        }
        cinemaSeatMeshes.push(seatRow);
    }
    return seats;
}

function generateEnvironment(numOfRows, numOfCols, seatSpacing){
    const environment = new THREE.Group();
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    environment.add(floor);
    const screenGeometry = new THREE.PlaneGeometry(35, 30);
    const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = -10;
    environment.add(screen);
    const walls = new THREE.Group();
    const wallGeometry = new THREE.BoxGeometry(100, 40, 1);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x202020 });
    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.position.z = -12;
    wall1.position.y = 20;
    walls.add(wall1);
    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.position.z = 30;
    wall2.position.y = 20;
    walls.add(wall2);
    const wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall3.position.x = -25;
    wall3.position.y = 20;
    wall3.rotation.y = Math.PI / 2;
    walls.add(wall3);
    const wall4 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall4.position.x = 25;
    wall4.position.y = 20;
    wall4.rotation.y = Math.PI / 2;
    walls.add(wall4);
    environment.add(walls);
    const ceilingGeometry = new THREE.BoxGeometry(100, 10, 100);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0x202020 });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 25;
    environment.add(ceiling);
    return environment;
}

var modal = document.getElementById('cinemaModal');
var modalContent = document.getElementById('modalContent');
var btn = document.getElementById("openBtn");
var span = document.getElementById("closeBtn");

btn.onclick = function() {
    modal.style.display = "block";
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(modalContent.clientWidth, modalContent.clientHeight);
    modalContent.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);
    const cinemaSeats = generateCinemaSeats(numOfRows, numOfCols, 2, occupiedSeats3D);
    scene.add(cinemaSeats);
    const environment = generateEnvironment(numOfRows, numOfCols, 2);
    scene.add(environment);

    let row = selectedSeat.row, col = (selectedSeat.col) - Math.floor((selectedSeat.col+1) / (gap+1));
    camera.position.copy(cinemaSeatMeshes[row][col].position);
    camera.position.y += 1.6;
    controls = new PointerLockControls(camera, renderer.domElement);
    document.addEventListener('click', function () {
    controls.lock();
    }, false);

    function animate() {
        renderer.render(scene, camera);
        requestId = requestAnimationFrame(animate);
    }
    animate();
}

span.onclick = function() {
    modal.style.display = "none";
    modalContent.removeChild(renderer.domElement);
    cleanupThreeJS();
    document.removeEventListener('click', function () {
        controls.lock();
    }, false);
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        modalContent.removeChild(renderer.domElement);
        cleanupThreeJS();
        document.removeEventListener('click', function () {
            controls.lock();
        }, false);

    }
}

function cleanupThreeJS() {
    scene.traverse(function(node){
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
            if (node.material.length) {
                for(let i=0; i<node.material.length; ++i) {
                    if(node.material[i].map) node.material[i].map.dispose();
                    node.material[i].dispose();
                }
            }
            else {
                if(node.material.map) node.material.map.dispose();
                node.material.dispose();
            }
        }
    });
    
    if (requestId) {
        cancelAnimationFrame(requestId);
    }

    if (scene) {
        scene = null;
    }

    if (renderer) {
        renderer.dispose();
        renderer = null;
    }

    if (controls) {
        controls.dispose();
        controls = null;
    }

    if (camera) {
        camera = null;
    }
}