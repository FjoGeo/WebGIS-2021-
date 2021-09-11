import {fromLonLat} from 'ol/proj';
import { map } from './index';

var url = 'https://nominatim.openstreetmap.org/search?format=geojson&q=';

var formNominatim = document.getElementById("formNominatim");
var queryNominatim = document.getElementById("queryNominatim");
var nominatimSuche = document.getElementById("nominatimSuche");
var nominatimMessage = document.getElementById("nominatimMessage");
var nominatimPlaces = document.getElementById("nominatimPlaces");
var nominatimView = document.getElementById("nominatimView");
var bounce_bounce = document.getElementById("nominatimVieww");
var elastic_elastic = document.getElementById("nominatimViewww");
var delete_search = document.getElementById("delete_search");


function removeOptions(selectElement) {
    while (selectElement.options.length) {
        selectElement.remove(0);
    }
}


function flyTo(location, done) {
    location = fromLonLat([parseFloat(location[0]), parseFloat(location[1])]);
    var duration = 2000;
    var view = map.getView();
    var zoom = view.getZoom();
    var parts = 2;
    var called = false;
    function callback(complete) {
        --parts;
        if (called) {
            return;
        }
        if (parts === 0 || !complete) {
            called = true;
            done(complete);
        }
    }
    view.animate(
        {
            center: location,
            duration: duration,
        },
        callback
    );
    view.animate(
        {
            zoom: zoom - 3,
            duration: duration / 2,
        },
        {
            zoom: zoom,
            duration: duration / 2,
        },
        callback
    );
};

/* Eingabe löschen */
delete_search.addEventListener("click", (e) => {
    e.preventDefault();
    queryNominatim.value = "";
    removeOptions(nominatimPlaces);
});

nominatimSuche.addEventListener("click", (e) => {
	e.preventDefault(); /* Verhindert neustart */
    removeOptions(nominatimPlaces);
    let query = queryNominatim.value;
    fetch(url + query, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
    .then( response => response.json() )
    .then( data => {
        let coordinates = data.features[0].geometry.coordinates;
        let display_name = data.features[0].properties.display_name;
		setTimeout(removeMessage, 5000);

        data.features.forEach(element => {
            let option = document.createElement("option");
            option.text = element.properties.display_name;
            option.value = element.geometry.coordinates;
            nominatimPlaces.add(option);            
        });
    })
    .catch( (error) => {
        nominatimMessage.innerHTML = error;
        setTimeout(removeMessage, 5000);
    });
});

nominatimView.addEventListener("click", (e) => {
    let coordinates = nominatimPlaces.options[nominatimPlaces.selectedIndex].value.split(",")
    map.getView().animate({
        center: fromLonLat([parseFloat(coordinates[0]), parseFloat(coordinates[1])]),
        zoom: 16,
        duration: 2000,
    });
});

/* Eventlistener für Doppelcklick auf Ort */
nominatimPlaces.addEventListener("dblclick", (e) => {
    let coordinates = nominatimPlaces.options[nominatimPlaces.selectedIndex].value.split(",")
    flyTo(coordinates, function () {});
});

// Meldung löschen
function removeMessage() {
    nominatimMessage.innerHTML = "";
};

function bounce(t) {
    const s = 7.5625;
    const p = 2.75;
    let l;
    if (t < 1 / p) {
      l = s * t * t;
    } else {
      if (t < 2 / p) {
        t -= 1.5 / p;
        l = s * t * t + 0.75;
      } else {
        if (t < 2.5 / p) {
          t -= 2.25 / p;
          l = s * t * t + 0.9375;
        } else {
          t -= 2.625 / p;
          l = s * t * t + 0.984375;
        }
      }
    }
    return l;
  };

  function elastic(t) {
    return (
      Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
    );
  }

  /* bounce move */
  bounce_bounce.addEventListener("click", (e) => {
    let coordinates = nominatimPlaces.options[nominatimPlaces.selectedIndex].value.split(",")
    map.getView().animate({
        center: fromLonLat([parseFloat(coordinates[0]), parseFloat(coordinates[1])]),
        zoom: 16,
        duration: 2000,
        easing: bounce,
    });
});

/* elastic move */
elastic_elastic.addEventListener("click", (e) => {
    let coordinates = nominatimPlaces.options[nominatimPlaces.selectedIndex].value.split(",")
    map.getView().animate({
        center: fromLonLat([parseFloat(coordinates[0]), parseFloat(coordinates[1])]),
        zoom: 16,
        duration: 2000,
        easing: elastic,
    });
});
export {elastic};