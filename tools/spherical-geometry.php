<?php
require_once('spherical-geometry.class.php');

$edges_raw_content = file_get_contents('../vis/data/edges-sbb.json');

$edges_raw = json_decode($edges_raw_content);

$edgeDistances = array();

foreach($edges_raw->features as $edge) {
    $edgeDistances[$edge->properties->edge_id] = getLengthForEdge($edge->geometry->coordinates);
}

echo json_encode($edgeDistances);


function getLengthForEdge($edges_raw) {
    $edges = array();

    foreach($edges_raw as $edge_raw) {
        $edges[] = new LatLng($edge_raw[0], $edge_raw[1]);
    }

    return round(SphericalGeometry::computeLength($edges), 0);
}
