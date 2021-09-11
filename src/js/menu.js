let openBar = false;

function info(bar) {
    if (openBar) {
        infoCloseAll();
    }
    infoOpen(bar);
}
window.info = info;

function infoOpen(bar) {
    document.getElementById(bar).style.width = "350px";
    document.getElementById(bar).style.paddingLeft = "20px";
    document.getElementById("main").style.marginLeft = "430px";
    openBar = true;
}

function infoCloseAll() {
    let bars = document.getElementsByClassName('infobar')
    for (let bar of bars) {
        bar.style.width = "0";
        bar.style.paddingLeft = "0";
    }
    document.getElementById("main").style.marginLeft = "60px";
    openBar = false;
}
window.infoCloseAll = infoCloseAll;
