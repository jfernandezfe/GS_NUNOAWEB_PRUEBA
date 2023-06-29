
// Con este codigo redireccionamos la posición geográfica de nuestro mapa, el cual está
// ubicado en en la ciudad de santiago de chile, cordenadas: -70.6483, -33.4489

var mapView = new ol.View({
    center: ol.proj.fromLonLat([-70.585518,-33.444829]),
    zoom: 14,
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



//Asignamos layers subidos a nuestro GeoServer a través de su url...
//Capa de avance de muestreo
var AVANCE_MUESTREOTile = new ol.layer.Tile({
    title: "Ñuñoa Manzanas",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cartosagnunoa/wms',
        params: {'LAYERS': 'cartosagnunoa:AVANCE_MUESTREO', 'TILED': true},
        serverType: 'geoserver',
        visible: true
    })
    
});
//map.addLayer(AVANCE_MUESTREOTile);

//Capa de buffer de la semana 26...
var BUFFERS26Tile = new ol.layer.Tile({
    title: "Capturas",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cartosagnunoa/wms',
        params: {'LAYERS': 'cartosagnunoa:BUFFER S26', 'TILED': true},
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

//Metodo alternativo de despliegue de coordenadas hecho por chat gpt:
var coordinatesElement = document.createElement('div');
coordinatesElement.className = 'mouse-coordinates';
document.body.appendChild(coordinatesElement);

map.on('pointermove', function(event) {
    var coordinates = ol.proj.toLonLat(event.coordinate, 'EPSG:4326');
    var lon = coordinates[0].toFixed(6);
    var lat = coordinates[1].toFixed(6);
    coordinatesElement.innerHTML = 'Lat(Y):' + lat + '||Lon(X):' + lon;
});




