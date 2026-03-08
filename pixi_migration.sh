sed -i 's/const canvas = document.getElementById('\''gameCanvas'\'');/const canvas = pixiApp.view;/g' index.html
sed -i 's/const ctx = canvas.getContext('\''2d'\'');//g' index.html
