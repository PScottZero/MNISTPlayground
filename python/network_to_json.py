import numpy as np
import sys

def network_to_json(network, use_fashion):
    np.set_printoptions(threshold=sys.maxsize)
    if use_fashion:
        file = open(f'mnist-fashion-{int(network.accuracy)}.json', 'w')
    else:
        file = open(f'mnist-digit-{int(network.accuracy)}.json', 'w')
    file.write('{"layers":[')
    for layer_no in range(0, len(network.layers)):
        if layer_no != 0:
            weights = np.array2string(network.layers[layer_no].weights, separator=',')
            biases = np.array2string(network.layers[layer_no].biases, separator=',')
            file.write('{')
            file.write(f'"size":{network.layers[layer_no].size},')
            file.write(f'"weights":{weights},')
            file.write(f'"biases":{biases}')
            file.write('}')
            if layer_no != len(network.layers) - 1:
                file.write(',')
    file.write('],')
    file.write(f'"accuracy":{network.accuracy},')
    file.write(f'"epochCount":{network.epoch_count},')
    file.write(f'"eta":{network.eta}')
    file.write('}')
    file.close()
