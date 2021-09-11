import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import { coords } from './routing';
import { lineString } from '@turf/helpers';
import { lineDistance } from '@turf/turf';
import along from '@turf/along';
import Style from 'ol/style/Style';
import { Icon } from 'ol/style';


var along_button = document.getElementById("along__button");
const source = new VectorSource();
const format = new GeoJSON();

/* Eventlistner für Tagesetappen */
along_button.addEventListener("click", (e) => {
  var linestring2 =  lineString(coords);
  var distance = 100; 
  var chose_option = document.getElementById("mode").value; 
  if (chose_option == 'driving-car') {
    distance = 800;
  } else if (chose_option == 'foot-walking') {
    distance = 40;
  }else if  (chose_option == 'cycling-regular'){
    distance = 100;
  }
    
   // get the line length in kilometers
   const length = lineDistance(linestring2, 'kilometers');
   console.log(length)

   for (let i = 1; i <= length / distance; i++) {
     const turfPoint = along(linestring2, i * distance, 'kilometers');
     // convert the generated point to a OpenLayers feature
     const marker = format.readFeature(turfPoint);
     marker.getGeometry().transform('EPSG:4326', 'EPSG:3857'); 
     source.addFeature(marker);
    }
});
const along_layer = new VectorLayer({
  id: 'along_feature',
  title: 'Etappen',
  visible: true,
  source: source,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      scale: 0.03,
      src: '../images/arnold.svg'
    })
})
});

export {along_layer} 