var x, y, offset, offsetL, offsetT;

function drawLine(posx, posy) {
    posx = posx - offsetL;
    posy = posy - offsetT;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(posx, posy);
    ctx.stroke();
    x = posx;
    y = posy;
}

function drawPoint(posx, posy, rad) {
    posx = posx - offsetL;
    posy = posy - offsetT;
    rad = (rad * 0.05);
    ctx.beginPath();
    ctx.arc(posx, posy, rad, 0, 2 * Math.PI, true);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function localStorageSpace() {
    var allStrings = '';
    for (var key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
            allStrings += window.localStorage[key];
        }
    }

    return allStrings ? 3 + ((allStrings.length * 16) / (8 * 1024)) : 0;
}

function showSize() {
    $("#clearData").html('Clear Data (' + Math.floor(localStorageSpace()) + ' KB)');
}

function clearData() {
    if (confirm('This will clear all local data. Are you sure?')) {
        localStorage.clear();
        window.location.reload();
    }
}