from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2,json, dbcfg, psycopg2.extras
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, \
    set_access_cookies, set_refresh_cookies, jwt_required, \
    get_jwt_identity, unset_jwt_cookies

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['JSON_AS_ASCII'] = False

app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/toke/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_SECRET_KEY'] = 'schwer_und_falsch'

jwt = JWTManager(app)

cors = CORS(app)

white = ['http://localhost:8082','http://localhost:8083']


@app.after_request
def add_cors_headers(response):
    r = request.referrer[:-1]
    if r in white:
        response.headers.add('Access-Control-Allow-Origin', r)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Headers', 'Cache-Control')
        response.headers.add('Access-Control-Allow-Headers', 'X-Requested-With')
        response.headers.add('Access-Control-Allow-Headers', 'Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    return response

# =========================DRAW MODIFY ===========================================================================
@app.route('/')
def root():
    return {"message": "Verbindung zu PostgreSQL/PostGIS (localhost)"}

@app.route('/create', methods=['POST'])
def create():
    content = request.get_json()
    uuid = content['uuid']
    geometry = json.dumps(content['geometry'], ensure_ascii=False)

    try:
        with psycopg2.connect(dbcfg.login) as con:
            con.autocommit = True
            cur = con.cursor()
            if content['geometry']['type'] == 'Point':
                cur.execute(f"INSERT INTO draw_modify_point VALUES('{uuid}', ST_GeomFromGeoJSON('{geometry}'))")
            elif content['geometry']['type'] == 'LineString':
                cur.execute(f"INSERT INTO draw_modify_linestring VALUES('{uuid}', ST_GeomFromGeoJSON('{geometry}'))")
            elif content['geometry']['type'] == 'Polygon':
                cur.execute(f"INSERT INTO draw_modify_polygon VALUES('{uuid}', ST_GeomFromGeoJSON('{geometry}'))")
            else:
                return { "message": "Geometrie existiert nicht!" }
    except psycopg2.DatabaseError as e:
        return { "message": f"{e}" }

    return { "message": "Geometrie erfolgreich eingefügt!" }

@app.route('/test', methods=['POST'])
def test():
    content = request.get_json()
    print(type(content))
    print(json.dumps(content, ensure_ascii=False))
    print(content['uuid'])
    print(content['geometry'])
    print(content['geometry']['type'])
    return { "message": "Test erfolgreich!" }

# =============================== Stadtrad =========================================
@app.route('/get')
def get_stadtrad():
    try:
        with psycopg2.connect(dbcfg.login) as con:
            con.autocommit = True
            cur = con.cursor()
            cur.execute('SELECT * FROM stadtrad2')
            feature_collection = {"type": "FeatureCollection"}
            features = list()
            for row in cur.fetchall():
                #print(row)
                feature = {
                    "type": "Feature",
                    "id": row[0],
                    "properties": {"station": row[1]},
                    "geometry": {
                        "type": "Point",
                        "coordinates": [row[2], row[3]]
                    }
                }
                features.append(feature)
            feature_collection.update({"features": features})
            return jsonify(feature_collection)

    except psycopg2.DatabaseError as e:
        return {"message": f"{e}"}



@app.route('/get/<id>')
def get_stadtrad_by_id(id):
    try:
        with psycopg2.connect(dbcfg.login) as con:
            con.autocommit = True
            cur = con.cursor()
            cur.execute(f'SELECT * FROM stadtrad2 WHERE id={id};')
            results = cur.fetchall()
            if len(results) == 0:
                return {"message": "Datensatz nicht vorhanden!"}
            else:
                feature_collection = {
                    "type": "FeatureCollection"
                }
                features = list()
                for row in results:
                    feature = {
                        "type": "Feature",
                        "id": row[0],
                        "properties": {"station": row[1]},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [row[2], row[3]]
                        }
                    }
                    features.append(feature)
                feature_collection.update({"features": features})
                return jsonify(feature_collection)

    except psycopg2.DatabaseError as e:
        return {"message": f"{e}"}

@app.route('/fart', methods=['POST'])
def create_stadtrad():
    content = request.get_json()
    content2 = [
        [content['id'], content['station'],  content['longitude'],  content['latitude']]
    ]
    try:
        with psycopg2.connect(dbcfg.login) as con:
            cur = con.cursor()
            query = "insert into stadtrad2 values(%s, %s, %s, %s);"
            cur.executemany(query, content2)
            con.commit()
    except psycopg2.DatabaseError as e:
        return { "message": "Ein Fehler ist aufgetreten!" }
    else:
        return { "message": "Datensatz eingefügt!" }


@app.route('/update', methods=['POST'])
def update_stadtrad():
    content = request.get_json()
    try:
        with psycopg2.connect(dbcfg.login) as con:
            con.autocommit = True
            cur = con.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cur.execute(f"""UPDATE stadtrad2 SET station='{content['station']}', longitude={content['longitude']}, 
                        latitude={content['latitude']} WHERE id={content['id']};""")
            con.commit()
    except psycopg2.DatabaseError as e:
        return { "message": "Ein Fehler ist aufgetreten!" }
    else:
        return { "message": "Datensatz geändert!" }

@app.route('/delete', methods=['POST'])
def delete_stadtrad():
    content = request.get_json()
    try:
        with psycopg2.connect(dbcfg.login) as con:
            con.autocommit = True
            cur = con.cursor(cursor_factory=psycopg2.extras.DictCursor)
            cur.execute(f"""DELETE FROM stadtrad2 WHERE id={content['id']};""", content)
    except psycopg2.DatabaseError as e:
        return { "message": "Ein Fehler ist aufgetreten!" }
    else:
        return { "message": "Datensatz gelöscht!" }


# ======================================= JWT ===================================================
@app.route('/token/auth', methods=['GET'])
def login():
    username = request.args.get('username', None)
    password = request.args.get('password', None)
    if username != 'admin' or password != 'admin':
        return jsonify({'login': False}), 401
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    resp = jsonify({'login': True})
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp, 200


@app.route('/toke/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user = get_jwt_identity()
    access_token = create_access_token(identity=user)
    resp = jsonify({'refresh': True})
    set_access_cookies((resp, access_token))
    return resp, 200


@app.route('/token/remove', methods=['POST'])
def logout():
    resp = jsonify({'logout': True})
    unset_jwt_cookies(resp)
    return resp, 200


@app.route('/api/example', methods=['GET'])
@jwt_required
def protected():
    user = get_jwt_identity()
    return jsonify({'hello world': user}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8082)
