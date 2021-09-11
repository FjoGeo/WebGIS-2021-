import 'ol/ol.css';
import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style, Icon} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import { elastic } from './nominatim';
import { map } from './index';
import {fromLonLat} from 'ol/proj';

var own_coord = document.getElementById("demo");
var bewegen_nach = document.getElementById("bewegen__nach");
var current_lat;
var current_lon;

const view = new View({
    center: [0, 0],
    zoom: 2,
  });

const geolocation = new Geolocation({
    // enableHighAccuracy must be set to true to have the heading value.
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: view.getProjection(),
  });

  function el(id) {
    return document.getElementById(id);
  }

 
// update the HTML page when the position changes.
geolocation.on('change', function () {
    el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
    el('altitude').innerText = geolocation.getAltitude() + ' [m]';
    el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
    el('heading').innerText = geolocation.getHeading() + ' [rad]';
    el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
  });
  
  // handle geolocation error.
  geolocation.on('error', function (error) {
    const info = document.getElementById('info');
    info.innerHTML = error.message;
    info.style.display = '';
  });

  const accuracyFeature = new Feature();
  geolocation.on('change:accuracyGeometry', function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });


const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
      }),
      image: new Icon({
        src: 'images/location-heading.svg',
        imgSize: [27, 55],
        rotateWithView: true
      })
  })
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});


const location_temp = new VectorLayer({
    id: 'location',
    title: 'Position',
    visible: true,
    source: new VectorSource({
        features: [accuracyFeature, positionFeature],
      }),
  });

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      own_coord.innerHTML = "Geolocation is not supported by this browser.";
    }
  }
  
  function showPosition(position) {
    own_coord.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
    current_lat = position.coords.latitude;
    current_lon = position.coords.longitude;
  }

  /* Eventlistener für Checkbox */
  el('track').addEventListener('change', function () {
    geolocation.setTracking(this.checked);
    getLocation();
  });

  /* Zur Position bewegen */
  bewegen_nach.addEventListener("click", (e) => {
    map.getView().animate({
        center: fromLonLat([current_lon, current_lat]),
        zoom: 10,
        duration: 2000,
        easing: elastic,
    });
});

export {location_temp};
