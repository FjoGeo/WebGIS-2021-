# WebGIS - Trip Planner

<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/1.PNG" width="800" height="600">

## Table of Contents

1. Resources
2. Preparation
3. Basemaps and Layer
4. Coordinates and Bounding Box
5. Rent a Bike
6. Draw and Modify
7. Geolocation
8. Routing and Daily Stages
9. Export Map as PDF or PNG
10. Login


## 1. Resources used to create the WebGIS

Tutorials: 
 1. <a href="https://www.youtube.com/watch?v=3-2Pj5hxwrw">Basic HTML, CSS, JavaScript</a>
 2. <a href="https://www.youtube.com/watch?v=_bwgJFVY2zY">Flask and JWT</a>

Maps:
1.  <a href="https://openlayers.org/">OpenLayers</a>
2.  <a href="https://turfjs.org/">Turf.js</a>
3.  <a href="https://openrouteservice.org/">OpenRouteService</a>

CSS Design:
1. <a href="https://uigradients.com/#ManofSteel">uiGradients</a>
2. <a href="https://freefrontend.com/">freefrontend</a>  
3. <a href="https://fontawesome.com/">Font Awesome</a>  

Techstack:
- JavaScript
- Node.js + OpenLayers
- Python with Flask
- HTML
- CSS
- PostgreSQL


## 2. Preparation

Create a  local PostgreSQL <a href="https://github.com/FjoGeo/WebGIS/tree/master/Flask%20server%20und%20SQL/Datenbank">Database</a> for preparation and storage <br>
Start a local server with Python and <a href="https://github.com/FjoGeo/WebGIS/blob/master/Flask%20server%20und%20SQL/Flask%20server.py">Flask</a>


## 3. Basemaps and Layer

File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/layers.js">HERE</a> <br>
<br>The second icon contains a collection of Basemaps <br>
<img  src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/Basiskarten.PNG" width="200" height="300">
<br>The third and fouth icon contains a collection of Layers <br>
<img  src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/Layer.PNG" width="200" height="300">
<img  src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/Layer2.PNG" width="200" height="300">


## 4. Coordinates and Bounding Box

This menu shows the zoom level, coordinates and the bounding box. <br>
File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/info.js">HERE</a> <br>
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/Informationen_Koordinaten.PNG" width="200" height="300">

## 5. Rent a Bike

File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/stadtrad_postgres.js">HERE</a> <br>
This menu offers the option to store and delete stations, which are stored in a local DB. <br>
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/Stadtrad1.PNG" width="200" height="300"> <br>
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/Stadtrad2.PNG" width="800" height="600"> 


## 6. Draw and Modify

File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/draw_mod.js">HERE</a> <br>
- Draw Points, Lines and Ploygons. 
- Store each geometry in a separate table in PostgreSQL.
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/draw_1.PNG" width="200" height="300">


<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/draw_2.PNG" width="800" height="600">

## 7. Geolocation


File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/geolocation.js">HERE</a> <br>
- Get your location
- Move the map to your location

<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/geolocation_1.PNG" width="200" height="300"> <img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/geolocation_2.PNG" width="200" height="300">
<br>
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/geolocation_4.PNG" width="800" height="600">

## 8. Routing and Daily Stages

File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/routing.js">HERE</a> <br>

- Plan your route with <a href="https://openrouteservice.org/">OpenRouteService</a>
- Chose between bike, car or on foot
- Calculate daily stages 

<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/routing_1.PNG" width="200" height="300">

<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/routing_2.PNG" width="800" height="600">
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/routing_3.PNG" width="800" height="600">

## 9. Export

File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/export_map.js">HERE</a> <br>
- Export your Map as Image or as PDF in various sizes
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/download_1.PNG" width="200" height="300">

## 10. Secure Login with JWT

File:  <a href="https://github.com/FjoGeo/WebGIS/blob/master/src/js/pop_up_extra.js">HERE</a> <br>
- Use the Login to unlock additional options
<img src="https://github.com/FjoGeo/WebGIS/blob/master/images/img/login_1.PNG" width="200" height="300">
