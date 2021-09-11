import 'ol/ol.css';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import GeoJSON from 'ol/format/GeoJSON';
import { v4 as uuidv4 } from 'uuid';
import { map } from './index';

var save = document.getElementById("save");
var geom = document.getElementById("geom");
var type = document.getElementById("type");
var stop = document.getElementById("stop");
var start_drawing = document.getElementById("start_drawing");
var draw, snap;
var draw_temp = new VectorSource();

const vector_layer_temp = new VectorLayer({
    id: 'zeichnen',
    title: 'Zeichnen (PostgreSQL)',
    visible: true,
    source: draw_temp,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#eb0450',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#eb0450',
        }),
      }),
    }),
  });

export {vector_layer_temp};

/* Zeichnen und Snap aktivieren */
function addInteractions() {
    draw = new Draw({
        source: draw_temp,
        type: type.value
    });
    map.addInteraction(draw);
    snap = new Snap({
        source: draw_temp
    })
    map.addInteraction(snap);
}

export {addInteractions};

/* Änderung der Geometrie */
type.onchange = function() {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions();
}

/* Zeichnung abbrechen */
stop.addEventListener("click", function() {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
});

/* Zeichnung starten */
start_drawing.addEventListener("click", function() {
    addInteractions();
});

// Klick auf den Button 'Speichern'
save.addEventListener("click", function() {
    // geom-div-Inhalte löschen
    geom.innerHTML = "";

    // neues GeoJSON-Objekt erzeugen
    let formatGeoJSON = new GeoJSON();

    // alle gezeichneten Geometrien durchlaufen
    draw_temp.forEachFeature( (f) => {
        console.log(f.getGeometry());
        console.log(f.getGeometry().getCoordinates());
        console.log("ID: ", f.getId());

        if (f.getId() == undefined) {
            f.setId(uuidv4())
        }

        let featureGeoJSON = formatGeoJSON.writeFeature(f, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
            decimals: 6
        });
        let featureObj = JSON.parse(featureGeoJSON);
        console.log(featureGeoJSON);
        console.log(featureObj.geometry);

        const words = featureGeoJSON.replace('{"type":"Feature","geometry":{"type":', ' ').replace(/(},"properties":.+)/gm, ' ').replace(',', '\n').replaceAll('"', ' ');
        let featureDiv = document.createElement("textarea");
        featureDiv.append((words));
        geom.append(featureDiv);
        

        let data = {
            "uuid": f.getId(),
            "geometry": featureObj.geometry
        }

        fetch('http://localhost:8082/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(data)
        })
        .then( response => response.json() )
        .then(data => {
            console.log('Success: ', data);
        })
        .catch( (error) => {
            console.error('Error: ', error)
        });
    })
})