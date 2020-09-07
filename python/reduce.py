mnist_file = open('mnist_test.csv', 'r')
counts = [0] * 10
output_file = open('mnist_test_reduced.csv', 'w')

for line in mnist_file.readlines():
    if counts[int(line[0])] < 250:
        output_file.writelines(line)
        counts[int(line[0])] += 1

print(counts)
