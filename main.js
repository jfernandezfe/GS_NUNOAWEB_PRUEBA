
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
    title: 'none',
    type: 'base',
    visible: false 
})

//asignando por defecto la plantilla de Open Street Map...
var osmTile = new ol.layer.Tile ({
    title: 'Open Street Map',
    type: 'base',
    visible: true,
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
        url: 'http://localhost:8080/geoserver/cartosagñuñoa/wms',
        params: {'LAYERS': 'cartosagñuñoa:AVANCE_MUESTREO', 'TILED': true},
        serverType: 'geoserver',
        visible: true
    })
});
//map.addLayer(AVANCE_MUESTREOTile);

//Capa de buffer de la semana 26...
var BUFFERS26Tile = new ol.layer.Tile({
    title: "Capturas",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cartosagñuñoa/wms',
        params: {'LAYERS': 'cartosagñuñoa:BUFFER S26', 'TILED': true},
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


var mousePosition = new ol.control.mousePosition({
    projection: 'EPSG:4326',
    coordinateFormat: function(coordinate){return ol.coordinate.format(coordinate,'{y} , {x}',6);}
});
map.addControl(mousePosition); 




