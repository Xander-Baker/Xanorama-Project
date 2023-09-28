# Xanorama-Project
<h1>The Xanorama</h1>

<p>This project is a ticket booking style webpage to book cinema tickets. The user can select a seat in the room and view it in a 3D virtual environment. Occupied seats are also shown in the 3D environment. The screens number of rows and columns are loaded in from a JSON file, as well as which seats are occupied. A 2D and 3D mapping of the seats is then generated from this data. The user can “Book” their selected seat by pressing the “Book Ticket” button. On doing this, their seat is added to the JSON file as an occupied seat, and will appear as so when reloading the 2D or 3D mapping. The website was created using standard HTML, CSS, and JavaScript. The 3D environment was created using the Three.JS library for JavaScript. Communication between the frontend and backend was made possible using the express library for JavaScript. This server serves requests for data from the JSON file.</p>

<h2>Video Demo</h2>
<iframe width="443" height="240" src="https://www.youtube.com/embed/xAR4VPRN9e0" title="The Xanorama - Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<h2>How to Run</h2>
<p>Open a new command prompt window at the projects directory and run the command “node server.js”. After this open “localhost:3000” in a browser.</p>

<h2>How to Use</h2>
<p>Select a screen from the drop-down box and click “view”. This will generate a 2D mapping of the selected screen. From here, select a seat from the 2D map. To the right, a button will appear labelled “View in 3D”. Click this to view the seat position in a virtual environment. Press “esc” to free your mouse from pointer controls, then click the “x” in the top right to return to the seat selection screen. From here, press “Book Ticket” to save the selected seat to the JSON file. Clicking “Book Another Ticket” will allow you to repeat the process.</p>
