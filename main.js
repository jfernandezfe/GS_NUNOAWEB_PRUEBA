
// Con este codigo redireccionamos la posición geográfica de nuestro mapa, el cual está
// ubicado en en la ciudad de santiago de chile, cordenadas: -70.6483, -33.4489

var mapView = new ol.View({
    center: ol.proj.fromLonLat([-70.585518,-33.444829]),
    zoom: 17,
});


var map = new ol.Map({
    target: 'map',
    view: mapView,

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


//OBSERVACIÓN: SE HA CAMBIA EL SERVIDOR DE GEOSERVER A SU VERSION 2.19 PARA QUE SEA COMPATIBLE CON EL SERVIDOR DE APACHE TOMCAT
//Asignamos layers subidos a nuestro GeoServer a través de su url...
//Capa de avance de muestreo
var AVANCE_MUESTREOTile = new ol.layer.Tile({
    title: "Ñuñoa Manzanas",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cartosag/wms',
        params: {'LAYERS': 'cartosag:AVANCE_MUESTREO', 'TILED': true},
        serverType: 'geoserver',
        visible: true
    })
    
});
//map.addLayer(AVANCE_MUESTREOTile);

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

//Creando grupos de layers para panel layerswitcher 
var overlayGroup = new ol.layer.Group({
    title:'Overlays',
    fold: true,
    layers: [AVANCE_MUESTREOTile,BUFFERS26Tile]
});
map.addLayer(overlayGroup);
 



//Añadiendo Conmutador de capas:
var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: false,
    groupSelectedStyle: 'children'
});

map.addControl(layerSwitcher); 

//Metodo de despliegue de coordenadas del tutorial:
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
//Añadiendo cmedidor de escala del mapa:
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
//manipulando popups para despliegue de información de las capas----------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------

// var container = document.getElementById('popup');
// var content = document.getElementById('popup-content');
// var closer = document.getElementById('popup-closer');

// var popup = new ol.Overlay({
    
//     element: container,
//     autoPan: true,
//     autoPanAnimation: {

//         duration: 250,

//     },
// });
// map.addOverlay(popup);

// closer.onclick = function(){
//     popup.setPosition(undefined);
//     closer.blur();
//     return false; 
// };

// map.on('singleclick', function(evt){
//     content.innerHTML = '';
//     var resolution = mapView.getResolution();

//     var url = AVANCE_MUESTREOTile.getSource().getFeatureInfoUrl(evt.coordinate, resolution, 'EPSG:3857', {
//         'INFO_FORMAT': 'application/json',
//         'propertyName': 'fid,area,grilla,sector,id_manza,porc_avan,inter_avan'
//     });

//     //pendiente....
//     if(url){
//         $.getJSON(url, function(data){
//             var feature = data.features[0];
//             var props = feature.properties;
//             // content.innerHTML = "<h3> Id: </h3><p>" + props.id + "</p>";
//             content.innerHTML = "<h3> Fid : </h3> <p>"+ props.fid + '</p>'+
//                                 "<h3> Area: </h3> <p>" + props.area + '</p>'+
//                                 "<h3> Grilla : </h3> <p>" + props.grilla + '</p>'+
//                                 "<h3> Sector : </h3> <p>" + props.sector.ToLowerCase() + '</p>'+
//                                 "<h3> Id manzana : </h3> <p>" + props.id_manza + '</p>'+
//                                 "<h3> Porcentaje avance : </h3> <p>" + props.porc_avan + '</p>'+
//                                 "<h3> Intervalo : </h3> <p>" + props.inter_avan + "</p>";
//             popup.setPosition(evt.coordinate);
//         })
//     } else{
//         popup.setPosition(undefined);
//     }
// });

//---------------------------------------------------------------------------------------------------
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

map.on('singleclick', function(evt) {
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
          }
        });
      } else {
        popup.setPosition(undefined);
      }

});



 








