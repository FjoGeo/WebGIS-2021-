DROP TABLE IF EXISTS draw_modify_point;
CREATE TABLE IF NOT EXISTS draw_modify_point
(
    uuid uuid PRIMARY KEY,
    geom geometry,
    modified timestamp DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS draw_modify_linestring;
CREATE TABLE IF NOT EXISTS draw_modify_linestring
(
    uuid uuid PRIMARY KEY,
    geom geometry,
    modified timestamp DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS draw_modify_polygon;
CREATE TABLE IF NOT EXISTS draw_modify_polygon
(
    uuid uuid PRIMARY KEY,
    geom geometry,
    modified timestamp DEFAULT CURRENT_TIMESTAMP
);

