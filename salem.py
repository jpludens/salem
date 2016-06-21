"""Flask app for serving pages within the Untitled Salem Tools App."""

import flask

app = flask.Flask(__name__)

@app.route('/', methods = ['GET'])
def main():
	return flask.render_template('salem.html')

if __name__ == '__main__':
	app.run(debug=True)