
// Con este codigo redireccionamos la posición geográfica de nuestro mapa, el cual está
// ubicado en en la ciudad de santiago de chile, cordenadas: -70.6483, -33.4489

var mapView = new ol.View({
  center: ol.proj.fromLonLat([-70.585518, -33.444829]),
  zoom: 15,
});


//creando plantilla por defecto para despliegue de mapas  
var map = new ol.Map({
  target: 'map',
  view: mapView,
  controls: []

});

var noneTile = new ol.layer.Tile({
  title: 'None',
  type: 'base',
  visible: false
});

//asignando por defecto la plantilla de Open Street Map...
var osmTile = new ol.layer.Tile({
  title: 'Open Street Map',
  visible: true,
  type: 'base',
  source: new ol.source.OSM()
});

//map.addLayer(osmTile);
var baseGroup = new ol.layer.Group({
  title: 'Base Maps',
  fold: true,
  layers: [osmTile, noneTile]
});
map.addLayer(baseGroup);


//OBSERVACIÓN: SE HA CAMBIA EL SERVIDOR DE GEOSERVER A SU VERSION 2.23.1 
//Asignamos layers subidos a nuestro GeoServer a través de su url...
//Capa de avance de muestreo:
var AVANCE_MUESTREOTile = new ol.layer.Tile({
  title: "Ñuñoa Manzanas",
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/cartosag/wms',
    params: { 'LAYERS': 'cartosag:AVANCE_MUESTREO', 'TILED': true },
    serverType: 'geoserver',
    visible: true
  })

});
//map.addLayer(AVANCE_MUESTREOTile); esta sentencia permite mostrar por defecto la capa que queremos desplegar, en este la de AVANCE_MUESTREO

//Capa de buffer de la semana 26...
var BUFFERS26Tile = new ol.layer.Tile({
  title: "Capturas",
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/cartosag/wms',
    params: { 'LAYERS': 'cartosag:BUFFER S26', 'TILED': true },
    serverType: 'geoserver', //este campo había sido reemplazado por 'tile', he vuelto a colocar 'geoserver', se pone observación...
    visible: true
  })
});
//map.addLayer(BUFFERS26Tile);

//---------------------------------------------------------------------------------------------------------------------
//Creando grupos de layers para panel layerswitcher 
//--------------------------------------------------------------------------------------------------------------

var overlayGroup = new ol.layer.Group({
  title: 'Overlays',
  fold: true,
  layers: [AVANCE_MUESTREOTile, BUFFERS26Tile]
});
map.addLayer(overlayGroup);



//---------------------------------------------------------------------------------------------------------------------
//Añadiendo Conmutador de capas:

var layerSwitcher = new ol.control.LayerSwitcher({
  activationMode: 'click',
  startActive: false,
  groupSelectedStyle: 'children'
});

map.addControl(layerSwitcher);

//Metodo de despliegue de coordenadas del tutorial:   NO FUNCIONAL!
// var mousePosition = new ol.control.mousePosition({
//     className: 'mousePosition',
//     projection: 'EPSG:4326',
//     coordinateFormat: function(coordinate){return ol.coordinate.format(coordinate,'{y} , {x}',6);}
// });
// map.addControl(mousePosition); 


//-------------------------------------------------------------------------------------------------------------------------------------------------
//Metodo alternativo de despliegue de coordenadas hecho por chat gpt:
//-------------------------------------------------------------------------------------------------------------------------------------------------

var coordinatesElement = document.createElement('div');
coordinatesElement.className = 'mouse-coordinates';
document.body.appendChild(coordinatesElement);

map.on('pointermove', function (event) {
  var coordinates = ol.proj.toLonLat(event.coordinate, 'EPSG:4326');
  var lon = coordinates[0].toFixed(6);
  var lat = coordinates[1].toFixed(6);
  coordinatesElement.innerHTML = 'Lat(Y):' + lat + '||Lon(X):' + lon;
});

//-------------------------------------------------------------------------------------------------------------------------------------------------
//Añadiendo medidor de escala del mapa:
//-------------------------------------------------------------------------------------------------------------------------------------------------

var scaleControl = new ol.control.ScaleLine({

  bar: true,
  text: true

});

map.addControl(scaleControl);

//-------------------------------------------------------------------------------------------------------------------------------------------------
//Creando variables para despliegue de ventanas de bienvenida para el usuario...
//-------------------------------------------------------------------------------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', function () {
  var popup = document.querySelector('.popup');
  var acceptButton = document.querySelector('.popup .accept-button');
  var skipButton = document.querySelector('.popup .skip-button');
  var welcomePopup = document.querySelector('.welcome-popup');
  var welcomeAcceptButton = document.querySelector('.welcome-popup .accept-button');

  acceptButton.addEventListener('click', function () {
    // Redirigir al navegador de Microsoft Edge
    window.location.href = 'microsoft-edge:https://sagcartogob2023.netlify.app/'; // Cambia esta URL por la que desees abrir en Microsoft Edge
  });

  skipButton.addEventListener('click', function () {
    popup.style.display = 'none';
    welcomePopup.style.display = 'block';
  });

  welcomeAcceptButton.addEventListener('click', function () {
    welcomePopup.style.display = 'none';
  });

  popup.style.display = 'block';
});


//------------------------------------------------------------------------------------------------------------------------------
//manipulando popups para despliegue de información de capa AVANCE_MUESTREO----------------------------------------------------------------
//version de chat gpt: 


var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var popup = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});
map.addOverlay(popup);

closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

// map.on('singleclick', function(evt) {
//   content.innerHTML = '';
//   var resolution = map.getView().getResolution();

//   var url = AVANCE_MUESTREOTile.getSource().getFeatureInfoUrl(
//     evt.coordinate,
//     resolution,
//     map.getView().getProjection().getCode(),
//     {
//       'INFO_FORMAT': 'application/json',
//       'propertyName': 'area,grilla,sector,id_manza,porc_avan,inter_avan'
//     }
//   );

//     //colocando campos en una tabla:
//     if (url) {
//         $.getJSON(url, function(data) {
//           var feature = data.features[0];
//           if (feature) {
//             var props = feature.properties;
//             var tableHTML =
//               '<table class="popup-table">' +
//               '<tr><th>Área </th><td>' + props.area + '</td></tr>' +
//               '<tr><th>Grilla </th><td>' + props.grilla + '</td></tr>' +
//               '<tr><th>Sector </th><td>' + props.sector + '</td></tr>' +
//               '<tr><th>ID Manza </th><td>' + props.id_manza + '</td></tr>' +
//               '<tr><th>Porcentaje Avance </th><td>' + props.porc_avan + '%</td></tr>' +
//               '<tr><th>Intervalo </th><td>' + props.inter_avan + '</td></tr>' +
//               '</table>';
//             content.innerHTML = tableHTML;
//             popup.setPosition(evt.coordinate);


//             container.classList.add('visible'); // Agregar la clase 'visible' para activar la animación

//           }
//         });
//       } else {
//         popup.setPosition(undefined);
//         container.classList.remove('visible'); // Remover la clase 'visible' para ocultar el popup
//       }

// }); comentamos este codigo porque fue asignado al boton info popup...



//--------------------------------------------------------------------------------------------------------------
//programando home button         -----------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------


var homeButton = document.createElement('button');
homeButton.innerHTML = '<img src="resources/images/home-2.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
homeButton.className = 'myButton';
homeButton.id = 'homeButton';

var homeElement = document.createElement('div');
homeElement.className = 'homeButtonDiv';
homeElement.appendChild(homeButton);

var homeControl = new ol.control.Control({
  element: homeElement
})

homeButton.addEventListener("click", () => {
  location.href = "index.html";
})

map.addControl(homeControl);


//--------------------------------------------------------------------------------------------------------------
//programando fullscreen button         -----------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------


var fsButton = document.createElement('button');
fsButton.innerHTML = '<img src="resources/images/fullscreen.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
fsButton.className = 'myButton';
fsButton.id = 'fsButton';


var fsElement = document.createElement('div');
fsElement.className = 'fsButtonDiv';
fsElement.appendChild(fsButton);

var fsControl = new ol.control.Control({
  element: fsElement
})

fsButton.addEventListener("click", () => {
  var mapEle = document.getElementById("map");
  if (mapEle.requestFullscreen) {
    mapEle.requestFullscreen();
  } else if (mapEle.msRequestFullscreen) {
    mapEle.requestFullscreen();
  } else if (mapEle.mozRequestFullscreen) {
    mapEle.mozRequestFullscreen();
  } else if (mapEle.webkitRequestFullscreen) {
    mapEle.webkitRequestFullscreen();
  }
})

map.addControl(fsControl);

//--------------------------------------------------------------------------------------------------------------
//programando botton que activa popups con información (featureInfo)       -----------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

var featureInfoButton = document.createElement('button');
featureInfoButton.innerHTML = '<img src="resources/images/infopopup.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
featureInfoButton.className = 'myButton';
featureInfoButton.id = 'featureInfoButton';

var featureInfoElement = document.createElement('div');
featureInfoElement.className = 'featureInfoDiv';
featureInfoElement.appendChild(featureInfoButton);

var featureInfoControl = new ol.control.Control({
  element: featureInfoElement
})

var featureInfoFlag = false;
featureInfoButton.addEventListener("click", () => {
  featureInfoButton.classList.toggle('clicked');
  featureInfoFlag = !featureInfoFlag;
})

map.addControl(featureInfoControl);

map.on('singleclick', function (evt) {
  if (featureInfoFlag) {
    content.innerHTML = '';
    var resolution = map.getView().getResolution();

    var url = AVANCE_MUESTREOTile.getSource().getFeatureInfoUrl(
      evt.coordinate,
      resolution,
      map.getView().getProjection().getCode(),
      {
        'INFO_FORMAT': 'application/json',
        'propertyName': 'area,grilla,sector,id_manza,porc_avan,inter_avan'
      }
    );

    //colocando campos en una tabla:
    if (url) {
      $.getJSON(url, function (data) {
        var feature = data.features[0];
        if (feature) {
          var props = feature.properties;
          var tableHTML =
            '<table class="popup-table">' +
            '<tr><th>Área </th><td>' + props.area + '</td></tr>' +
            '<tr><th>Grilla </th><td>' + props.grilla + '</td></tr>' +
            '<tr><th>Sector </th><td>' + props.sector + '</td></tr>' +
            '<tr><th>ID Manza </th><td>' + props.id_manza + '</td></tr>' +
            '<tr><th>Porcentaje Avance </th><td>' + props.porc_avan + '%</td></tr>' +
            '<tr><th>Intervalo </th><td>' + props.inter_avan + '</td></tr>' +
            '</table>';
          content.innerHTML = tableHTML;
          popup.setPosition(evt.coordinate);


          container.classList.add('visible'); // Agregar la clase 'visible' para activar la animación

        }
      });
    } else {
      popup.setPosition(undefined);
      container.classList.remove('visible'); // Remover la clase 'visible' para ocultar el popup
    }
  }
})

//--------------------------------------------------------------------------------------------------------------
//programando boton que activa Área de longitud y control de medidas.(length area and measure control -----------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

var lengthButton = document.createElement('button');
lengthButton.innerHTML = '<img src="resources/images/length.svg" alt="" style="width:30px;height:30px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
lengthButton.className = 'myButton';
lengthButton.id = 'lengthButton';

var lengthElement = document.createElement('div');
lengthElement.className = 'lengthButtonDiv';
lengthElement.appendChild(lengthButton);

var lengthControl = new ol.control.Control({
  element: lengthElement
})

var lengthFlag = false;
lengthButton.addEventListener("click", () => {
  //disableOtherInteraction('lengthButton');
  lengthButton.classList.toggle('clicked');
  lengthFlag = !lengthFlag;
  document.getElementById("map").style.cursor = "default";
  if (lengthFlag) {
    map.removeInteraction(draw);
    addInteraction('LineString');
  } else {
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
    while (elements.length > 0) elements[0].remove();
  }
})

map.addControl(lengthControl);

//creando btton de area...

var areaButton = document.createElement('button');
areaButton.innerHTML = '<img src="resources/images/area.svg" alt="" style="width:30px;height:30px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
areaButton.className = 'myButton';
areaButton.id = 'areaButton';

var areaElement = document.createElement('div');
areaElement.className = 'areaDiv';
areaElement.appendChild(areaButton);

var areaControl = new ol.control.Control({
  element: areaElement
})

var areaFlag = false;
areaButton.addEventListener("click", () => {
  //disableOtherInteraction('areaButton');
  areaButton.classList.toggle('clicked');
  areaFlag = !areaFlag;
  document.getElementById("map").style.cursor = "default";
  if (areaFlag) {
    map.removeInteraction(draw);
    addInteraction('Polygon');
  } else {
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
    while (elements.length > 0) elements[0].remove(); //no debiese ser por el area?
    // while (elements.area > 0) elements[0].remove(); //se toma el componente de length???
  }
})

map.addControl(areaControl);


/**
 * Mensage que se muestra cuando el usuario esta dibujando un poligono...
 * @type {string}
 */

var continuePolygonMsg = 'Click para dibujar el poligono, Doble click al completarlo';

/**
 * Mensaje para mostrar cuando el usuario está dibujnado una linea...
 * @type {string}
 */
var continueLineMsg = 'Click para dibujar la linea, doble click para terinarla';

var draw; //variable global que podremos remover despues...


var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33',
      }),
    }),
  }),
});

map.addLayer(vector);

function addInteraction(intType) {

  draw = new ol.interaction.Draw({
    source: source,
    type: intType,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(200, 200, 200, 0.6)',
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    }),
  });
  map.addInteraction(draw);

  createMeasureTooltip();
  createHelpTooltip();


  /**
   * función de dibujar actualmente
   * @type {import("../src/ol/Feature.js").default}
   */
  var sketch;

  /**
   * movimiento del puntero del mango
   * @param {import("../src/ol/MapBrowserEvent").default} evt The event.
   */
  var pointerMoveHandler = function (evt) {
    if (evt.dragging) {
      return;
    }
    /** @type {string} */
    var helpMsg = 'Click para comenzar a dibujar!';

    if (sketch) {
      var geom = sketch.getGeometry();
      //if (geom instanceof ol.geom.Polygon){
      //  helpMsg = continuePolygonMsg;
      //} else if (geom instanceof ol.geom.LineString){
      //  helpMsg = continueLineMsg;
      //}

    }
    // helpTooltipElement.innerHTML = helpMsg;
    // helpTooltipElement.setPosition(evt.coordinate);
    // helpTooltipElement.classList.remove('hidden');
  };

  map.on('pointermove', pointerMoveHandler);

  //var listener; 
  draw.on('drawstart', function (evt) {
    //set sketch
    sketch = evt.feature;

    /**@type {import("../src/ol/coordinate.js").Coordinate|undefined} */
    var tooltipCoord = evt.coordinate;

    //listener = sketch.getGeometry().on('change', function (evt) {
    sketch.getGeometry().on('change', function (evt) {
      var geom = evt.target;
      var output;
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();

      } else if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    //unset sketch
    sketch = null;
    //Desactive la información sobre herramientas para poder crear una nueva...
    measureTooltipElement = null;
    createMeasureTooltip();
    //ol.Observable.unByKey(Listener);
  });
}

/**
 * the help tooltip element
 * @type {HTMLElement}
 */
var helpTooltipElement;

/**
 * the help tooltip element
 * @type {Overlay}
 */
var helpTooltip;

/**
 * creates  a new help tooltip element 
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',

  });
  map.addOverlay(helpTooltip);
}

map.getViewport().addEventListener('mouseout', function () {
  helpTooltipElement.classList.add('hidden');
});

/**
 * the measure tooltip element.
 * @type {HTMLElement}
 */
var measureTooltipElement;

/**
 * overlay to show the measurement.
 * @type {Overlay}
 */
var measureTooltip;

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}

/**
 * format lenght output 
 * @param {LineString} line The line.
 * @return {string} the formatted lenght.
 */

var formatLength = function (line) {
  var length = ol.sphere.getLength(line);
  var output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'Km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};



/***
 * Format area output
 * @param {Polygon} polygon The polygon.
 * @return {string} formated area.
 */


var formatArea = function (polygon) {
  var area = ol.sphere.getArea(polygon);
  var output;

  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
}

/** -------------------------------------------------------------------------------------------------------------- */
// Función de zoom in y zoom out mas restricciones...
//versión con restricciones hecha por chat gpt:


// Función para desactivar el botón contrario
function deactivateButton(button) {
  if (button === ziButton) {
    zoButton.classList.remove('clicked');
    map.removeInteraction(zoomOutInteraction);
  } else if (button === zoButton) {
    ziButton.classList.remove('clicked');
    map.removeInteraction(zoomInInteraction);
  }
}

// Función para manejar el click en los botones de zoom
function handleZoomButtonClick(button, interaction) {
  if (!button.classList.contains('clicked')) {
    button.classList.add('clicked');
    map.addInteraction(interaction);
  } else {
    button.classList.remove('clicked');
    map.removeInteraction(interaction);
  }
  deactivateButton(button); // Desactivar el otro botón al activar uno
}

//ZOOM IN:
var zoomInInteraction = new ol.interaction.DragBox();

zoomInInteraction.on('boxend', function () {
  var zoomInExtent = zoomInInteraction.getGeometry().getExtent();
  map.getView().fit(zoomInExtent);
});

var ziButton = document.createElement('button');
ziButton.innerHTML = '<img src="resources/images/zoomin.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
ziButton.className = 'myButton';
ziButton.id = 'ziButton';

var ziElement = document.createElement('div');
ziElement.className = 'ziButtonDiv';
ziElement.appendChild(ziButton);

var ziControl = new ol.control.Control({
  element: ziElement
})

map.addControl(ziControl);

// Añadir evento de click para el botón de Zoom In
ziButton.addEventListener("click", () => {
  handleZoomButtonClick(ziButton, zoomInInteraction);
  document.getElementById("map").style.cursor = ziButton.classList.contains('clicked') ? "zoom-in" : "default";
});


//ZOOM OUT:
var zoomOutInteraction = new ol.interaction.DragBox();

zoomOutInteraction.on('boxend', function () {
  var zoomOutExtent = zoomOutInteraction.getGeometry().getExtent();
  map.getView().setCenter(ol.extent.getCenter(zoomOutExtent));

  mapView.setZoom(mapView.getZoom() - 1)
});

var zoButton = document.createElement('button');
zoButton.innerHTML = '<img src="resources/images/zoomOut.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
zoButton.className = 'myButton';
zoButton.id = 'zoButton';

var zoElement = document.createElement('div');
zoElement.className = 'zoButtonDiv';
zoElement.appendChild(zoButton);

var zoControl = new ol.control.Control({
  element: zoElement
})

map.addControl(zoControl);

// Añadir evento de click para el botón de Zoom Out
zoButton.addEventListener("click", () => {
  handleZoomButtonClick(zoButton, zoomOutInteraction);
  document.getElementById("map").style.cursor = zoButton.classList.contains('clicked') ? "zoom-out" : "default";
});

//-------------------------------------------------------------------------------------------------------------------
//añadiendo funciones para consultas de atributos (Query selector)...

var geojson;
var featureOverlay;

var qryButton = document.createElement('button');
qryButton.innerHTML = '<img src="resources/images/query.png" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
qryButton.className = 'myButton';
qryButton.id = 'qryButton';  

var qryElement = document.createElement('div');
qryElement.className = 'myButtonDiv';
qryElement.appendChild(qryButton);

var qryControl = new ol.control.Control({
  element: qryElement

})

// hasta aquí bien...
//--------------------------------------------------------------------------------------------
var qryFlag = false;
qryButton.addEventListener("click", () => {
  //disableOtherInteraction('lengthButton');
  qryButton.classList.toggle('clicked');
  qryFlag = !qryFlag;
  document.getElementById("map").style.cursor = "default";
  if (qryFlag) {
    if (geojson) {
      geojson.getSource().clear();
      map.removeLayer(geojson);
    }

    if (featureOverlay) {
      featureOverlay.getSource().clear();
      map.removeLayer(featureOverlay);
    }

    //document.getElementById("map"),style.cursor = "default";
    document.getElementById("attQueryDiv").style.display = "block";

    bolIdentify = false;

    addMapLayerList();

  } else {
    //document.getElementById("map").style.cursor = "default";
    document.getElementById("attQueryDiv").style.display = "none";
    document.getElementById("attListDiv").style.display = "none";

    if (geojson) {
      geojson.getSource().clear();
      map.removeLayer(geojson);
    }

    if (featureOverlay) {
      featureOverlay.getSource().clear();
      map.removeLayer(featureOverlay);
    }

  }

})

map.addControl(qryControl);
 //hasta aqui todo en orden... ------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

function addMapLayerList() {
  $(document).ready(function () {
    $.ajax({
      type: "GET",
      url: "http://localhost:8080/geoserver/wfs?request=getCapabilities",
      dataType: "xml",
      success: function (xml) {
        var select = $('#selectLayer');
        select.append("<option class='ddindent' value=''></option>");
        $(xml).find('FeatureType').each(function () {
          $(this).find('Name').each(function () {
            var value = $(this).text();
            select.append("<option class='ddindent' value='" + value + "'>" + "</option>");
          });
        });
      }
    });
  });
};
//codigo revisado sin problemas----------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------


$(function () {
  document.getElementById("selectLayer").onchange = function () {
    var select = document.getElementById("selectAttribute");
    while (select.options.length > 0) {
      select.remove(0);
    }
    var value_layer = $(this).val();
    $(document).ready(function () { 
      $.ajax({
        type: "GET",
        url: "http://localhost:8080/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.0.0&typeName=" + value_layer,
        dataType: "xml",
        success: function (xml) {    //se corrige succes a SUCCESS
          var select = $('#selectAttribute');
          //var title = $(xml).find('xsd\\:complexType').attr('name');
          // alert(title);
          select.append("<option class='ddindent' value=''></option>");
          $(xml).find('xsd\\:sequence').each(function () {

            $(this).find('xsd\\:element').each(function () {
              var value = $(this).attr('name');
              //alert(value);
              var type = $(this).attr('type'); //estaba escrito 'name' , se ha reemplazado por type.
              //alert(type);
              if (value != 'geom' && value != 'the_geom') {
                select.append("<option class='ddindent' value='" + type + "'>" + value + "</option>");
              }
            });
          });
        }                           //todo en orden y corregido hasta esta parte del codigo....
      });
    });
  }
  document.getElementById("selectAttributte").onchange = function () {
    var operator = document.getElementsById("selectOperator");
    while (operator.options.length > 0) {  //segun chat gpt puede ser operator.length....
      operator.remove(0);
    }

    var value_type = $(this).val();
    // alert(value_type);
    var value_attribute = $('#selectAttribute option:selected').text(); //estaba escrito options, se ha corregido por OPTION
    operator.options[0] = new Option('Select operator', "");

    if (value_type == 'xsd:short' || value_type == 'xsd:int' || value_type == 'xsd:double') {
      var operator1 = document.getElementById("selectOperator");
      operator1.options[1] = new Option('Greater than', '>');
      operator1.options[2] = new Option('Less than', '<');
      operator1.options[3] = new Option('Equal to', '=');
    }
    else if (value_type == 'xsd:string') {
      var operator1 = document.getElementById("selectOperator");
      operator1.options[1] = new Option('Like', 'Like');
      operator1.options[2] = new Option('Equal to', '=');
    }
  } // codigo corregido y evaluado, todo en orden...

  document.getElementById('attQryRun').onclick = function () {
    map.set("isLoading", "YES");

    if (featureOverlay) {
      featureOverlay.getSource().clear();
      map.removeLayer(featureOverlay);
    }

    var layer = document.getElementById("selectLayer"); //Estaba escrito slect, se reemplaza por 'select...'
    var attribute = document.getElementById("selectAttribute");
    var operator = document.getElementById("selectOperator");
    var txt = document.getElementById("enterValue");

    if (layer.options.selectedIndex == 0) {
      alert("Select Layer"); //Seleccione Layer
    } else if (attribute.options.selectedIndex == -1) {
      alert("Select Attribute"); //Seleccione Atributo
    } else if (operator.options.selectedIndex <= 0) {
      alert("Select Operator"); //Seleccione Operador
    } else if (txt.value.length <= 0) {
      alert("Enter Value"); //Ingrese Valor
    } else {
      var value_layer = layer.options[layer.selectedIndex].value;
      var value_attribute = attribute.options[attribute.selectedIndex].text; // se reemplaza por .text
      var value_operator = operator.options[operator.selectedIndex].value;
      var value_txt = txt.value;
      if (value_operator == 'Like') {
        value_txt = "%25" + value_txt + "%25";
      }
      else {
        value_txt = value_txt; //observacion: Es probable que una véz que se quiera levantar el servicion a un hosting, la estructura de los links deba cambiar, para que deje de ser localhost:8080...
      }                                                                         //1.1.0 o 1.1.3 ...
      var url = "http://localhost:8080/geoserver/cartosag/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=" + value_attribute + "+" + value_operator + "+'" + value_txt + "'&outputFormat=application/json"
      //console.log(url);
      newaddGeoJsonToMap(url);
      newpopulateQueryTable(url);
      setTimeout(function () { newaddRowHandlers(url); }, 300);
      map.set("isLoading", 'NO');
    }
  }  // codigo en orden y corregido...
});



function newaddGeoJsonToMap(url) {

  if (geojson) {
    geojson.getSource().clear();
    map.removeLayer(geojson);
  }

  var style = new ol.style.Style({
    //fill: new ol.style.Fill({
    //color: 'rgba(0, 255, 255, 0.7)';
    //}),
    stroke: new ol.style.Stroke({
      color: '#FFFF00',
      width: 3
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#FFFF00'
      })
    })
  }); //todo en orden hasta aca...

  geojson = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: url,
      format: new ol.format.GeoJSON()  
    }),
    style: style,

  });

  geojson.getSource().on('addfeature', function () {
    map.getView().fit(
      geojson.getSource().getExtent(),
      { duration: 1590, size: map.getSize(), maxZoom: 21 }
    );
  });
  map.addLayer(geojson);

}; //codigo ordenado y corregido...

//--------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------

function newpopulateQueryTable(url) {

  if (typeof attributePanel !== 'undefined') {
    if (attributePanel.parentElement !== null) {
      attributePanel.close();
    }
  }
  $.getJSON(url, function (data) {
    var col = [];
    col.push('id');
    for (var i = 0; i < data.features.length; i++) {

      for (var key in data.features[i].properties) {

        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }  //todo en orden y corregido hasta aquí...
    }

    var table = document.createElement("table");

    table.setAttribute("class", "table table-bordered table-hover table-condensed");
    table.setAttribute("id", "attQryTable");
    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1);   //TABLE ROW.

    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th");     //TABLE HEADER
      th.innerHTML = col[i];
      tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < data.features.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        if (j == 0) { tabCell.innerHTML = data.features[i]['id']; }
        else {
          tabCell.innerHTML = data.features[i].properties[col[j]];
        }
      }   //codigo corregido y en orden....
    }



    // var tabDiv = document.createElement("div");
    var tabDiv = document.getElementById('attListDiv');

    var delTab = document.getElementById('attQryTable');
    if (delTab) {
      tabDiv.removeChild(delTab);
    }

    tabDiv.appendChild(table);

    document.getElementById("attListDiv").style.display = "block";

  }); // corregido y revisado.....


  var highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 0, 255, 0.3)',
    }),
    stroke: new ol.style.Stroke({
      color: '#FF00FF',
      width: 3,
    }),
    image: new ol.style.Circle({
      radius: 10,
      fill: new ol.style.Fill({
        color: '#FF00FF'
      })
    })
  }); 


  var featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: highlightStyle
  });

}; //codigo ordenado y corregido...
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------


function newaddRowHandlers(url) {  //según chat gpt debe ir la variable 'url' dentro del parentesis '(url)'
  var table = document.getElementById("attQryTable");
  var rows = document.getElementById("attQryTable").rows;
  var heads = table.getElementsByTagName('th');
  var col_no;
  for (var i = 0; i < heads.length; i++) {
    //Take each cell
    var head = heads[i];
    if (head.innerHTML == 'id') {
      col_no = i + 1;
    }

  }
  for (i = 0; i < rows.length; i++) {
    rows[i].onclick = function () {
      return function () {
        featureOverlay.getSource().clear();

        $(function () {
          $("#attQryTable td").each(function () {
            $(this).parent("tr").css("background-color", "white");
          });
        });
        var cell = this.cells[col_no - 1];
        var id = cell.innerHTML;
        $(document).ready(function () {
          $("#attQryTable td:nth-child(" + col_no + ")").each(function () {
            if ($(this).text() == id) {
              $(this).parent("tr").css("background-color", "#d1d8e2");
            }
          });
        });

        var features = geojson.getSource().getFeatures();


        for (i = 0; i < features.length; i++) {
          if (features[i].getId() == id) {
            featureOverlay.getSource().addFeature(feature[i]);

            featureOverlay.getSource().on('addFeature', function () {
              map.getView().fit(
                featureOverlay.getSource().getExtent(),
                { duration: 1500, size: map.getSize(), maxZoom: 24 }
              );
            });
          }
        }
      };
    }(rows[i]);
  }
}

//codigo revizado y corregido completamente....

// end attribute query....

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
