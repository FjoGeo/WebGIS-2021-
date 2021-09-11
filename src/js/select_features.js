import 'ol/ol.css';
import Select from 'ol/interaction/Select';
import {altKeyOnly, click, pointerMove} from 'ol/events/condition';
import { map } from './index';


let select = null; // ref to currently selected interaction

// select interaction working on "singleclick"
const selectSingleClick = new Select();

// select interaction working on "click"
const selectClick = new Select({
  condition: click,
});

// select interaction working on "pointermove"
const selectPointerMove = new Select({
  condition: pointerMove,
});

const selectAltClick = new Select({
  condition: function (mapBrowserEvent) {
    return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
  },
});

const selectElement = document.getElementById("type_feature_select");

const changeInteraction = function () {
  if (select !== null) {
    map.removeInteraction(select);
  }
  const value = selectElement.value;
  if (value == 'singleclick') {
    select = selectSingleClick;
  } else if (value == 'click') {
    select = selectClick;
  } else if (value == 'pointermove') {
    select = selectPointerMove;
  } else if (value == 'altclick') {
    select = selectAltClick;
  } else {
    select = null;
  }
  if (select !== null) {
    map.addInteraction(select);
    select.on('select', function (e) {
      document.getElementById("status").innerHTML =
        '&nbsp;' +
        e.target.getFeatures().getLength() +
        ' selected features (last operation selected ' +
        e.selected.length +
        ' and deselected ' +
        e.deselected.length +
        ' features)';
    });
  }
};

/**
 * onchange callback on the select element.
 */
selectElement.onchange = changeInteraction;
/* changeInteraction(); */


/* Button um Eventlistener zu aktivieren oder deaktivieren */
let auswahl = document.getElementById("f__select__button");
let stopp_auswahl = document.getElementById("f__select__stop__button");

auswahl.addEventListener('click', ()=> {
    changeInteraction();
    map.addInteraction(select);
});

stopp_auswahl.addEventListener('click', ()=> {
    map.removeInteraction(select);
});