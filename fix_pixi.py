with open("/app/index.html", "r") as f:
    content = f.read()

search = """        function drawObstacles() {
            ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
            for (let obs of obstacles) {
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            }
        }"""

replace = """        function drawObstacles() {
            // Obstacles removed as requested
        }"""

if search in content:
    content = content.replace(search, replace)
    with open("/app/index.html", "w") as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Could not find search block!")
