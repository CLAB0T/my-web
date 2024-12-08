from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, static_folder='.', template_folder='.')

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
