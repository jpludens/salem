"""Flask portion of the Adaptive Tactics web app for exploring
Civilization: Beyond Earth's military possiblities"""

# Code and logic copyright Jason Palm 2015.
# Civilization: Beyond Earth and all its content copyright Firaxis.

import flask



app = flask.Flask(__name__)



@app.route('/', methods = ['GET'])
def main():
	return flask.render_template('salem.html')


if __name__ == '__main__':
	app.run(debug=True)