"""Flask app for serving pages within the Untitled Salem Tools App."""

import flask
import json
import yaml

app = flask.Flask(__name__)

@app.route('/', methods = ['GET'])
def main():
	return flask.render_template('index.html')

@app.route('/thanks', methods = ['GET'])
def thanks():
	return flask.render_template('thanks.html')

@app.route('/about', methods = ['GET'])
def about():
	return flask.render_template('about.html')

@app.route('/docs', methods = ['GET'])
def docs():
	return flask.render_template('docs.html')

@app.route('/contact', methods = ['GET'])
def contact():
	return flask.render_template('contact.html')

@app.route('/api/<resource>', methods = ['GET'])
def get_static_data(resource):
	resource_path = ('static/data/{}.yaml').format(resource)
	with app.open_resource(resource_path) as f:
		payload = yaml.load(f)
	return json.dumps(payload)

if __name__ == '__main__':
	app.run(debug=True)
