
// Con este codigo redireccionamos la posición geográfica de nuestro mapa, el cual está
// ubicado en en la ciudad de santiago de chile, cordenadas: -70.6483, -33.4489

var mapView = new ol.View({
    center: ol.proj.fromLonLat([-70.6483, -33.4489]),
    zoom: 12,
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

var SantiagoSTTile = new ol.layer.Tile({
    title: "Santiago States",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cartosagdemo/wms',
        params: {'LAYERS': 'cartosagdemo:AVANCE_MUESTREO', 'TILED': true},
        serverType: 'tile',
        visible: true
    })
});


map.addLayer(SantiagoSTTile);




