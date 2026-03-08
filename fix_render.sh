sed -i 's/if (player1) { player1.projectiles.forEach(p => p.update(dT)); }/entities.forEach(e => e.projectiles.forEach(p => p.update(dT)));/g' index.html
sed -i 's/if (player1) { player1.projectiles.forEach(p => p.draw()); }/entities.forEach(e => e.projectiles.forEach(p => p.draw()));/g' index.html
