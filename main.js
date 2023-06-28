
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

//asignando por defecto la plantilla de Open Street Map...
var osmTile = new ol.layer.Tile ({
    title: 'Open Street Map',
    visible: true,
    source: new ol.source.OSM()
});

map.addLayer(osmTile);

//Asignamos layers subidos a nuestro GeoServer a través de su url...

//Capa de avance de muestreo
var AVANCE_MUESTREOTile = new ol.layer.Tile({
    title: "Ñuñoa Manzanas",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cartosagñuñoa/wms',
        params: {'LAYERS': 'cartosagñuñoa:AVANCE_MUESTREO', 'TILED': true},
        serverType: 'tile',
        visible: true
    })
});
map.addLayer(AVANCE_MUESTREOTile);

//Capa de buffer de la semana 26...
var BUFFERS26Tile = new ol.layer.Tile({
    title: "Capturas",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cartosagñuñoa/wms',
        params: {'LAYERS': 'cartosagñuñoa:BUFFER S26', 'TILED': true},
        serverType: 'tile',
        visible: true
    })
});
map.addLayer(BUFFERS26Tile);


//Añadiendo Conmutador de capas:

var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: false,
    groupSelectedStyle: 'children'
});

map.addControl(layerSwitcher); 





