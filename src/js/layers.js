import Group from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';

import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import { Icon, Fill, Stroke, Text } from 'ol/style';

import { map } from './index';
import { transform } from 'ol/proj';
import Point from 'ol/geom/Point';
import { Feature } from 'ol';
import CircleStyle from 'ol/style/Circle';


import { stadtrad_layer_postgres_temp } from './stadtrad_postgres';
import { vector_layer_temp } from './draw_mod';
import { location_temp } from './geolocation';
import { along_layer } from './turf_along';
import { measure_layer } from './measure';

import {transformExtent} from 'ol/proj';
const extent = transformExtent([-126, 24, -66, 50], 'EPSG:4326', 'EPSG:3857');

var parser = new WMTSCapabilities();
const world_imagery_response = await fetch('http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml');
const world_imagery_text = await world_imagery_response.text();
var world_imagery_result = parser.read(world_imagery_text);
var world_imagery_options = optionsFromCapabilities(world_imagery_result, {
    layer: 'World_Imagery',
    matrixSet: 'GoogleMapsCompatible'
});

/* ======================= Austin (Punktlayer) ========================================================================= */
let poi_coordinate_4326 = [	-97.74944213, 30.25597541];
let poi_coordinate_3857 = transform(poi_coordinate_4326, 'EPSG:4326', 'EPSG:3857');
let poi_point = new Point(poi_coordinate_3857);
let poi_feature = new Feature(poi_point);
let poi_vectorsource = new VectorSource();
poi_vectorsource.addFeature(poi_feature);
                        
const poi_layer = new VectorLayer({
    id: 'poi_point',
    title: 'Austin',
    visible: false,
    source: poi_vectorsource,
    style: new Style({
        image: new CircleStyle({
            radius: 5,
            fill: new Fill({
                color: '#D35400'
            }),
            stroke: new Stroke({
                color: '#1F618D',
                width: 1
            })
        })
    })
});


/* =========== Stadtrad Datenbank ===================== */
const stadtrad_source_postgres = new VectorSource({
    format: new GeoJSON(),
    url: 'http://localhost:8082/get'
});

const stadtrad_layer_postgres = new VectorLayer({
    title: 'Stadtrad (PostgreSQL)',
    id: 'stadtrad_postgres',
    visible: true,
    source: stadtrad_source_postgres,
    style: (feature, resolution) => {
        let idx = feature.get('id');
        let zoom = parseInt(map.getView().getZoomForResolution(resolution));
        let txt = zoom>=16 ? feature.get('station') : '';
        let scale = 0.002 * Math.pow(zoom, 1.488);
        scale = zoom>=13 ? scale : 0.0;

        let styleCache = {};
        styleCache[idx] = [ new Style({
            image: new Icon({
                anchor: [0.5, 1.0],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 0.7,
                scale: scale,
                src: 'https://cdn2.iconfinder.com/data/icons/flat-web/512/716991-poi-512.png'
            }),
            text: new Text({
                offsetY: 12,
                font: '16px Verdana,sans-serif',
                text: txt,
                fill: new Fill({
                    color: '#000000'
                }),
                stroke: new Stroke({
                    color: '#ffffff',
                    width: 3
                })
            })
        })];
        return styleCache[idx]
    }
});
export { stadtrad_source_postgres, stadtrad_layer_postgres }

const BASELAYER = new Group({
    'id': 'baselayer',
    'title': 'Basiskarten',
    'fold': 'open',
    layers: [
        
        new TileLayer({
            id: 'worldimagery',
            title: 'World Imagery',
            type: 'base',
            visible: false,
            opacity: 1,
            source: new WMTS(world_imagery_options)
        }),
        new TileLayer({
            id: 'OpenCycleMap',
            title: 'OpenCycleMap',
            type: 'base',
            visible: false,
            source: new XYZ({
                url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=20563c69e53848309aba6462e232e4ab'
            })
        }),

        new TileLayer({
            id: 'OSM',
            title: 'OpenStreetMap',
            type: 'base',
            visible: true,
            source: new OSM()
        })
    ]
});

const postgres = new Group({
    'id': 'postgres',
    'title': 'Features',
    'fold': 'open',
    layers: [
        stadtrad_layer_postgres,
        vector_layer_temp,
        location_temp,
        along_layer,
        measure_layer
    ]
});

const VERKEHR = new Group({
    id: 'verkehr',
    title: 'Verkehr',
    layers: [
    
        new TileLayer({
            id: 'opnv',
            title: 'ÖPNV',
            visible: false,
            source: new XYZ({
                url: 'https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png'
            })
        }),

        new VectorLayer({
            id: 'radwege',
            title: 'Radwege',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_radweg.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#000000'
                        }),
                        stroke: new Stroke({
                            color: '#000000',
                            width: 4
                        }),
                    })
                ];
                return styleCache[idx];
            }
        })
    ]
});

const USA = new Group({
    id: 'usa',
    title: 'Grenzen',
    layers: [

        new VectorLayer({
            id: 'states',
            title: 'States',
            visible: false,
            source: new VectorSource({
                url: 'data/usa_states.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('STATE');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = zoom>5 && zoom<12 ? feature.get('NAME') : '';
                let font_size = 8;
                switch(zoom) {
                    case 7:
                        font_size = 10;
                        break;
                    case 8:
                        font_size = 12;
                        break;
                    case 9:
                        font_size = 16;
                        break;
                }

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        stroke: new Stroke({
                            color: '#319FD3',
                            width: 3
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }),

        new VectorLayer({
            id: 'counties',
            title: 'Counties',
            visible: false,
            source: new VectorSource({
                url: 'data/usa_counties.geojson',
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('STATE');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = zoom>5 && zoom<12 ? feature.get('NAME') : '';
                let font_size = 8;
                switch(zoom) {
                    case 7:
                        font_size = 10;
                        break;
                    case 8:
                        font_size = 12;
                        break;
                    case 9:
                        font_size = 16;
                        break;
                }

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        stroke: new Stroke({
                            color: '#FF0000',
                            width: 1
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        })
    ]
});

const AMERICA = new Group({
    id: 'america',
    title: 'Interessante Punkte',
    layers: [

        new VectorLayer({
            id: 'bars',
            title: 'Bars',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_bar.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#27e760'
                        }),
                        stroke: new Stroke({
                            color: '#319FD3',
                            width: 2
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }),
        new VectorLayer({
            id: 'cafe',
            title: 'Cafe',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_cafe.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#ae5436'
                        }),
                        stroke: new Stroke({
                            color: '#319FD3',
                            width: 2
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }),

        new VectorLayer({
            id: 'restaurant',
            title: 'Restaurant',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_restaurant.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#51367b'
                        }),
                        stroke: new Stroke({
                            color: '#51367b',
                            width: 2
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }),

        new VectorLayer({
            id: 'krankenhaus',
            title: 'Krankenhäuser',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_hospital.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#ef40ca'
                        }),
                        stroke: new Stroke({
                            color: '#ef40ca',
                            width: 2
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }),

        new VectorLayer({
            id: 'hotel',
            title: 'Hotels',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_hotel.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#8e8c45'
                        }),
                        stroke: new Stroke({
                            color: '#8e8c45',
                            width: 2
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }), 
        poi_layer
    ]
});

const NATUR = new Group({
    id: 'natur',
    title: 'Natur',
    layers: [
        
        new VectorLayer({
            id: 'park',
            title: 'Park',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_park.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#247b6f'
                        }),
                        stroke: new Stroke({
                            color: '#247b6f',
                            width: 2
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }),

        new VectorLayer({
            id: 'wald',
            title: 'Wald',
            visible: false,
            source: new VectorSource({
                url: 'data/texas_forest.geojson', 
                format: new GeoJSON()
            }),
            style: (feature, resolution) => {
                let idx = feature.get('osm_id');
                let zoom = parseInt(map.getView().getZoomForResolution(resolution));
                let txt = feature.get('name');
                let font_size = 20;

                let styleCache = {};
                styleCache[idx] = [
                    new Style({
                        fill: new Fill({
                            color: '#234726'
                        }),
                        stroke: new Stroke({
                            color: '#234726',
                            width: 2
                        }),
                        text: new Text({
                            text: txt,
                            font: 'bold ' + font_size + 'px Arial',
                            fill: new Fill({
                                color: '#000000'
                            }),
                            stroke: new Stroke({
                                color: '#FFFFFF',
                                width: 3
                            })
                        })
                    })
                ];
                return styleCache[idx];
            }
        }),
        new TileLayer({
            id: '2',
            title: 'Texas Parks and Wildlife',
            visible: false,
            source: new TileWMS({
                url: 'https://gis.ngdc.noaa.gov/arcgis/services/GulfDataAtlas/SAV_Gulfwide/MapServer/WmsServer?',
                params: {
                    'LAYERS': '2',
                    'FORMAT': 'image/png',
                }
            })
        })  
    ]
});

const WETTER = new Group({
    id: 'wetter',
    title: 'Wetter',
    layers: [

        new TileLayer({
            id: '1',
            title: 'Weather Radar',
            visible: false,
            opacity: 0.3,
            source: new TileWMS({
                url: 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WmsServer?',
            params: {
                'LAYERS': '1',
                'FORMAT': 'image/jpeg'
            }
            })
        })
        
    ]
});

function createLayerPanel(panel, layergroups) {
    let div = document.getElementById(panel);

    let h1 = document.createElement('h1');  
    h1.innerHTML = " ";                 
    div.appendChild(h1);

    for (let layergroup of layergroups) {
        let h2 = document.createElement("h2");
        h2.innerHTML = layergroup.get('title');
        div.appendChild(h2);
        
        let layers = layergroup.getLayers();
        let ul = document.createElement("ul");
        layers.forEach( (layer, index, array) => {
            let type = "checkbox";
            if (layer.get('type') == 'base') {
                type = "radio";
            }
    
            let li = document.createElement("li");

            let input = document.createElement("input");
            input.type = type;
            input.value = layer.get('id');
            input.id = input.value;
            input.name = layergroup.get('id');
            if (layer.get('visible')) {
                input.defaultChecked = true;
            }
            input.addEventListener('change', function() {
                let radio_checkbox = this;
                let layerElementValue = radio_checkbox.value;
                if (layer.get('type') == 'base') {
                    layergroup.getLayers().forEach( (layer, index, array) => {
                        layer.setVisible(layer.get('id') === layerElementValue);
                    })
                } else {
                    layergroup.getLayers().forEach( (layer, index, array) => {
                        if (layer.get('id') === layerElementValue) {
                            layer.setVisible(radio_checkbox.checked);
                        }
                    })
                }
            })

            let label = document.createElement("label");
            label.htmlFor = input.id;
            label.appendChild(input);
            let text = document.createTextNode(layer.get('title'));
            label.appendChild(text);

            li.appendChild(label);
            ul.appendChild(li);
        })
        div.appendChild(ul);
    }
}

export {createLayerPanel, BASELAYER, VERKEHR, AMERICA, USA, NATUR, WETTER, postgres};
