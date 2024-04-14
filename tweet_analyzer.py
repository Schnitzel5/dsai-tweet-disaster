import pandas as pd
import numpy as np
import tensorflow as tf
import seaborn as sns
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping


def prepare_model():
    submissions, train_data, main_test_data = import_files()
    (model,
     tokenizer,
     training_padded,
     training_labels_final,
     testing_padded,
     testing_labels_final) = compile_model(train_data, main_test_data)
    history = process_stopping(model, training_padded, training_labels_final, testing_padded, testing_labels_final)
    return model, tokenizer


def import_files():
    submissions = pd.read_csv('data/sample_submission.csv')
    train_data = pd.read_csv('data/train.csv')
    sns.countplot(x=train_data['target']).get_figure().savefig('plots/distribution_train_data.png')
    main_test_data = pd.read_csv('data/test.csv')
    return submissions, train_data, main_test_data


def compile_model(train_data, main_test_data):
    sentences = train_data['text'].tolist()
    labels = train_data['target'].tolist()
    test_sentences = main_test_data['text'].tolist()
    # Separate out the sentences and labels into training and test sets
    training_size = int(len(sentences) * 0.8)

    training_sentences = sentences[0:training_size]
    testing_sentences = sentences[training_size:]
    training_labels = labels[0:training_size]
    testing_labels = labels[training_size:]

    # Make labels into numpy arrays for use with the network later
    training_labels_final = np.array(training_labels)
    testing_labels_final = np.array(testing_labels)

    tokenizer = Tokenizer(num_words=500, oov_token='<OOV>')
    tokenizer.fit_on_texts(training_sentences)
    word_index = tokenizer.word_index
    training_sequences = tokenizer.texts_to_sequences(training_sentences)
    training_padded = pad_sequences(training_sequences, maxlen=40, padding='post', truncating='post')

    testing_sequences = tokenizer.texts_to_sequences(testing_sentences)
    testing_padded = pad_sequences(testing_sequences, maxlen=40, padding='post', truncating='post')
    main_test_sequence = tokenizer.texts_to_sequences(test_sentences)
    main_test_padded = pad_sequences(main_test_sequence, maxlen=40, padding='post', truncating='post')

    model = keras.Sequential([
        layers.Embedding(500, 16, input_length=40),
        layers.Bidirectional(tf.keras.layers.LSTM(16, return_sequences=True)),
        layers.Bidirectional(tf.keras.layers.LSTM(16)),
        layers.Dense(18, activation='relu'),
        layers.Dropout(0.2),
        layers.BatchNormalization(),
        layers.Dense(9, activation='relu'),
        layers.Dropout(0.2),
        layers.BatchNormalization(),
        layers.Dense(1, activation='sigmoid')
    ])

    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model, tokenizer, training_padded, training_labels_final, testing_padded, testing_labels_final


def process_stopping(model, training_padded, training_labels_final, testing_padded, testing_labels_final):
    early_stopping = EarlyStopping(min_delta=0.001, patience=10)
    history = model.fit(training_padded,
                        training_labels_final,
                        epochs=15,
                        validation_data=(testing_padded, testing_labels_final),
                        callbacks=[early_stopping])
    return history
