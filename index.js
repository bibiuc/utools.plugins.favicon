document.ondragover = function (e) {
    e.preventDefault();
};
document.ondrop = function (e) {
    e.preventDefault();
};
class Api {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvas.height = 1;
        this.ctx = this.canvas.getContext('2d');
        this.img = new Image();
        this.ratio = 1;
        this.reader = new FileReader();
        this.reader.onload = () => {
            this.img.src = this.reader.result;
            this.reader.abort();
        }
        this.img.onload = () => {
            const imgWidth = this.img.width;
            const imgHeight = this.img.height;
            this.ratio = imgWidth / imgHeight;
            // if ( imgWidth != imgHeight ) {
            //     const src = this.drawRect(imgWidth, imgHeight);
            //     this.img.src = src;
            //     return;
            // }
            this.drawOver(this.ratio > 1 ? imgWidth : imgHeight);
        }
        this.drawOver = () => {}
    }
    drawRect(w, h) {
        let l,t, width;
        l = t = 0;
        if ( w > h ) {
            width = w;
            t = (w - h) / 2;
        } else {
            this.max = 'height';
            width = h;
            l = (h - w) / 2;
        }
        this.canvas.width = this.canvas.height = width;
        this.ctx.drawImage(this.img, l, t, w, h);
        return this.canvas.toDataURL('image/png');
    }
    draw(w, type, ratio = 1) {
        const h = w / ratio;
        let iw = w,
            ih = h,
            x = 0,
            y = 0;
        if (this.ratio > ratio) {
            ih = iw / this.ratio;
            y = (h - ih) / 2
        } else {
            iw = ih * this.ratio;
            y = (w - iw) / 2
        }
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.drawImage(this.img,  x, y, iw, ih);
        return this.canvas.toDataURL(type);
    }
    render(file, callback){
        this.reader.readAsDataURL(file);
        this.drawOver = (imgWidth) => {
            callback? callback(imgWidth) : null;
        };
    }
    reset() {
        this.drawOver = () => {}
        this.reader.abort();
        this.img.src = '';
        this.ratio = 1;
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.ctx.clearRect(0, 0, 1, 1);
    }
}
const api = new Api();
let reset = null;
let readToNext = null;
let drawTo = null;
document.onreadystatechange = () => {
    if(document.readyState == "complete"){
        const container = document.getElementById('container');
        let image_width = 0;
        container.ondragover = function (e) {
            e.preventDefault();
        };
        container.ondrop = function (e) {
            var list = e.dataTransfer.files;
            if (list.length != 1) {

            }
            api.reset();
            api.render(list[0], (w) => {
                console.log(w);
                document.getElementById('sizes').style.display = 'block';
                document.getElementById('result').style.display = 'block';
                document.getElementById('result').innerHTML = '';
                image_width = w;
                drawTo(w, 'png');
            });
        };
        reset = () => {
            image_width = 0;
            api.reset();
            document.getElementById('sizes').style.display = 'none';
            document.getElementById('result').style.display = 'none';
            document.getElementById('result').innerHTML = '';
        };
        readToNext = (payload) => {

        };
        drawTo = (size, type, ratio = 1) => {
            size = size > 0 ? size : image_width;
            const mini_type = {
                ico: 'image/vnd.microsoft.icon',
                png: 'image/png',
                jpg: 'image/jpeg'
            }[type] || 'image/png';
            const base64 = api.draw(size, mini_type, ratio);
            const filename = `${size}x${ratio == 1 ? '' : Math.floor(size * ratio)}.${type}`;
            const html = `<a href="${base64}" download="${filename}" flex="dir:top cross:center"><img src="${base64}" alt="${filename}"/><span>${filename}</span></a>`;
            document.getElementById('result').insertAdjacentHTML('beforeend', html);
        }
        document.getElementById('file').onchange = (e) => {
            var list = document.getElementById('file').files;
            if (list.length != 1) {

            }
            api.reset();
            api.render(list[0], (w) => {
                console.log(w);
                document.getElementById('sizes').style.display = 'block';
                document.getElementById('result').style.display = 'block';
                document.getElementById('result').innerHTML = '';
                image_width = w;
                drawTo(w, 'png');
            });
        };
    }
}

utools.onPluginReady(()=>{
    console.log('插件装配完成，已准备好');
});
utools.onPluginEnter(({code, type, payload})=>{
    console.log('用户进入插件', code, type, payload)
    if (type == 'text') {
        reset();
    } else {
        readToNext(payload);
    }
});
utools.onPluginOut(()=>{
    console.log('用户退出插件');
    reset();
});
utools.onPluginDetach(()=>{
    console.log('插件被分离')
});
utools.onDbPull(()=>{
    console.log('onDbPull')
});
