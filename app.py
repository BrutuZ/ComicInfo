from flask import Flask, jsonify, request
from flask_cors import CORS
from requests import get

# instantiate the app
app = Flask(__name__)
app.config.from_object(__name__)

# enable CORS
CORS(app, resources={r'/*': {'origins': '*'}})


# sanity check route
@app.route('/ping', methods=['GET'])
def ping_pong():
  return jsonify('pong!')


@app.route('/api/request', methods=['GET'])
def send_request():
  if 'url' not in request.args:
    return jsonify({'error': 'missing url parameter'})
  try:
    resp = get(request.args['url']).content.decode()
  except Exception as e:
    return jsonify({'error': e})
  # response_object = {'status': 'success'}
  # response_object['value'] = request.args
  return resp


if __name__ == '__main__':
  app.run()
