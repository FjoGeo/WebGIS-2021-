import DragAndDrop from 'ol/interaction/DragAndDrop';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

var dragAndDropInteraction;

function setInteraction(map) {
    if (dragAndDropInteraction) {
        map.removeInteraction(dragAndDropInteraction);
    }

    dragAndDropInteraction = new DragAndDrop({
        formatConstructors: [
            GPX,
            GeoJSON,
            IGC,
            TopoJSON],
    });

    dragAndDropInteraction.on('addfeatures', function (event) {
        var vectorSource = new VectorSource({
            features: event.features,
        });
        map.addLayer(
            new VectorLayer({
                source: vectorSource,
            })
        );
        map.getView().fit(vectorSource.getExtent());
    });

    map.addInteraction(dragAndDropInteraction);
}

export { setInteraction };
