import numpy as np

class MNISTData:
    def __init__(self):
        self.train_data = []
        self.test_data = []
        self.__load_data()

    def __load_data(self):
        try:
            mnist_train = open('mnist_train.csv', 'r').readlines()
            mnist_test = open('mnist_test.csv', 'r').readlines()
            self.train_data = self.__parse_csv(mnist_train)
            self.test_data = self.__parse_csv(mnist_test)
        except FileNotFoundError:
            print('❌ MNIST data not found! Download the MNIST csv files from ' +\
                'https://pjreddie.com/projects/mnist-in-csv/ and place the files in same directory as cmnn.py')


    def __parse_csv(self, csv_lines):
        return [MNISTImage([int(x) for x in line.split(',')]) for line in csv_lines]

    def shuffle(self):
        np.random.shuffle(self.train_data)

class MNISTImage:
    def __init__(self, image_data):
        self.image_data = image_data

    def get_label(self):
        return self.image_data[0]

    def get_image(self):
        return self.image_data[1:]

