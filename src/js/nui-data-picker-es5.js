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


(function (exportName) {


    var picker = function (data, options) {

        if (!('ontouchstart' in window)) {
            console.error('仅支持移动端浏览器!');
            return;
        }

        options = options || {};

        //默认参数
        var defaultOptions = {
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
        this.options = extend(defaultOptions, options);
        this.options.closeCallback = this.options.closeCallback || function(){};
        this.data = data || [];
        this.result = [];

        this.createDoms();
        this.bindEvt();

    };

    picker.prototype = {
        /**
         * @description 事件绑定
         */
        bindEvt: function () {
            this.confirmEvt();
            this.closeEvt();
            this.bindScroll();
        },
        /**
         * @description 创建各个DOM所需的className
         */
        createClassName: function () {
            this._picker = 'nui-date-picker';
            this._container = this._picker + '-container';
            this._inner = this._picker + '-inner';
            this._scroll = this._picker + '-scroll';
            this._fix = this._picker + '-fix';
            this._confirm = this._picker + '-confirm';
            this._mask = this._picker + '-mask'
        },
        /**
         * @description 打开选择器
         */
        open: function () {
            this.picker.style.opacity = 1;
            this.picker.style.mozOpacity = 1;
            this.picker.style.top = 0;

        },
        /**
         * @description 关闭选择器
         */
        hide: function () {
            this.picker.style.opacity = 0;
            this.picker.style.mozOpacity = 0;
            this.picker.style.top = '100%';
        },
        /**
         * @description 初始化DOM结构
         */
        createDoms: function () {
            this.createClassName();
            //初始化容器
            var picker = document.createElement('div');
            picker.className = this._picker;
            picker.id = this._picker;

            var options = this.options;
            var confirmOptions = options.confirm;
            var itemHeight = parseFloat(options.item.height);
            this.panelInnerHeight = itemHeight * parseFloat(options.lineNum);
            this.halfItemHeight = this.options.item.height / 2;
            this.halfPanelHeight = this.panelInnerHeight / 2;
            this.topBoundary = this.halfPanelHeight - this.halfItemHeight;

            var panelStyle = this.mathCssStr({
                'height': this.panelInnerHeight + 30,
                'background': options.panelBg,
                'bottom': confirmOptions.height
            });
            var itemStyle = this.mathCssStr({
                'height': itemHeight,
                'line-height': itemHeight,
                'font-size':options.item.size
            });
            var fixStyle = this.mathCssStr({
                'height': this.panelInnerHeight,
                'line-height': this.panelInnerHeight,
                'font-size':options.title.size
            });
            var confirmStyle = this.mathCssStr({
                'height': confirmOptions.height,
                'font-size': confirmOptions.size,
                'background': confirmOptions.background,
                'color': confirmOptions.color

            });


            var scrollHtml = ['<div class="' + this._mask + '" id="' + this._mask + '"></div>', '<div id="' + this._container + '" class="' + this._container + '" style="' + panelStyle + '"><div class="' + this._inner + '">'];

            var titles = 0;
            for (var titleCount = 0; titleCount < this.data.length; titleCount++) {
                this.data[titleCount].title && titles++;
            }

            var scrollDomWidth = (document.body.clientWidth - this.options.padding * 2 - 40 * titles) / this.data.length;
            //
            for (var scrollItemIndex = 0; scrollItemIndex < this.data.length; scrollItemIndex++) {
                var scrollItems = this.data[scrollItemIndex];
                var scrollItemsData = scrollItems.data || [];
                var scrollItem = '<div class="' + this._scroll + '"><ul style="width: ' + scrollDomWidth + 'px;">';

                var items = [];

                for (var dataIndex = 0; dataIndex < scrollItemsData.length; dataIndex++) {
                    items.push('<li style="' + itemStyle + '"><span>' + scrollItemsData[dataIndex] + '</span></li>')
                }

                scrollItem += items.join('')
                scrollItem += '</ul></div>';
                scrollItems.title && (scrollItem += '<div class="' + this._fix + '"><span style="' + fixStyle + '">' + scrollItems.title + '</span></div>') && (titles++);

                scrollHtml.push(scrollItem);
            }

            scrollHtml.push('</div></div><button id="' + this._confirm + '" class="' + this._confirm + '" style="' + confirmStyle + '">确定</button>');
            picker.innerHTML = scrollHtml.join('');

            document.body.appendChild(picker);

            this.picker = document.getElementById(this._picker);
            picker = null;
        }
        ,
        /**
         * @description 绑定滚动事件
         */
        bindScroll: function () {
            var _this = this;
            var scrollDoms = document.querySelectorAll('.' + this._scroll);
            for (var index = 0; index < scrollDoms.length; index++) {
                (function (index) {
                    var item = scrollDoms[index];
                    var scrollDom = item.children[0];
                    var start = 0, startX = 0, startY = 0, endX = 0, endY = 0, distance = 0, temp = 0;

                    _this.modifyActive(scrollDom, index);

                    item.addEventListener('touchstart', function (e) {
                        e.stopPropagation();
                        start = Date.now();
                        startY = e.touches[0].clientY;
                        temp = startY;
                    })
                    item.addEventListener('touchmove', function (e) {
                        e.stopPropagation();
                        distance = e.changedTouches[0].clientY - temp;
                        _this.scroll(scrollDom, distance, index);
                        temp = e.changedTouches[0].clientY;
                    })
                    item.addEventListener('touchend', function (e) {
                        var allDistance = e.changedTouches[0].clientY - startY
                        var direction = allDistance > 0 ? -1 : 1;

                        _this.endScroll(scrollDom, distance, start, Date.now(), direction, allDistance, index);
                    })
                })(index)
            }
        }
        ,
        /**
         * @description 计算瞬间速度
         * @param allDistance  瞬间位移
         * @param start 位移开始时间
         * @param end   位移结束时间
         */
        getSpeed: function (allDistance, start, end) {
            return (Math.abs(allDistance) / (end - start)) || 0;
        }
        ,
        /**
         * @description 跟随滚动
         * @param dom  跟随的DOM
         * @param distance  滚动的距离
         * @param index 当前滚动DOM的索引
         */
        scroll: function (dom, distance, index) {

            distance = this.checkScroll(dom, dom.offsetTop + distance) === null ? distance : distance / 3;

            dom.style.top = dom.offsetTop - this.options.padding + distance + 'px';

            this.modifyActive(dom, index);
        }
        ,
        /**
         * @description 判断是否可跟随滚动
         */
        checkScroll: function (dom, distance) {
            var bottomBoundary = dom.offsetHeight - this.halfPanelHeight - this.halfItemHeight

            if (distance >= 0 && distance > this.topBoundary) {
                return 'down';
            } else if (distance <= 0 && -distance > bottomBoundary) {
                return 'up';
            }

            return true;
        }
        ,
        /**
         * @description 手指离开屏幕时停止滚动
         * @param dom   滚动的DOM
         * @param distance  滚动的距离
         * @param start 触摸开始
         * @param end   触摸结束
         * @param direction 滚动方向
         * @param allDistance 手指划过的距离
         * @param index 当前滚动DOM的索引
         */
        endScroll: function (dom, distance, start, end, direction, allDistance, index) {
            if (this.checkScroll(dom, dom.offsetTop + distance) !== true) {
                if (direction === -1) {
                    this.toBoundary(dom, this.topBoundary, direction, index);
                } else if (direction === 1) {
                    var bottomBoundary = dom.offsetHeight - this.halfPanelHeight - this.halfItemHeight;
                    this.toBoundary(dom, -bottomBoundary, direction, index);
                }
            } else {
                this.inertia(dom, allDistance, start, end, direction, index);
            }
        }
        ,
        /**
         * @description 滚动归位
         * @param dom   滚动的DOM
         * @param position  目标位置
         * @param direction 方向数据
         * @param index 当前滚动DOM的索引
         */
        toBoundary: function (dom, position, direction, index) {
            var _this = this;
            var toBoundaryInterval = setInterval(function () {
                var nextStep = dom.offsetTop + direction * 1 - _this.options.padding;

                dom.style.top = nextStep + 'px';

                _this.modifyActive(dom, index);

                if ((direction < 0 && nextStep <= position) || (direction > 0 && nextStep >= position)) {
                    clearInterval(toBoundaryInterval);
                    dom.style.top = position + 'px';
                }
            }, 2)
        }
        ,
        /**
         * @description 惯性归位
         * @param dom   滚动DOM
         * @param allDistance  滚动距离
         * @param start 触摸开始
         * @param end   触摸结束
         * @param direction 滚动方向
         * @param index 当前滚动DOM的索引
         */
        inertia: function (dom, allDistance, start, end, direction, index) {
            var _this = this;
            var speed = this.getSpeed(allDistance, start, end) * 12;
            var inertiaInterval = setInterval(function () {
                var nextStep = dom.offsetTop + direction * -speed - _this.options.padding;

                dom.style.top = nextStep + 'px';

                _this.modifyActive(dom, index);

                if (speed <= .5) {
                    clearInterval(inertiaInterval);
                    if (_this.checkScroll(dom, dom.offsetTop) !== true) {
                        if (direction === -1) {
                            _this.toBoundary(dom, _this.topBoundary, direction, index);
                        } else if (direction === 1) {
                            var bottomBoundary = dom.offsetHeight - _this.halfPanelHeight - _this.halfItemHeight;
                            _this.toBoundary(dom, -bottomBoundary, direction, index);
                        }
                    } else {
                        var current = dom.offsetTop - _this.options.padding;
                        var justFine = current % _this.options.item.height;
                        var _justFine = current / _this.options.item.height;
                        var end = current;
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
                        _this.toBoundary(dom, end, direction, index);
                    }
                }

                speed--;
            }, 10)
        }
        ,
        /**
         * @description 设置选中状态
         * @param dom   滚动DOM
         * @param index 当前滚动DOM的索引
         */
        modifyActive: function (dom, index) {
            var domOffsetTop = dom.offsetTop - this.options.padding;
            var diff = this.options.item.height * 2.5 - domOffsetTop

            var items = dom.children;
            var activeIndex = Math.floor(diff / this.options.item.height);
            if (activeIndex > items.length - 1) {
                activeIndex = items.length - 1
            } else if (activeIndex < 0) {
                activeIndex = 0;
            }

            this.result[index] = items[activeIndex].innerText;

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

        }
        ,
        /**
         * @description 确定按钮事件绑定
         */
        confirmEvt: function () {
            this.tap(document.getElementById(this._confirm), this.options.confirmCallback);
        },

        /**
         * @description 遮罩层点击事件绑定
         */
        closeEvt: function () {
            this.tap(document.getElementById(this._mask), this.options.closeCallback);
        },
        /**
         * @description 简单的tap点击事件
         * @param dom 点击的元素
         * @param callback 点击响应事件
         */
        tap: function (dom, callback) {
            var start = 0, startX = 0, startY = 0, _this = this;

            dom.addEventListener('touchstart', function (e) {
                e.stopPropagation();
                start = Date.now();
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            })
            dom.addEventListener('touchend', function (e) {
                e.stopPropagation();
                if (Math.abs(e.changedTouches[0].clientX - startX) <= 10 && Math.abs(e.changedTouches[0].clientY - startY) <= 10 && Date.now() - start <= 200) {
                    callback.call(_this, _this.result);
                }
            })
        },

        /**
         * @description 计算css字符串并返回
         * @param style css键值对
         * @returns {string} css样式字符串
         */
        mathCssStr: function (style) {
            var cssStr = '';
            var px2rems = ['height', 'line-height', 'font-size', 'bottom'];
            for (var key in style) {
                if (style.hasOwnProperty(key)) {
                    var value = style[key];

                    px2rems.indexOf(key) > -1 ? cssStr += key + ':' + this.px2rem(value) : cssStr += key + ':' + value;

                    cssStr += ';';
                }
            }
            return cssStr;
        }
        ,
        /**
         * @description 单位换算
         * @param value px单位值
         */
        px2rem: function (value) {
            return this.options.px2rem ? value / 16 + 'rem' : value + 'px';
        }
    }

    /**
     * @description 简单实现Object.assign();
     * @param obj
     * @param obj1
     * @returns {*}
     */
    function extend(obj, obj1) {
        var names = Object.getOwnPropertyNames(obj);
        for (var i = 0; i < names.length; i++) {
            if (names[i] in obj1) {
                continue
            }
            var desc = Object.getOwnPropertyDescriptor(obj, names[i]);
            Object.defineProperty(obj1, names[i], desc);
        }
        return obj1;
    }

    window[exportName] = function (data, options) {
        return new picker(data, options);
    }

})('NuiPicker');