import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Overlay from 'ol/Overlay';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import {Fill, Stroke, Text, Style, Icon} from 'ol/style';
import { transform } from 'ol/proj';
import { format } from 'ol/coordinate';

import { map } from './index';
import { stadtrad_source_postgres } from './layers';
import { none } from 'ol/centerconstraint';

var url_stadtrad_postgres = 'http://localhost:8082';

let draw, snap, modify; // global so we can remove them later

let feature;

let stadtrad_source_postgres_temp = new VectorSource();
let stadtrad_layer_postgres_temp = new VectorLayer({
	visible: true,
	source: stadtrad_source_postgres_temp,
	style: function(feature, resolution){
        let zoom = parseInt(map.getView().getZoomForResolution(resolution));
        let scale = 0.0039 * Math.pow(zoom, 1.488);
        
        return new Style({
            image: new Icon({
                anchor: [0.5, 1.0],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 0.7,
                scale: scale,
                src: '/images/stadtrad_new.svg'
            })
        });
	}
});

export { stadtrad_layer_postgres_temp };

// ---------------------------------------------------------------
// Menü-Funktionen
// ---------------------------------------------------------------

var formStadtrad = document.getElementById("formStadtrad");
var stadtradSpeichern = document.getElementById("stadtradSpeichern");
var stadtradControlNone = document.getElementById("stadtradControlNone");
var stadtradControlDraw = document.getElementById("stadtradControlDraw");
var stadtradControlModify = document.getElementById("stadtradControlModify");
var stadtradControlDelete = document.getElementById("stadtradControlDelete");
var stadtradStation = document.getElementById("stadtradStation");
var stadtradName = document.getElementById("stadtradName");
var stadtradLongitude = document.getElementById("stadtradLongitude");
var stadtradLatitude = document.getElementById("stadtradLatitude");
var stadtradMessage = document.getElementById("stadtradMessage");

/* Keine Aktion */
stadtradControlNone.addEventListener("click", function() {
    stadtradControlDraw.disabled = false;
    stadtradControlModify.disabled = false;
    stadtradControlDelete.disabled = false;
    formStadtrad.style.display = "none";
    removeInteractions();
	stadtrad_source_postgres_temp.clear();
});

// DRAW: Formular wird angezeigt und createStadtrad aufgerufen
stadtradControlDraw.addEventListener("click", function() {
    stadtradControlModify.disabled = true;
    stadtradControlDelete.disabled = true;
    formStadtrad.style.display = "block";
    stadtradStation.readOnly = false;
    removeInteractions();
	clearForm();
	createStadtrad();
});

// MODIFY: Formular wird angezeigt und modify eingeschaltet
stadtradControlModify.addEventListener("click", function() {
    stadtradControlDraw.disabled = true;
    stadtradControlDelete.disabled = true;
    formStadtrad.style.display = "block";
    stadtradStation.readOnly = true;

    removeInteractions();
	clearForm();

	modify = new Modify({
        source: stadtrad_source_postgres
    });
	map.addInteraction(modify);
});

/* Station löschen */
stadtradControlDelete.addEventListener("click", function() {
    formStadtrad.style.display = "none";
	removeInteractions();
});


// ---------------------------------------------------------------
// Popup
// ---------------------------------------------------------------

// Features werden ermittelt, die sich an dem angklickten Pixel befinden.
// Die Attribute werden als Popup angezeigt.

function stadtrad_click_postgres(map, e) {
	feature = map.forEachFeatureAtPixel(e.pixel, (f, layer) => {
		// Dem feature-Objekt wird das Attribut layerTitle hinzugefügt.
		try {
			f.layerId = layer.get("id");
			return f;
		} catch (err) {}
	});

	if (feature) {
		if (feature.layerId == "stadtrad_postgres") {
            if (stadtradControlModify.checked) {
				updateStadtrad(feature);
			} else if (stadtradControlDelete.checked) {
				deleteStadtrad(feature);
			} else { // Popup-Fenster
                showPopup(feature);
			}
		}
	}
}

export { stadtrad_click_postgres };


// ---------------------------------------------------------------
// Erzeugen einer neuen Stadtrad-Station
// ---------------------------------------------------------------

function createStadtrad() {
	// Zeichnen einschalten
	draw = new Draw({
		source: stadtrad_source_postgres_temp, // Quelle des temporären Layers
		type: 'Point'
	});
	map.addInteraction(draw);
	
	// nach dem Beenden des Zeichnens
	draw.on('drawend', (e) => {
		// Zeichnen ausschalten
		map.removeInteraction(draw);
		
		// das gezeichnete Feature wurde an die Funktion übergeben
		var f = e.feature;
		// die Geometrie aus dem Feature extrahieren, weil die Koordinaten gebraucht werden
		var g = f.getGeometry();
		// in geographische Koordinaten transformieren
		var coord4326 = transform(g.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		// Koordinaten in das Formular eintragen
        stadtradLongitude.value = format(coord4326, '{x}', 6);
        stadtradLatitude.value = format(coord4326, '{y}', 6);
	}, this);
	
	// das Ändern der Lages des Punktes ermöglichen
	modify = new Modify({
		source: stadtrad_source_postgres_temp
	});
	map.addInteraction(modify);

	// nach dem Ändern
	modify.on('modifyend', (e) => {
		// alle Features werden übergeben ...
		let features = e.features;
		// ... daher wird nur das erste Feature extrahiert
		let g = features.item(0).getGeometry();
		// in geographische Koordinaten transformieren
		let coord4326 = transform(g.getCoordinates(), 'EPSG:3857', 'EPSG:4326');
		// Koordinaten in das Formular eintragen
        stadtradLongitude.value = format(coord4326, '{x}', 6);
        stadtradLatitude.value = format(coord4326, '{y}', 6);
	});
}

// ---------------------------------------------------------------
// Wenn im Stadtrad-Formular auf Speichern geklickt wird.
// ---------------------------------------------------------------

stadtradSpeichern.addEventListener("click", (e) => {
    //stadtradSpeichern.submit;
    
	// damit keine neue Seite geladen wird
	e.preventDefault();
	
	// Je nachdem welcher Menüpunkt ausgewählt wurde ...
	var url;
	// ... wird entweder eine neue Stadtrad-Station hinzugefügt oder ...
	if (stadtradControlDraw.checked) {
		url = url_stadtrad_postgres + '/fart';
	// die geänderten Daten einer bereits bestehenden Station gespeichert.
	} else if (stadtradControlModify.checked) {
		url = url_stadtrad_postgres + '/update';
	}

    let data = {
        "id": stadtradStation.value,
        "station": stadtradName.value,
        "longitude": stadtradLongitude.value,
        "latitude": stadtradLatitude.value
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
    })
    .then( response => response.json() )
    .then( data => {
		// Meldung, dass die Daten gespeichert/geändert wurden, werden vom Server geliefert
        stadtradMessage.innerHTML = data.message;

        // Wenn eine neue Stadtrad-Station erstellt wurde, dann ...
        if ( stadtradControlDraw.checked && data.status ) {
            // ... wird das Feature dem Stadtrad-Layer hinzugefügt und ...
            var coordinate = [ stadtradLongitude.value, stadtradLatitude.value ];
            var f = stadtrad_source_postgres_temp.getClosestFeatureToCoordinate(coordinate);
            // ... die Properties mit den Werten aus dem Formular befüllt.
            f.setProperties({
                'id': stadtradStation.value,
                'station': stadtradName.value,
                'longitude': stadtradLongitude.value,
                'latitude': stadtradLatitude.value
            });
            f.id_ = stadtradStation.value;

            stadtrad_source_postgres.addFeature(f);
            // Die Quelle, in der das Stadtrad-Feature erstellt wurde, wird geleert.
            stadtrad_source_postgres_temp.clear();
            
            // Stadtrad-Formular verstecken
            formStadtrad.style.display = "none";

            // Auswahl zurücksetzen
            resetSelection();
        }

        // Wenn die Daten einer Stadtrad-Station geändert wurden, ...
        if ( stadtradControlModify.checked && data.status ) {
            // ... werden die geänderten Formulardaten in das Feature geschrieben.
            feature.setProperties({
                'station': stadtradName.value,
                'longitude': stadtradLongitude.value,
                'latitude': stadtradLatitude.value
            });
            
            // Stadtrad-Formular verstecken
            formStadtrad.style.display = "none";

            // Auswahl zurücksetzen
            resetSelection();
        }

        // Meldung nach 5s wieder verschwinden lassen
		setTimeout(removeMessage, 5000);
    })
    .catch( (error) => {
        //console.log(error);
        stadtradMessage.innerHTML = error;
        setTimeout(removeMessage, 5000);
    });

	// alle Interaktionen (snap, draw, modify) werden deaktiviert
	removeInteractions();
});


// ---------------------------------------------------------------
// Änderungen aus dem Feature in das Formular schreiben
// ---------------------------------------------------------------

function updateStadtrad(f) {
	var coordinate = f.getGeometry().getCoordinates();
	var coord4326 = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    stadtradStation.value = f.id_;
    stadtradName.value = f.get('station');
    stadtradLongitude.value = format(coord4326, '{x}', 6);
    stadtradLatitude.value = format(coord4326, '{y}', 6);
	modify.on('modifyend', function(e) {
		updateStadtrad(f);
	});
}


// ---------------------------------------------------------------
// Stadtrad-Station löschen
// ---------------------------------------------------------------

// Popup, wenn eine Stadtrad-Station gelöscht werden soll
var stadtradOk = document.getElementById("popupOk");
var stadtradAbbruch = document.getElementById("popupCancel");

function deleteStadtrad(f) {
	content.innerHTML = "<p><img src='/images/danger.png' style='height: 4em; margin-left: 100px;'>" +
                        "<br>" + "<br>" +
						"<span style='margin-left: 0px;'>Nummer: " + f.id_ + "</span></p>" +
						"<p> Name der Station: " + f.get("station") + "</p>" + "<br>" +
						"<p>Soll die Station gelöscht werden?</p>" + "<br>" 
    stadtrad_overlay_postgres.setPosition(f.getGeometry().getCoordinates());
	// Daten per AJAX (Asynchronous JavaScript and XML) übertragen
    stadtradOk.addEventListener("click", () => {
        try {
            let fid = f.id_;
            stadtrad_source_postgres.removeFeature(f);
            fetch(url_stadtrad_postgres + '/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify( { "id": fid } )
            })
            .then( response => response.json() )
            .then( data => {
                // Meldung, dass die Daten gespeichert/geändert wurden, werden vom Server geliefert
                stadtradMessage.innerHTML = data.message;
                // Meldung nach 5s wieder verschwinden lassen
                setTimeout(removeMessage, 5000);
            })
            .catch( error => {
                stadtradMessage.innerHTML = error;
                setTimeout(removeMessage, 5000);
            });
        } catch (error) { }
		
        // Popup schließen
		stadtrad_overlay_postgres.setPosition(undefined);
		closer.blur();
	});

    stadtradAbbruch.style.display = "inline";

    stadtradAbbruch.addEventListener("click", function() {
		// Popup schließen
		stadtrad_overlay_postgres.setPosition(undefined);
		closer.blur();
        feature = none;
	});
}

// ---------------------------------------------------------------
// Stadtrad-Station-Popup
// ---------------------------------------------------------------

function showPopup(f) {
    content.innerHTML = "<p><img src='/images/stadtrad.svg' style='height: 2em;'>" +
                        "<span style='margin-left: 10px;'>Station: " + feature.id_ + "</span></p>" +
                        "<p>" + feature.get("station") + "</p>"
    stadtrad_overlay_postgres.setPosition(f.getGeometry().getCoordinates());

    stadtradAbbruch.style.display = "none";

    stadtradOk.addEventListener("click", function() {
		// Popup schließen
		stadtrad_overlay_postgres.setPosition(undefined);
		closer.blur();
	});
}

// ---------------------------------------------------------------
// Funktionen, die wiederkehrende Aktionen ausführen
// ---------------------------------------------------------------

// Meldung löschen
function removeMessage() {
    stadtradMessage.innerHTML = "";
}

// Interaktionen deaktivieren
function removeInteractions() {
	map.removeInteraction(draw);
	map.removeInteraction(snap);
	map.removeInteraction(modify);
}

// Formularinhalte löschen
function clearForm() {
    stadtradStation.value = "";
    stadtradName.value = "";
    stadtradLongitude.value = "";
    stadtradLatitude.value = "";
}

function resetSelection() {
    // CRUD-Aktionen auf nix setzen und die andere Menüpunkte ENABLEn.
    stadtradControlNone.checked = true;
    stadtradControlDraw.disabled = false;
    stadtradControlModify.disabled = false;
    stadtradControlDelete.disabled = false;
}

// ---------------------------------------------------------------
// Popup
// ---------------------------------------------------------------

// Zugriff auf die Popup-Elemente herstellen.
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

// Ein Overlay erstellen, um das Popup auf der Karte zu verankern.
var stadtrad_overlay_postgres = new Overlay({
		element: container,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
});

export { stadtrad_overlay_postgres };

// Einen click-Handler zufügen, um das Popup zu schließen.
closer.onclick = function() {
	// Popup schließen
	stadtrad_overlay_postgres.setPosition(undefined);
	closer.blur();
	
	return false;
};


