from neural_network import MNISTNeuralNetwork
from mnist_data import MNISTData

print()
print('+----------------------------+')
print('| Customizable MNIST         |')
print('| Neural Network v1.0        |')
print('+----------------------------+')
print('| Created By: Paul Scott     |')
print('| B.S. Computer Science      |')
print('| Penn State University      |')
print('+----------------------------+')
print()

size = [784, 128, 64, 10]
epoch_count = 10
learning_rate = 0.001

print(f'✨ Creating network with config: size={size} epochs={epoch_count} eta={learning_rate}')
model = MNISTNeuralNetwork(
    size=size,
    epoch_count=epoch_count, 
    eta=learning_rate,
)

print('💾 Loading MNIST data')
mnist = MNISTData()

if (len(mnist.train_data) > 0):
    print('🏋️ Training network')
    model.train(mnist)
    print('🧪 Testing network')
    model.test(mnist)
    print('😃 Complete')
