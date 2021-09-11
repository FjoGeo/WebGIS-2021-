import 'ol/ol.css';
import { map } from './index';
import { jsPDF } from "jspdf";

const exportButton = document.getElementById('export-pdf');

document.getElementById('export-png').addEventListener('click', function () {
    map.once('rendercomplete', function () {
      const mapCanvas = document.createElement('canvas');
      const size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(
        document.querySelectorAll('.ol-layer canvas'),
        function (canvas) {
          if (canvas.width > 0) {
            const opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            const transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            const matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number);
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix
            );
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      if (navigator.msSaveBlob) {
        // link download attribute does not work on MS browsers
        navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
      } else {
        const link = document.getElementById('image-download');
        link.href = mapCanvas.toDataURL();
        link.click();
      }
    });
    map.renderSync();
  });

  /* Size for each DIN */
  const dims = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 210],
    a5: [210, 148],
  };

  exportButton.addEventListener('click',function () {
      exportButton.disabled = true;
      document.body.style.cursor = 'progress';
  
      const format = document.getElementById('format').value;
      const resolution = document.getElementById("re__so").value;
      const dim = dims[format];
      const width = Math.round((dim[0] * resolution) / 25.4);
      const height = Math.round((dim[1] * resolution) / 25.4);
      const size = map.getSize();
      const viewResolution = map.getView().getResolution();

  
      map.once('rendercomplete', function () {
        const mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        const mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
              const transform = canvas.style.transform;
              // Get the transform parameters from the style's transform matrix
              const matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number);
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              );
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        const pdf = new jsPDF('landscape', undefined, format);  
        pdf.addImage(
          mapCanvas.toDataURL('image/jpeg'),
          'JPEG',
          0,
          0,
          dim[0],
          dim[1]
        );
        pdf.save('map.pdf');
        // Reset original map size
        map.setSize(size);
        map.getView().setResolution(viewResolution);
        exportButton.disabled = false;
        document.body.style.cursor = 'auto';
      });
  
      // Set print size
      var new_resolution = document.getElementById("re__so").value;
      var new_dim = dims[format];
      var new_width = Math.round((new_dim[0] * new_resolution) / 25.4);
      var new_height = Math.round((new_dim[1] * new_resolution) / 25.4);
      var new_size = map.getSize();
      const printSize = [new_width, new_height];

      map.setSize(printSize);
      const scaling = Math.min(new_width / new_size[0], new_height / new_size[1]);
      map.getView().setResolution(viewResolution / scaling);
    },
    false
  );

