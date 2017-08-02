/*
 * Javascript Document
 *
 * Creat by Nelson 2017/8/1
 * 
 * Website : http://www.nelson_obj.com
 * 
 * QQ : 616859570
 *
 * Email : Nelson_Lee@outlook.com
 * */
import '../less/nui-data-picker.less'

class NuiPicker {


    constructor(data, options) {

        if (!('ontouchstart' in window)) {
            console.error('仅支持移动端浏览器!');
            return;
        }

        options = options || {};

        //默认参数
        let defaultOptions = {
            item: {
                size: 16,
                height: 25,
                color: '#333333',
            },
            opacityDif: .3,
            sizeDif: 1.5,
            panelBg: '#f7f7f7',
            padding: 15,
            lineNum: 5,
            px2rem: false,
            confirm: {
                size: 14,
                height: 40,
                color: '#ffffff',
                background: '#d0021b'
            },
            title: {
                size: 20,
                color: '#333333',
            }
        };

        //处理自定义参数
        this.options = Object.assign(options, defaultOptions);
        this.data = data || [];

        this.createDoms();
        this.bindEvt();

    };


    /**
     * @description 创建各个DOM所需的className
     */
    createClassName = () => {
        this._picker = 'nui-date-picker';
        [this._container, this._inner, this._scroll, this._fix, this._confirm] = [
            this._picker + '-container',
            this._picker + '-inner',
            this._picker + '-scroll',
            this._picker + '-fix',
            this._picker + '-confirm'
        ];
    };

    /**
     * @description 初始化DOM结构
     */
    createDoms = () => {
        this.createClassName();
        //初始化容器
        let picker = document.createElement('div');
        picker.className = this._picker;

        let options = this.options;
        let confirmOptions = options.confirm;
        let itemHeight = parseFloat(options.item.height);
        this.panelInnerHeight = itemHeight * parseFloat(options.lineNum);
        this.halfItemHeight = this.options.item.height / 2;
        this.halfPanelHeight = this.panelInnerHeight / 2;
        this.topBoundary = this.halfPanelHeight - this.halfItemHeight;

        let [panelStyle, itemStyle, fixStyle, confirmStyle] = [
            this.mathCssStr({
                'height': this.panelInnerHeight + 30,
                'background': options.panelBg,
                'bottom': confirmOptions.height
            }),
            this.mathCssStr({
                'height': itemHeight,
                'line-height': itemHeight
            }),
            this.mathCssStr({
                'height': this.panelInnerHeight,
                'line-height': this.panelInnerHeight
            }),
            this.mathCssStr({
                'height': confirmOptions.height,
                'font-size': confirmOptions.size,
                'background': confirmOptions.background,
                'color': confirmOptions.color

            })
        ];


        let scrollHtml = ['<div id="nui-date-picker-container" class="nui-date-picker-container" style="' + panelStyle + '"><div class="nui-date-picker-inner">'];

        let titles = 0;
        for(let titleCount = 0 ; titleCount < this.data.length ; titleCount++){
            this.data[titleCount].title && titles++;
        }

        let scrollDomWidth = (document.body.clientWidth - this.options.padding * 2 - 40 * titles) / this.data.length;

        this.data.map(scrollItems => {

            let scrollItemsData = scrollItems.data || [];
            let scrollItem = '<div class="nui-date-picker-scroll"><ul style="width: ' + scrollDomWidth + 'px;">';
            let items = scrollItemsData.map(item => '<li style="' + itemStyle + '"><span>' + item + '</span></li>')

            scrollItem += items.join('')
            scrollItem += '</ul></div>';
            scrollItems.title && (scrollItem += '<div class="nui-date-picker-fix"><span style="' + fixStyle + '">' + scrollItems.title + '</span></div>') && (titles++);

            scrollHtml.push(scrollItem);
        });



        scrollHtml.push('</div></div><button id="nui-date-picker-confirm" class="nui-date-picker-confirm" style="' + confirmStyle + '">确定</button>');
        picker.innerHTML = scrollHtml.join('');

        document.body.appendChild(picker);

    };
    /**
     * @description 事件绑定
     */
    bindEvt = () => {
        this.confirmEvt();
        this.bindScroll();
    };

    /**
     * @description 绑定滚动事件
     */
    bindScroll = () => {
        let _this = this;
        let scrollDoms = document.querySelectorAll('.' + this._scroll);
        for (let index = 0; index < scrollDoms.length; index++) {
            let item = scrollDoms[index];
            let scrollDom = item.children[0];

            _this.modifyActive(scrollDom);

            let [start, startX, startY, endX, endY, distance, temp] = [0, 0, 0, 0, 0, 0, 0];
            item.addEventListener('touchstart', function (e) {
                e.stopPropagation();
                start = Date.now();
                startY = e.touches[0].clientY;
                temp = startY;
            })
            item.addEventListener('touchmove', function (e) {
                e.stopPropagation();
                distance = e.changedTouches[0].clientY - temp;
                _this.scroll(scrollDom, distance);
                temp = e.changedTouches[0].clientY;
            })
            item.addEventListener('touchend', function (e) {
                let allDistance = e.changedTouches[0].clientY - startY
                let direction = allDistance > 0 ? -1 : 1;

                _this.endScroll(scrollDom, distance, start, Date.now(), direction, allDistance);
            })
        }
    };
    /**
     * @description 手指离开屏幕时停止滚动
     * @param dom   滚动的DOM
     * @param distance  滚动的距离
     * @param start 触摸开始
     * @param end   触摸结束
     * @param direction 滚动方向
     * @param allDistance 手指划过的距离
     */
    endScroll = (dom, distance, start, end, direction, allDistance) => {
        if (this.checkScroll(dom, dom.offsetTop + distance) !== true) {
            if (direction === -1) {
                this.toBoundary(dom, this.topBoundary, direction);
            } else if (direction === 1) {
                let bottomBoundary = dom.offsetHeight - this.halfPanelHeight - this.halfItemHeight;
                this.toBoundary(dom, -bottomBoundary, direction);
            }
        } else {
            this.inertia(dom, allDistance, start, end, direction);
        }
    };
    /**
     * @description 滚动归位
     * @param dom   滚动的DOM
     * @param position  目标位置
     * @param direction 方向数据
     */
    toBoundary = (dom, position, direction) => {
        let _this = this;
        let toBoundaryInterval = setInterval(function () {
            let nextStep = dom.offsetTop + direction * 1 - _this.options.padding;

            dom.style.top = nextStep + 'px';

            _this.modifyActive(dom);

            if ((direction < 0 && nextStep <= position) || (direction > 0 && nextStep >= position)) {
                clearInterval(toBoundaryInterval);
                dom.style.top = position + 'px';
            }
        }, 2)
    };
    /**
     * @description 惯性归位
     * @param dom   滚动DOM
     * @param allDistance  滚动距离
     * @param start 触摸开始
     * @param end   触摸结束
     * @param direction 滚动方向
     */
    inertia = (dom, allDistance, start, end, direction) => {
        let _this = this;
        let speed = this.getSpeed(allDistance, start, end) * 12;
        let inertiaInterval = setInterval(function () {
            let nextStep = dom.offsetTop + direction * -speed - _this.options.padding;

            dom.style.top = nextStep + 'px';

            _this.modifyActive(dom);

            if (speed <= .5) {
                clearInterval(inertiaInterval);
                if (_this.checkScroll(dom, dom.offsetTop) !== true) {
                    if (direction === -1) {
                        _this.toBoundary(dom, _this.topBoundary, direction);
                    } else if (direction === 1) {
                        let bottomBoundary = dom.offsetHeight - _this.halfPanelHeight - _this.halfItemHeight;
                        _this.toBoundary(dom, -bottomBoundary, direction);
                    }
                } else {
                    let current = dom.offsetTop - _this.options.padding;
                    let justFine = current % _this.options.item.height;
                    let _justFine = current / _this.options.item.height;
                    let end = current;
                    if (justFine > 0) {
                        if (justFine > _this.halfItemHeight) {
                            end = _this.options.item.height * Math.ceil(_justFine);
                        } else {
                            end = _this.options.item.height * Math.floor(_justFine);
                        }
                    } else {
                        if (justFine > _this.halfItemHeight) {
                            end = _this.options.item.height * Math.floor(_justFine);
                        } else {
                            end = _this.options.item.height * Math.ceil(_justFine);
                        }
                    }
                    _this.toBoundary(dom, end, direction);
                }
            }

            speed--;
        }, 10)
    };
    /**
     * @description 计算瞬间速度
     * @param allDistance  瞬间位移
     * @param start 位移开始时间
     * @param end   位移结束时间
     */
    getSpeed = (allDistance, start, end) => {
        return (Math.abs(allDistance) / (end - start)) || 0;
    };
    /**
     * @description 跟随滚动
     * @param dom  跟随的DOM
     * @param distance  滚动的距离
     */
    scroll = (dom, distance) => {

        distance = this.checkScroll(dom, dom.offsetTop + distance) === null ? distance : distance / 3;

        dom.style.top = dom.offsetTop - this.options.padding + distance + 'px';

        this.modifyActive(dom);
    };
    /**
     * @description 判断是否可跟随滚动
     */
    checkScroll = (dom, distance) => {
        let bottomBoundary = dom.offsetHeight - this.halfPanelHeight - this.halfItemHeight

        if (distance >= 0 && distance > this.topBoundary) {
            return 'down';
        } else if (distance <= 0 && -distance > bottomBoundary) {
            return 'up';
        }

        return true;
    };
    /**
     * @description 设置选中状态
     * @param dom   滚动DOM
     */
    modifyActive = (dom) => {
        let domOffsetTop = dom.offsetTop - this.options.padding;
        let diff = this.options.item.height * 2.5 - domOffsetTop

        let items = dom.children;
        let activeIndex = Math.floor(diff / this.options.item.height);
        if(activeIndex > items.length - 1){
            activeIndex = items.length - 1
        }else if(activeIndex < 0){
            activeIndex = 0;
        }
        items[activeIndex].style.fontSize = this.options.item.size + 'px';
        items[activeIndex].style.opacity = 1;
        items[activeIndex + 1] && (items[activeIndex + 1].style.fontSize = this.options.item.size - this.options.sizeDif + 'px');
        items[activeIndex - 1] && (items[activeIndex - 1].style.fontSize = this.options.item.size - this.options.sizeDif + 'px');
        items[activeIndex + 1] && (items[activeIndex + 1].style.opacity = 1 - this.options.opacityDif);
        items[activeIndex - 1] && (items[activeIndex - 1].style.opacity = 1 - this.options.opacityDif);

        items[activeIndex + 2] && (items[activeIndex + 2].style.fontSize = this.options.item.size - this.options.sizeDif * 2 + 'px');
        items[activeIndex - 2] && (items[activeIndex - 2].style.fontSize = this.options.item.size - this.options.sizeDif * 2 + 'px');
        items[activeIndex + 2] && (items[activeIndex + 2].style.opacity = 1 - this.options.opacityDif * 2);
        items[activeIndex - 2] && (items[activeIndex - 2].style.opacity = 1 - this.options.opacityDif * 2);

    };
    /**
     * @description 确定按钮事件绑定
     */
    confirmEvt = () => {
        let [_this, start, startX, startY, confirmBtn] = [this, 0, 0, 0, document.getElementById('nui-date-picker-confirm')];

        confirmBtn.addEventListener('touchstart', function (e) {
            e.stopPropagation();
            start = Date.now();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        })
        confirmBtn.addEventListener('touchend', function (e) {
            e.stopPropagation();
            if (Math.abs(e.changedTouches[0].clientX - startX) <= 10 && Math.abs(e.changedTouches[0].clientY - startY) <= 10 && Date.now() - start <= 200) {
                _this.options.confirmCallback();
            }
        })
    };

    /**
     * @description 计算css字符串并返回
     * @param style css键值对
     * @returns {string} css样式字符串
     */
    mathCssStr = (style) => {
        let cssStr = '';
        let px2rems = ['height', 'line-height', 'font-size', 'bottom'];
        for (let key in style) {
            if (style.hasOwnProperty(key)) {
                let value = style[key];

                px2rems.indexOf(key) > -1 ? cssStr += key + ':' + this.px2rem(value) : cssStr += key + ':' + value;

                cssStr += ';';
            }
        }
        return cssStr;
    };

    /**
     * @description 单位换算
     * @param value px单位值
     */
    px2rem = (value) => (this.options.px2rem ? value / 16 + 'rem' : value + 'px');
};

export default NuiPicker;