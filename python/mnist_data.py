import numpy as np

def generate_garbage_images():
    images = []
    for _ in range(10000):
        img = np.random.rand(784)
        img = np.insert(img, 0, -1)
        images.append(MNISTImage(img))
    return images

class MNISTData:
    def __init__(self, use_fashion, include_garbage):
        self.train_data = []
        self.test_data = []
        self.__load_data(use_fashion, include_garbage)

    def __load_data(self, use_fashion, include_garbage):
        try:
            if use_fashion:
                mnist_train = open('fashion-mnist_train.csv', 'r').readlines()
                mnist_test = open('fashion-mnist_test.csv', 'r').readlines()
            else:
                mnist_train = open('mnist_train.csv', 'r').readlines()
                mnist_test = open('mnist_test.csv', 'r').readlines()
            self.train_data = self.__parse_csv(mnist_train)
            self.test_data = self.__parse_csv(mnist_test)
            if include_garbage:
                self.train_data += generate_garbage_images()
        except FileNotFoundError:
            print('❌ MNIST data not found! Download the MNIST csv files from ' +\
                'https://pjreddie.com/projects/mnist-in-csv/, or ' +\
                'https://www.kaggle.com/zalando-research/fashionmnist?select=fashion-mnist_train.csv' +\
                'for fashion MNIST, and place the files in same directory as cmnn.py')


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

