import {info_pointermove, info_click, info_moveend, info_change_resolution} from './info';
import { stadtrad_click_postgres } from './stadtrad_postgres';
import { routing_click } from './routing';

export function map_events(map) {
    // Wird der Mauszeiger über die Karte bewegt, aktualisieren 
    // sich ständig die Koordinaten.
    map.on('pointermove', function(event) {
        info_pointermove(event);
    });

    // Ein Klick auf die Karte zeigt die Koordinaten an dem Punkt an.
    map.on('click', (event) => {
        info_click(event);
        stadtrad_click_postgres(map, event);
        routing_click(event);
    });

    // Nach dem Verändern des Kartenausschnitts wird die BoundingBox 
    // neu ermittelt und angezeigt.
    map.on('moveend', (event) => {
        info_moveend(map);
    })

    // Zoomstufe und Auflösung werden angezeigt, 
    // wenn sich die Auflösung ändert.
    map.getView().on('change:resolution', (event) => {
        info_change_resolution(map);
    });

    // Beim Aufruf des Scripts werden Zoomstufe und Auflösung angezeigt.
    info_change_resolution(map);
}
