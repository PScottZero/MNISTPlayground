import numpy as np

class Layer:
    def __init__(self, size, prev_layer, is_output):
        self.size = size
        self.prev_layer = prev_layer
        self.is_output = is_output
        self.weights, self.biases, self.values, self.activ_values = [], [], [], []
        self.weight_grad, self.bias_grad, self.activ_grad = [], [], []
        if prev_layer != None:
            self.weights = np.divide(np.random.rand(size, prev_layer.size), size)
            self.biases = np.divide(np.random.rand(size), size)

    def __relu(self, x):
        if x < 0:
            return 0
        else:
            return x

    def __relu_deriv(self, x):
        if x <= 0:
            return 0
        else:
            return 1

    def __softmax(self):
        denom = np.sum(np.exp(self.values))
        return [np.divide(np.exp(x), denom) for x in self.values]

    def calculate(self):
        self.values = np.add(np.matmul(self.weights, self.prev_layer.activ_values), self.biases)
        if not self.is_output:
            self.activ_values = [self.__relu(x) for x in self.values]
        else:
            self.activ_values = self.__softmax()

    def calculate_gradient(self, expected=[]):
        if not self.is_output:
            relu_deriv = [self.__relu_deriv(x) for x in self.values]
            self.bias_grad = np.multiply(relu_deriv, self.activ_grad)
        else:
            self.bias_grad = np.subtract(self.activ_values, expected)
        self.weight_grad = np.outer(self.bias_grad, self.prev_layer.activ_values)
        self.prev_layer.activ_grad = np.matmul(np.transpose(self.weights), self.bias_grad)

    def update(self, eta):
        self.weights = np.subtract(self.weights, np.multiply(eta, self.weight_grad))
        self.biases = np.subtract(self.biases, np.multiply(eta, self.bias_grad))
