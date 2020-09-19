from layer import Layer
import numpy as np

class MNISTNeuralNetwork:
    def __init__(self, size, epoch_count, eta):
        self.size = size
        self.epoch_count = epoch_count
        self.layers = []
        self.eta = eta
        self.accuracy = 0
        self.__createNetwork()

    def __createNetwork(self):
        prev_layer = None
        is_output = False
        for index, layer_size in enumerate(self.size):
            if index == len(self.size) - 1:
                is_output = True
            new_layer = Layer(layer_size, prev_layer, is_output)
            self.layers.append(new_layer)
            prev_layer = new_layer
            
    def __forward_propagation(self, image_data):
        self.layers[0].activ_values = []
        for px in image_data:
            self.layers[0].activ_values.append(px / 255)
        for layer in self.layers:
            if layer.prev_layer != None:
                layer.calculate()

    def __back_propagation(self, expected_value):
        expected = np.zeros(10)
        expected[expected_value] = 1
        for layer in reversed(self.layers):
            if layer.prev_layer != None:
                layer.calculate_gradient(expected)

    def __update_network(self):
        for layer in self.layers:
            if layer.prev_layer != None:
                layer.update(self.eta)

    def __check_correct(self, label):
        return label == np.argmax(self.layers[-1].activ_values)

    def train(self, mnist_data):
        for epoch_no in range(self.epoch_count):
            mnist_data.shuffle()
            correct = 0
            for i in range(len(mnist_data.train_data)):
                image = mnist_data.train_data[i]
                self.__forward_propagation(image.get_image())
                if self.__check_correct(image.get_label()):
                    correct += 1
                self.__back_propagation(image.get_label())
                self.__update_network()
                accuracy = np.multiply(correct / (i + 1), 100)
                self.__print_training_progress(epoch_no + 1, i + 1, len(mnist_data.train_data), accuracy)
            print()

    def test(self, mnist_data):
        correct = 0
        for i in range(len(mnist_data.test_data)):
            image = mnist_data.test_data[i]
            self.__forward_propagation(image.get_image())
            if self.__check_correct(image.get_label()):
                correct += 1
            accuracy = np.multiply(correct / (i + 1), 100)
            self.__print_testing_progress(i + 1, len(mnist_data.test_data), accuracy)
            self.accuracy = round(accuracy, 2)
        print()

    def __print_training_progress(self, epoch_no, completed, total, accuracy):
        bar = self.__progress_bar(completed, total)
        print(f'Epoch {epoch_no}: {bar} | Accuracy: {accuracy:.2f}%', end='\r')

    def __print_testing_progress(self, completed, total, accuracy):
        bar = self.__progress_bar(completed, total)
        print(f'Testing: {bar} | Accuracy: {accuracy:.2f}%', end='\r')

    def __progress_bar(self, completed, total):
        progress = np.multiply(np.divide(completed, total), 100)
        bar = '['
        draw_arrow = True
        for i in range(20):
            if (i + 1) * 5 <= progress:
                bar += '='
            elif draw_arrow == True and progress != 100:
                bar += '>'
                draw_arrow = False
            else:
                if draw_arrow == True:
                    bar += '>'
                    draw_arrow = False
                else:
                    bar += ' '
        return bar + f'] {completed}/{total} {progress:.2f}%'
