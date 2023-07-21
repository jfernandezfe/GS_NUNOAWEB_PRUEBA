
// Con este codigo redireccionamos la posición geográfica de nuestro mapa, el cual está
// ubicado en en la ciudad de santiago de chile, cordenadas: -70.6483, -33.4489

var mapView = new ol.View({
    center: ol.proj.fromLonLat([-70.585518,-33.444829]),
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
var osmTile = new ol.layer.Tile ({
    title: 'Open Street Map',
    visible: true,
    type: 'base',
    source: new ol.source.OSM()
});

//map.addLayer(osmTile);
var baseGroup = new ol.layer.Group({
    title:'Base Maps',
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
        params: {'LAYERS': 'cartosag:AVANCE_MUESTREO', 'TILED': true},
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
        params: {'LAYERS': 'cartosag:BUFFER S26', 'TILED': true},
        serverType: 'geoserver', //este campo había sido reemplazado por 'tile', he vuelto a colocar 'geoserver', se pone observación...
        visible: true
    })
});
//map.addLayer(BUFFERS26Tile);

//---------------------------------------------------------------------------------------------------------------------
//Creando grupos de layers para panel layerswitcher 
//--------------------------------------------------------------------------------------------------------------

var overlayGroup = new ol.layer.Group({
    title:'Overlays',
    fold: true,
    layers: [AVANCE_MUESTREOTile,BUFFERS26Tile]
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

map.on('pointermove', function(event) {
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
window.addEventListener('DOMContentLoaded', function() {
    var popup = document.querySelector('.popup');
    var acceptButton = document.querySelector('.popup .accept-button');
    var skipButton = document.querySelector('.popup .skip-button');
    var welcomePopup = document.querySelector('.welcome-popup');
    var welcomeAcceptButton = document.querySelector('.welcome-popup .accept-button');
  
    acceptButton.addEventListener('click', function() {
      // Redirigir al navegador de Microsoft Edge
      window.location.href = 'microsoft-edge:https://sagcartogob2023.netlify.app/'; // Cambia esta URL por la que desees abrir en Microsoft Edge
    });
  
    skipButton.addEventListener('click', function() {
      popup.style.display = 'none';
      welcomePopup.style.display = 'block';
    });
  
    welcomeAcceptButton.addEventListener('click', function() {
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

closer.onclick = function() {
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
homeButton.id= 'homeButton';

var homeElement = document.createElement('div');
homeElement.className = 'homeButtonDiv';
homeElement.appendChild(homeButton);

var homeControl = new ol.control.Control({
  element: homeElement
})

homeButton.addEventListener("click", ()=>{
  location.href = "index.html";
}) 

map.addControl(homeControl);


//--------------------------------------------------------------------------------------------------------------
//programando fullscreen button         -----------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------


var fsButton = document.createElement('button');
fsButton.innerHTML = '<img src="resources/images/fullscreen.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
fsButton.className = 'myButton';
fsButton.id= 'fsButton';


var fsElement = document.createElement('div');
fsElement.className = 'fsButtonDiv';
fsElement.appendChild(fsButton);

var fsControl = new ol.control.Control({
  element: fsElement
})

fsButton.addEventListener("click",() =>{
  var mapEle = document.getElementById("map");
  if(mapEle.requestFullscreen){
    mapEle.requestFullscreen();
  } else if (mapEle.msRequestFullscreen){
    mapEle.requestFullscreen();
  } else if (mapEle.mozRequestFullscreen){
    mapEle.mozRequestFullscreen();
  } else if(mapEle.webkitRequestFullscreen){
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
featureInfoButton.id ='featureInfoButton';

var featureInfoElement = document.createElement('div');
featureInfoElement.className = 'featureInfoDiv';
featureInfoElement.appendChild(featureInfoButton);

var featureInfoControl = new ol.control.Control({
  element: featureInfoElement
})

var featureInfoFlag = false;
featureInfoButton.addEventListener("click", ()=>{
  featureInfoButton.classList.toggle('clicked');
  featureInfoFlag = !featureInfoFlag;
})

map.addControl(featureInfoControl);

map.on('singleclick',function(evt){
  if(featureInfoFlag){
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
        $.getJSON(url, function(data) {
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
lengthButton.id ='lengthButton';

var lengthElement = document.createElement('div');
lengthElement.className = 'lengthDiv';
lengthElement.appendChild(lengthButton);

var lengthControl = new ol.control.Control({
  element: lengthElement
})

var lengthFlag = false;
lengthButton.addEventListener("click", () =>{
  //disableOtherInteraction('lengthButton');
  lengthButton.classList.toggle('clicked');
  lengthFlag = !lengthFlag;
  document.getElementById("map").style.cursor = "default";
  if(lengthFlag){
    map.removeInteraction(draw);
    addInteraction('LineString');
  }else {
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltrip ol-tooltrip-static");
    while (elements.length > 0) elements[0].remove();
  }
})

map.addControl(lengthControl);

//creando btton de area...

var areaButton = document.createElement('button');
areaButton.innerHTML = '<img src="resources/images/area.svg" alt="" style="width:30px;height:30px;filter:brightness(0) invert(1); vertical-align:middle"></img>';
areaButton.className = 'myButton';
areaButton.id ='areaButton';

var areaElement = document.createElement('div');
areaElement.className = 'areaDiv';
areaElement.appendChild(areaButton);

var areaControl = new ol.control.Control({
  element: areaElement
})

var areaFlag = false;
areaButton.addEventListener("click", () =>{
  //disableOtherInteraction('areaButton');
  areaButton.classList.toggle('clicked');
  areaFlag = !areaFlag;
  document.getElementById("map").style.cursor = "default";
  if(areaFlag){
    map.removeInteraction(draw);
    addInteraction('Polygon');
  } else {
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName("ol-tooltrip ol-tooltrip-static");
    // while (elements.area > 0) elements[0].remove(); //no debiese ser por el area?
    while (elements.length > 0) elements[0].remove(); //se toma el componente de length???
  }
})

map.addControl(areaControl);


/**
 * Mensage que se muestra cuando el usuario esta dibujando un poligono...
 * @type {string}
 */

var continueLineMsg = 'Click para dibujar el poligono, Doble click al completarlo';

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
        color: '#ffcc33'
      }),
    }),
  }),
});

map.addLayer(vector);

//funciones pendientes.....

function addInteraction(intType){
//   //codigo pendiente dentro de esta funcion :'v 
//   ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣠⡤⠤⠶⠶⠚⠛⠛⠉⠙⠛⠻⢶⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⠶⠒⠋⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⠾⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⢤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⠏⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠱⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣶⣼⣧⠀⠀⠀⠻⣦⣤⣀⠀⠀⠀⠀⠀⠀⠹⣷⣤⣤⣾⡿⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠿⠿⠷⠶⢶⣻⣿⣿⣿⣿⣿⣛⣛⣛⣛⣛⣿⣿⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠟⠁⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣩⡿⠛⠉⠉⠉⠻⣿⡍⠉⠉⠙⠻⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠃⠀⠀⠀⢠⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡞⠋⠀⠀⠀⠀⠀⠀⠈⠻⣦⠀⠀⢣⡌⢿⡄⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⠀⢀⣴⡿⠁⠀⠀⠀⢀⣾⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠘⢷⡄⠈⢻⣾⣧⠀⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⠀⢠⡾⠋⠀⠀⠀⠀⠀⣸⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠏⠀⠀⠀⠀⠀⠀⠀⣾⡟⠹⣶⠀⠀⠀⠹⣦⠀⠹⣿⡆⠀⠀⠀⠀⠀⠀
// ⠀⠀⠀⠀⣴⠟⠀⠀⠀⠀⠀⠀⣰⣿⡧⠶⠒⠛⠛⠷⢶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡟⠀⠀⠀⠀⠀⠀⠀⠀⠿⠦⠤⠿⠄⠀⠀⠀⠸⣧⠀⠘⣿⡄⠀⠀⠀⠀⠀
// ⠀⠀⢀⣼⡿⠀⠀⠀⠀⠀⣠⣾⣿⠋⠀⠀⠀⠀⠀⠀⠀⠉⠛⠷⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣇⠀⠸⣿⣦⠀⠀⠀⠀ ESTOY HASTA LA VRGA :(!
// ⢠⡄⣸⠿⡇⠀⠀⠀⣠⣾⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠹⣦⠀⠀⠀⠀⠀⠀⠀⠀⠙⣧⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⢹⣿⣧⠀⠀⠀
// ⢸⡇⠀⣸⠃⠀⠀⠘⣩⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⠀⠀⠀⣿⣿⣷⠀⠀
// ⣿⡇⢰⡏⠀⠀⠀⢠⣿⡏⢡⡇⢀⣶⠲⣶⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡏⠀⠀⠀⠀⢀⣀⣀⣀⣀⠀⠀⠉⠳⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠃⠀⠸⣧⠙⣇⠀
// ⢻⣿⡿⠁⠀⠀⠰⠟⠋⠀⣼⠃⣸⣃⣤⡿⠀⠀⠀⠀⠀⠀⠀⢀⣴⠏⠀⠀⣠⡴⠟⠋⠙⢿⡉⠉⠛⠛⢻⠲⢤⣍⡛⠓⠶⠦⠤⠤⠤⠤⠶⠛⠋⠀⠀⢻⡇⢹⡀
// ⢸⣿⡇⠀⠀⠀⠀⠀⠀⢰⣟⠀⠈⠉⠁⠀⠀⠀⠀⠀⠀⠀⣠⡿⠁⠀⣠⡾⠋⠀⠀⠀⠀⠈⢻⡄⠀⣠⠟⠀⠀⠹⣿⢶⣄⣀⠀⠀⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠈⢻⡈⡇
// ⢸⣿⡇⠀⠀⠀⠀⠀⠀⣾⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠋⠀⠀⣴⣿⣄⠀⠀⠀⠀⠀⠀⠈⣿⠞⠉⠀⠀⠀⠀⠙⣦⡈⠉⠛⠻⣿⡿⠛⢷⡄⠀⠀⠀⠀⠀⠀⢰⣧⡇
// ⢸⣿⡇⠀⠀⠀⢰⣄⡾⠃⠈⠛⢦⣄⣀⣀⣀⣀⣠⡴⠟⠁⠀⠀⣼⠃⠈⢿⣆⠀⠀⠀⠀⣠⠞⠋⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠛⠉⠀⠀⠀⠹⣦⠀⠀⠀⠀⣿⣿
// ⢸⣿⡇⠀⠀⠀⠘⠏⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀⢠⡏⠀⠀⠈⠿⣧⣤⠶⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣷⠀⠀⠀⠀⠀⢹⣿
// ⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣷⣠⡤⠀⠀⠀  ⠈⣿
// ⣾⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⢀⣴⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠁⠀⠀⠀⠀ ⣿
// ⢹⣿⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣤⡶⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⠶⠛⠁⠀⠀⠀⠀⠀⠀⠀⣿
// ⠈⣿⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⠤⠤⠤⠶⠒⠒⠛⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿
// ⠀⣿⡀⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⡤⠶⠚⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿
// ⠀⢸⡇⠘⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡟⠀⠀⠀⠀⠀⢀⣠⡴⠞⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿
// ⠀⠀⢷⡀⢻⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠇⠀⠀⢀⣠⠶⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿
// ⠀⠀⠈⢷⡊⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡏⠀⣠⡶⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿
// ⠀⠀⠀⠈⢷⣽⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡟⢠⡼⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿
// ⠀⠀⠀⠀⠀⣿⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿
// ⠀⠀⠀⠀⠀⢸⡿⢻⣆⠀⠀⠀⠀⠀⠀⠀⠀⢠⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿
// ⠀⠀⠀⠀⠀⠘⣷⠀⠙⢷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡏
// ⠀⠀⠀⠀⠀⠀⢹⣇⠀⠀⠙⠳⢦⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡿⠀
// ⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⠀⠀⠀⠈⠙⠳⢤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠟⠁⠀
// ⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀
}







