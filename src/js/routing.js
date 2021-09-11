import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import Polyline from 'ol/format/Polyline';
import { transform } from 'ol/proj';
import { format } from 'ol/coordinate';
import { map } from './index';
import proj4 from 'proj4';

var api_key = '5b3ce3597851110001cf62485da9cd20dc0a419d9aabcbd6006d3844';

var waypoints = document.getElementById("waypoints");
var waypoint_add = document.getElementById("waypoint-add");
var waypoint_remove = document.getElementById("waypoint-remove");
var waypoint_up = document.getElementById("waypoint-up");
var waypoint_down = document.getElementById("waypoint-down");
var route_get = document.getElementById("route-get");
var route_zoom = document.getElementById("route-zoom");
var route_remove = document.getElementById("route-remove");
var route_info = document.getElementById("route-info");
var distance = document.getElementById("distance");
var time = document.getElementById("time");
var mouseLon = document.getElementById("mouseLon");
var mouseLat = document.getElementById("mouseLat");
var option_event = document.getElementById("mode");

let routeCoords;
var coords = [];
const source = new VectorSource();
let routeLayer;
var firstProjection = 'EPSG:4326';
var secondProjection = 'EPSG:3857';

/* Auswahl des Fortbewegungsmittel */
var chose_option = document.getElementById("mode").value; 
var api_option = 'https://api.openrouteservice.org/v2/directions/' + chose_option;
var route_icon = 'images/' + chose_option + '.png';

/* Anfage abhängig vom Eventlistener */
option_event.addEventListener("click", (e) => {
	chose_option = document.getElementById("mode").value; 
	api_option = 'https://api.openrouteservice.org/v2/directions/' + chose_option;
	route_icon = 'images/' + chose_option + '.png';
});

// Hilfsfunktionen
function listboxMove(listbox, direction) {
	var selIndex = listbox.selectedIndex;
	if (-1 == selIndex) {
		alert("Please select an option to move.");
		return;
	}
	var increment = -1;
	if (direction == 'up')
		increment = -1;
	else
		increment = 1;
	if ((selIndex + increment) < 0 ||
		(selIndex + increment) > (listbox.options.length - 1)) {
		return;
	}
	var selValue = listbox.options[selIndex].value;
	var selText = listbox.options[selIndex].text;
	listbox.options[selIndex].value = listbox.options[selIndex + increment].value
	listbox.options[selIndex].text = listbox.options[selIndex + increment].text
	listbox.options[selIndex + increment].value = selValue;
	listbox.options[selIndex + increment].text = selText;
	listbox.selectedIndex = selIndex + increment;
}

function removeOptions(selectElement) {
    while (selectElement.options.length) {
        selectElement.remove(0);
    }
}


// Routing
function routing_click(event) {
	let coord3857 = event.coordinate;
	let coord4326 = transform(coord3857, 'EPSG:3857', 'EPSG:4326');

	mouseLon.innerText = format(coord4326, "{x}", 6);
	mouseLat.innerText = format(coord4326, "{y}", 6);
}

// Waypoint zur Route hinzufügen
waypoint_add.addEventListener("click", (e) => {
	let lat = mouseLat.textContent
	let lon = mouseLon.textContent;
	let pos = lon + "," + lat;
	let option = document.createElement("option");
	option.text = pos;
	option.value = pos;
	waypoints.add(option);
});

// Waypoint entfernen
waypoint_remove.addEventListener("click", (e) => {
	waypoints.remove(waypoints.selectedIndex);
});

// Waypoint mit Doppelklick entfernen
waypoints.addEventListener("dblclick", (e) => {
	waypoints.remove(waypoints.selectedIndex);
});

// Waypoint up
waypoint_up.addEventListener("click", (e) => {
	listboxMove(waypoints, "up");
});

// Waypoint down
waypoint_down.addEventListener("click", (e) => {
	listboxMove(waypoints, "down");
});

// Route entfernen
route_remove.addEventListener("click", (e) => {
	removeOptions(waypoints);
	distance.textContent = "";
	time.textContent = "";
	map.removeLayer(routeLayer);
});

// Zoom to Route-Layer
route_zoom.addEventListener("click", (e) => {
	let layerExtent = routeLayer.getSource().getExtent();
	map.getView().fit(layerExtent, map.getSize());
});

// Route berechnen
route_get.addEventListener("click", (e) => {
	map.removeLayer(routeLayer);
	var w = Array();
	for (let i=0; i<waypoints.options.length; i++) {
		w.push("[" + waypoints.options[i].value + "]");
	}
	var wps = '{"coordinates":[' + w.join(",") + "]}";

	fetch(api_option, {
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': api_key
		},
		body: wps
	})
	.then( response => response.json() )
	.then( data => {
		
		
		let polyline = data.routes[0].geometry;
	
		let	route = new Polyline({
			factor: 1e5 
		}).readGeometry(polyline, {
			featureProjection: 'EPSG:3857',
			dataProjection: 'EPSG:4326'
		});
		routeCoords = route.getCoordinates();

		/* Koordinatentransformation für die Tagesetappen!! */
		for (let i=0; i<routeCoords.length; i++) {
			coords.push(proj4(secondProjection,firstProjection,[routeCoords[i][0], routeCoords[i][1]]));
		} 

		let routeLength = routeCoords.length;
		let routeFeature = new Feature({
			type: 'route',
			geometry: route
		});

		let startIcon = new Feature({
			type: 'start',
			geometry: new Point(routeCoords[0])
		});

		let endIcon = new Feature({
			type: 'finish',
			geometry: new Point(routeCoords[routeLength - 1])
		});
		

		let styles = {
			'route': new Style({
				stroke: new Stroke({
					width: 6, color: [0, 0, 0, 0.8]
				})
			}),
			'start': new Style({
				image: new Icon({
					anchor: [0.5, 1],
					scale: 0.5,
					src: route_icon
				})
			}),
			'finish': new Style({
				image: new Icon({
					anchor: [0.5, 1],
					scale: 0.1,
					src: 'images/finish.png'
				})
			})
		};

		source.addFeature(routeFeature);
		source.addFeature(startIcon);
		source.addFeature(endIcon);
		routeLayer = new VectorLayer({
			visible: true,
			source: source,
			style: (feature) => {
				return styles[feature.get('type')];
			}
		});

		map.addLayer(routeLayer);
		
		distance.textContent = Math.round(data.routes[0].summary.distance/100)/10 + ' km';
		let ttime = data.routes[0].summary.duration;
		let sek = ttime % 60;
		let min = ((ttime - sek) / 60) % 60;
		let std = (((ttime - sek) / 60) - min) / 60;
		let totalTime = ('00'+std).slice(-2) + 'h ' + ('00'+min).slice(-2) + 'min ' + ('00'+sek).slice(-2) + 's';
		time.textContent = totalTime;
	})
	.catch( error => {
		route_info.textContent = error;
	});
});


export {coords};
export { routing_click }
