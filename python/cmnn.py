from neural_network import MNISTNeuralNetwork
from mnist_data import MNISTData
from network_to_json import network_to_json
import sys

print()
print('+----------------------------+')
print('| Customizable MNIST         |')
print('| Neural Network v1.1        |')
print('+----------------------------+')
print('| Created By: Paul Scott     |')
print('| B.S. Computer Science      |')
print('| Penn State University      |')
print('+----------------------------+')
print()

size = [784, 128, 10]
epoch_count = 10
learning_rate = 0.001
include_garbage = False
use_fashion = False

args = sys.argv[1:]
for index, arg in enumerate(args):
    if arg == "-fashion":
        use_fashion = True
    elif arg == "-garbage":
        include_garbage = True
    elif arg == "-size":
        size = [784] + [int(x) for x in args[index + 1].split(",")] + [10]
    elif arg == "-epochs":
        epoch_count = int(args[index + 1])
    elif arg == "-eta":
        learning_rate = float(args[index + 1])

print('✨ Creating network with config:')
print('⚙️ MNIST=' + ('Fashion' if use_fashion else 'Digit'))
print(f'⚙️ Size={size}')
print(f'⚙️ Epochs={epoch_count}')
print(f'⚙️ Eta={learning_rate}')
print(f'⚙️ Garbage={include_garbage}')
model = MNISTNeuralNetwork(
    size=size,
    epoch_count=epoch_count, 
    eta=learning_rate,
)

print('💾 Loading MNIST data')
mnist = MNISTData(use_fashion, include_garbage)

if (len(mnist.train_data) > 0):
    print('🏋️ Training network')
    model.train(mnist)
    print('🧪 Testing network')
    model.test(mnist)
    print('💾 Saving network config')
    network_to_json(model, use_fashion)
    print('😃 Complete')
