import flask
from flask import Flask, request
from tensorflow.keras.preprocessing.sequence import pad_sequences
import tweet_analyzer as analyzer


class Context:
    def __init__(self):
        self.model, self.tokenizer = analyzer.prepare_model()


app = Flask(__name__)
context = Context()


@app.route('/')
def home():
    return flask.render_template('index.html')


@app.post('/submit')
def submit_tweet():
    content_type = request.headers.get('Content-Type')
    if content_type == 'application/json':
        json = request.json
        print(json)
        if len(json.get('content').strip()) > 0:
            sequence = context.tokenizer.texts_to_sequences([json.get('content')])
            padded = pad_sequences(sequence, padding='post', maxlen=40)
            print(padded)
            result = context.model.predict(padded)
            temp = int(result[0].round())
            print(temp)
            return str(temp), 200
    return {}, 400


if __name__ == '__main__':
    app.run()
