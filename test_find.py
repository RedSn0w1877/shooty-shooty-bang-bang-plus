with open("/app/index.html", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines[1085:1100]):
    print(repr(line))
