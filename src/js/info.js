import {transform} from 'ol/proj';
import {format} from 'ol/coordinate';

function info_pointermove(event) {
    let coord3857 = event.coordinate;
    document.getElementById('mouseCoord3857').innerHTML = format(coord3857, "{x}, {y}", 2);
    let coord4326 = transform(coord3857, 'EPSG:3857', 'EPSG:4326');
    document.getElementById('mouseCoord4326').innerHTML = format(coord4326, "{x}, {y}", 8);
}

function info_click(event) {
    let coord3857 = event.coordinate;
    let coord4326 = transform(coord3857, 'EPSG:3857', 'EPSG:4326');
    let lat = format(coord4326, "{y}", 8);
    let lon = format(coord4326, "{x}", 8);
    document.getElementById('mouseCoord4326ClickedAt').innerHTML = lon + "," + lat;
    document.getElementById('mouseCoord3857ClickedAt').innerHTML = format(coord3857, "{x},{y}", 2);
}

function info_moveend(map) {
    let bbox = map.getView().calculateExtent(map.getSize());
    document.getElementById('bbox').innerHTML = bbox[0].toFixed(2) + "," +
                                                bbox[1].toFixed(2) + ", " +
                                                bbox[2].toFixed(2) + "," +
                                                bbox[3].toFixed(2);
    
    let center = transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
    document.getElementById('center').innerHTML = format(center, "{x},{y}", 6);
}

function info_change_resolution(map) {
    document.getElementById('zoom').innerHTML = map.getView().getZoom();
    document.getElementById('resolution').innerHTML = map.getView().getResolution();
}


function copy2clipboard(element_id) {
    const text = document.getElementById(element_id).innerHTML;
    let input = document.createElement("input");
    document.body.appendChild(input);
    input.value = text;
    input.select();
    document.execCommand("copy");
    input.remove();
}

window.copy2clipboard = copy2clipboard;

export {info_pointermove, info_click, info_moveend, info_change_resolution};
