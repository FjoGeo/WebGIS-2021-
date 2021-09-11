import 'ol/ol.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import '../css/index.css';
import '../css/popup.css';
import '../css/navbar.css';
import '../css/routing.css';
import '../css/stadtrad.css';
import '../css/draw_mod.css';
import '../css/nominatim.css';
import '../css/geolocation.css';
import '../css/info_table.css';
import '../css/export.css';
import '../css/measure.css';
import '../css/feature_select.css';

import './menu';
import './info';
import './routing';
import './stadtrad_postgres';
import './draw_mod';
import './nominatim';
import './geolocation';
import './turf_along';
import './export_map';
import './popup_extra';
import './measure';
import './select_features';


import Map from 'ol/Map';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import Zoom from 'ol/control/Zoom';
import LayerSwitcher from 'ol-layerswitcher';
import {createLayerPanel} from './layers';
import {BASELAYER as BaseLayerGroup, VERKEHR as verkehr, AMERICA as america,USA, NATUR, WETTER, postgres} from './layers';
import { stadtrad_layer_postgres_temp, stadtrad_overlay_postgres } from './stadtrad_postgres';
import {map_events} from './map_events';
import {DragRotateAndZoom,defaults as defaultInteractions,} from 'ol/interaction';
import {FullScreen, defaults as defaultControls} from 'ol/control';
import { setInteraction } from './drag_and_drop';

const start_center = fromLonLat([-97.74870442,30.27286902]); 
const start_zoom = 8;

var map = new Map({
    controls: defaultControls().extend([new FullScreen(), 
    new Zoom()
    ]),
    interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
    target: 'map'
});

map.addLayer(BaseLayerGroup);
map.addLayer(verkehr);
map.addLayer(america);
map.addLayer(USA);
map.addLayer(NATUR);
map.addLayer(WETTER);
map.addLayer(postgres);
map.addLayer(stadtrad_layer_postgres_temp); 
map.addOverlay(stadtrad_overlay_postgres); 

let map_view = new View({
    center: start_center,
    zoom: start_zoom
});
map.setView(map_view);

// Event-Handler
map_events(map);

createLayerPanel('baselayer', [BaseLayerGroup]);
createLayerPanel('verkehr', [verkehr, america, USA, postgres]);
createLayerPanel('natur', [NATUR,WETTER]);

const layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
});
map.addControl(layerSwitcher)

setInteraction(map);
export { map };