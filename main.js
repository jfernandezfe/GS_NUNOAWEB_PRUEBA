var mapView = new ol.View({
    center: ol.proj.fromLonLat([72.585717, 23.0212450]),
    zoom: 8,
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
        URL: 'http://localhost:8080/geoserver/cartosagdemo/wms',
        params: {'LAYERS': 'cartosagdemo:AVANCE_MUESTREO', 'TILED': true},
        serverType: 'geoserver',
        visible: true
    })
});


map.addLayer(SantiagoSTTile);




