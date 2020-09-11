mnist_file = open('fashion-mnist_train.csv', 'r')
counts = [0] * 10
output_file = open('fashion-mnist_train_reduced.csv', 'w')

for line in mnist_file.readlines():
    if counts[int(line[0])] < 1000:
        output_file.writelines(line)
        counts[int(line[0])] += 1

print(counts)
