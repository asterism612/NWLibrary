
/**
 *  Lone Gun Man
 *  
 *  @projectDescription : NeowizGames Core Library
 *  @author : asterism612@neowiz.com
 */
(function() {
    function NWLibrary(selector) {
        return new NWLibrary.core(selector);
    };
    /**
     * NWLibrary Class
     * @param {Object} selector
     */
    NWLibrary.core = function(selector) {
        this.selector = selector;

        if (!this.selector) return this;

        if (this.selector == window) {
            this.el = window;
        } else if (this.selector.nodeType) { // element일 경우
            this.el = this.selector;
        } else { // string일 경우
            if (NWLibrary.browser == "ie" && NWLibrary.browserver < 9) {
                if (NWLibrary.isString(this.selector)) {
                    var moreSel = this.selector.split(",");
                    if (moreSel.length > 1) {
                        var results = [];
                        for (var key in moreSel) {
                            var oRet = this.defineEl(NWLibrary.trim(moreSel[key]));
                            if (NWLibrary.isArray(oRet)) {
                                for (var i = 0; i < oRet.length; i++) {
                                    if (oRet[i] != "" && !NWLibrary.inArray(results, oRet[i])) results.push(oRet[i]);
                                }
                            } else {
                                if (oRet != "" && !NWLibrary.inArray(results, oRet[i])) results.push(oRet);
                            }
                        }
                        this.el = results;
                    } else {
                        this.el = this.defineEl(this.selector);
                    }
                }
            } else { // 내장함수 있을 경우.
                this.el = document.querySelectorAll(this.selector);
                if (this.el.length == 1) this.el = this.el[0];
            }
        }
    }
    NWLibrary.core.prototype = {
        /**
         * 셀렉터 선택.
         */
        defineEl: function(selector) {
            // childSelector 공백 제거.
            var childSelector = /( )+(>)( )+/gi;
            if (childSelector.test(selector)) selector = selector.replace(childSelector, RegExp.$2);
            var emptyCheck = /([#\.\[\]*^~=a-zA-Z0-9]+)( )+(\..)+/gi;
            if (emptyCheck.test(selector)) selector = selector.replace(emptyCheck, RegExp.$1 + " " + RegExp.$3);
            var arrSel = selector.split(" "),
                root = (arguments[1]) ? arguments[1] : [document],
                ret;
            if (arrSel.length > 1) for (var i = 0; i < arrSel.length; i++) root = this.checkPseudoSelector(arrSel[i], root);
            else root = this.checkPseudoSelector(arrSel[0], root);
            return (root.length == 1) ? root[0] : root;
        },
        checkPseudoSelector: function(selector, root) {
            if (selector.indexOf(":") > -1) {
                var arrPseudo = selector.split(":"),
                    pseudo = true;
                selector = arrPseudo[0];
            }
            root = (NWLibrary.isArray(root)) ? root : [root];
            root = this.getSelector(selector, root);
            root = (NWLibrary.isArray(root)) ? root : [root];

            if (pseudo) {
                var arrSearchPseudo = [];
                this.each(root, function(i) {
                    if (this[arrPseudo[1]]) arrSearchPseudo.push(this);
                });
                root = arrSearchPseudo;
            }
            return root;
        },
        /**
         * Dom 검색 로직.
         * @param {Object} node
         * @param {Object} func
         */
        Dom_search: function walk(node, func) {
            func(node);
            node = node.firstChild;
            while (node) {
                walk(node, func);
                node = node.nextSibling;
            }
        },
        selType: function(selector) {
            var fWord = selector.substr(0, 1);
            return /^[^\.#]/i.test(selector) ? 'tag' : (fWord === '.') ? 'class' : 'id';
        },
        checkChild: function(selector, root) {
            var arrInfo = selector.split(">"),
                arrclone = [];
            arrclone[0] = arrInfo[0];
            arrInfo.splice(0, 1);
            arrclone[1] = arrInfo.join(">");

            root = this.getSelector(arrclone[0], root);
            root = (NWLibrary.isArray(root)) ? root : [root];
            attSel = this.selType(arrclone[1]);
            searchSelector = arrclone[1];

            if (/^(\.|\#)*.+>(.+)$/i.test(searchSelector)) return this.checkChild(searchSelector, root);
            else return {
                attSel: attSel,
                searchSelector: searchSelector,
                root: root
            };
        },
        /**
         * 겟셀렉터
         * @param {Object} selector
         */
        getSelector: function(selector) {
            if (typeof selector === 'string') {
                var results = [],
                    root = arguments[1] || [document],
                    fWord = selector.substr(0, 1),
                    clsContent = selector.substr(1, selector.length - 1),
                    attSel = this.selType(selector),
                    searchSelector = (attSel == 'tag') ? selector : clsContent;

                if (/^(\.|\#)*.+>(.+)$/i.test(selector)) {
                    var ret = this.checkChild(selector, root);
                    var selectedEl = this.getSelector(ret.searchSelector, ret.root);
                    if (!NWLibrary.isArray(selectedEl)) selectedEl = [selectedEl];

                    for (var i = 0; i < selectedEl.length; i++) {
                        var element = selectedEl[i],
                            parentEl = !NWLibrary.isArray(ret.root) ? [ret.root] : ret.root;
                        while (element && (element !== document.body)) {
                            if (element === parentEl) {
                                results.push(selectedEl[i]);
                                break;
                            }
                            element = element.parentNode;
                        }
                    }

                    return (results.length == 1) ? results[0] : results;
                }

                if (/^(\.|\#)*(.+)\[(.+)\]$/i.test(selector)) {
                    root = this.getSelector(RegExp.$1 + "" + RegExp.$2);
                    attSel = "xpath";
                }

                if (clsContent.indexOf(".") > -1) {
                    var arrLinkedSel = clsContent.split("."),
                        firstItem = this.defineEl(fWord + "" + arrLinkedSel[0]);

                    if (firstItem.length === undefined) firstItem = [firstItem];
                    for (var i = 0; i < firstItem.length; i++) {
                        for (var j = 1; j < arrLinkedSel.length; j++) {
                            if (firstItem[i].className.indexOf(arrLinkedSel[j]) > -1) {
                                hasntCls = true;
                            } else hasntCls = false;
                        }
                        if (hasntCls) results.push(firstItem[i]);
                    }
                } else {
                    var rootLength = root.length;
                    for (var i = 0; i < rootLength; i++) {
                        var obj = root[i];
                        this.Dom_search(root[i], function(node) {
                            if (node.nodeType === 1) {
                                if (attSel == 'tag') {
                                    if (node.tagName.toLowerCase() == searchSelector) results.push(node);
                                } else if (attSel == "class") {
                                    if (NWLibrary.browser == "ie" && NWLibrary.browserver < 8) {
                                        if (node.className != null) {
                                            var arrNode = node.className.split(" ");
                                            for (var j = 0; j < arrNode.length; j++) {
                                                if (arrNode[j] == searchSelector) {
                                                    results.push(node);
                                                    break;
                                                }
                                            }
                                        }
                                    } else {
                                        if (node.getAttribute(attSel) != null) {
                                            var arrNode = node.getAttribute(attSel).split(" ");
                                            for (var j = 0; j < arrNode.length; j++) {
                                                if (arrNode[j] == searchSelector) {
                                                    results.push(node);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                } else if (attSel == 'id') {
                                    if (node.getAttribute(attSel) === searchSelector) results.push(node);
                                } else {
                                    var xpathKind = ["~=", "*=", "$=", "!=", "^=", "="];
                                    if (/^(\.|\#)*.+\[(.+)\]$/i.test(selector)) {
                                        var xss = RegExp.$2;
                                        for (var i = 0; i < xpathKind.length; i++) {
                                            if (xss.indexOf(xpathKind[i]) > -1) {
                                                var arrInfo = xss.split(xpathKind[i]),
                                                    _attSel = arrInfo[0];
                                                if (NWLibrary.browser == "ie" && NWLibrary.browserver < 8 && _attSel == "class") _attSel = "className";
                                                searchSelector = arrInfo[1].replace(/'|"/gi, '');
                                                if (obj === node) {
                                                    var attVal = node.getAttribute(_attSel) || "";
                                                    switch (xpathKind[i]) {
                                                    case "=":
                                                        if (attVal === searchSelector) results.push(node);
                                                        break;
                                                    case "*=":
                                                        if (attVal.indexOf(searchSelector) > -1) results.push(node);
                                                        break;
                                                    case "$=":
                                                        if (NWLibrary.exec("/" + searchSelector + "$/i").test(attVal)) results.push(node);
                                                        break;
                                                    case "^=":
                                                        if (NWLibrary.exec("/^" + searchSelector + "/i").test(attVal)) results.push(node);
                                                        break;
                                                    case "~=":
                                                        if (NWLibrary.exec("/\\b" + searchSelector + "\\b/i").test(attVal)) results.push(node);
                                                        break;
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                return (results.length == 1) ? results[0] : results;
            }
        },
        /**
         * Custom 이벤트 발생.
         * @param {Object} eventName
         * @param {Object} data
         * @exception 이벤트리스너에서는 각 엘리먼트에 정의된 커스텀 이벤트에 대해서 eventName으로 구분하여 로직 처리해야 함.
         */
        fireEvt: function(eventName, data) {
            var event;
            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent("dataavailable", true, true);
            } else {
                event = document.createEventObject();
                event.eventType = "ondataavailable";
            }
            event.eventName = eventName;
            event.data = data || {};
            if (document.createEvent) {
                this.each(function(i) {
                    this.dispatchEvent(event);
                })
            } else {
                var __self = this;
                this.each(function(i) {
                    this.fireEvent(event.eventType, __self.eventRename(event));
                });
            }
        },
        /**
         * Dom 이벤트 발생.
         * IE9, FireFox, Chrome, Opera에서는 커스텀 이벤트 발생
         * @param {Object} type
         * @param {Object} data
         * 
         */
        trigger: function(type, data) {
            var e;
            if (document.createEvent) {
                e = document.createEvent("HTMLEvents");
                e.initEvent(type, true, true);
            } else {
                e = document.createEventObject();
            }

            this.each(function(i) {
                if (NWLibrary.isObject(data)) {
                    for (var i in data) e[i] = data[i];
                }
                e.data = data;
                if (document.createEvent) {
                    this.dispatchEvent(e);
                } else {
                    this.cloneNode(true).fireEvent("on" + type, e);
                }
            });
        },
        /**
         * DOM이 로드된 후에 이벤트 추가
         * @param {Object} eventType
         * @param {Object} callback
         * 보수 필요. 
         */
        domReadyEvent: function(eventType, callback) {
            var obj = this;
            if (this.el.length != 0) {
                this.addEvent(eventType, callback);
                return this;
            } else {
                domREV = setTimeout(function() {
                    delete(domREV);
                    NWLibrary(obj.selector).domReadyEvent(eventType, callback);
                }, 500);
            }
        },

        _newMouseEvent: function(msType, fn) {
            var type = (msType === "mouseenter") ? "mouseover" : "mouseout";
            this.el.addEventListener(type, nfn = function(e) {
                e.keyCode = e.which;
                var obj = e.relatedTarget;
                while (obj != this) {
                    if (!obj) return fn.call(this, e);
                    obj = obj.parentNode;
                }
            }, false);
        },
        /**
         * 이벤트 추가.
         * @param {Object} type
         * @param {Object} fn
         */
        addEvent: (function() {
            if (document.addEventListener) {
                return function(type, fn) {
                    if (this.el && this.el.nodeName || this.el === window) {
                        if (arguments.length == 3) {
                            this.el.data = arguments[1];
                            fn = arguments[2];
                        }
                        switch (type) {
                        case "mouseenter":
                            this._newMouseEvent("mouseenter", fn);
                            break;
                        case "mouseleave":
                            this._newMouseEvent("mouseleave", fn);
                            break;
                        default:
                            this.el.addEventListener(type, nfn = function(e) {
                                e.keyCode = e.which;
                                fn.call(this, e);
                            }, false);
                            break;
                        }
                        window.___eventList.push({
                            type: type,
                            func: nfn,
                            elem: this.el
                        });
                    } else if (this.el && this.el.length) {
                        for (var i = 0; i < this.el.length; i++) {
                            if (arguments.length == 3) {
                                this.el[i].data = arguments[1];
                                fn = arguments[2];
                            }
                            NWLibrary(this.el[i]).addEvent(type, fn);
                        }
                    }
                    return this;
                };
            } else {
                return function(type, fn) {
                    if (this.el && this.el.nodeName || this.el === window) {
                        if (arguments.length == 3) {
                            this.el.data = arguments[1];
                            fn = arguments[2];
                        }
                        var __self = this;
                        this.el.attachEvent('on' + type, nfn = function() {
                            fn.call(__self.el, __self.eventRename(window.event));
                        });
                        window.___eventList.push({
                            type: type,
                            func: nfn,
                            elem: this.el
                        });
                    } else if (this.el && this.el.length) {
                        for (var i = 0; i < this.el.length; i++) {
                            if (arguments.length == 3) {
                                this.el[i].data = arguments[1];
                                fn = arguments[2];
                            }
                            NWLibrary(this.el[i]).addEvent(type, fn);
                        }
                    }
                    return this;
                };
            }
        })(),
        /**
         * 이벤트 인자 네이밍.
         * IE 와 비IE의 이벤트 인자 네이밍이 다름, 하여 같은이름으로 바인딩.
         *
         */
        eventRename: function(e) {
            e.target = e.srcElement;
            e.relatedTarget = e.toElement;
            return e;
        },
        /**
         * 이벤트 삭제
         * fireEvt일 경우엔 펑션 네임만 인자로 넘기고 그 외에는 이벤트 타입과 펑션 네임 모두를 넘긴다.
         * @param {Object} type
         * @param {Object} fn
         */
        removeEvent: (function() {
            if (document.addEventListener) {
                return function(type) {
                    if (arguments.length === 2) {
                        this.each(function(i) {
                            this.removeEventListener("dataavailable", arguments[1], false);
                        });
                    } else {
                        var __self = this;
                        this.each(function(i) {
                            this.removeEventListener(type, __self.globalEventRemove(type, this), false);
                        })
                    }
                    return this;
                };
            } else {
                return function(type) {
                    if (arguments.length === 2) {
                        this.each(function(i) {
                            this.detachEvent("ondataavailable", arguments[1]);
                        });
                    } else {
                        var __self = this;
                        this.each(function(i) {
                            this.detachEvent('on' + type, __self.globalEventRemove(type, this));
                        });
                    }
                    return this;
                };
            }
        })(),
        globalEventRemove: function(type, elem) {
            var g_event = window.___eventList;
            for (var j = 0; j < g_event.length; j++) {
                if (g_event[j].type === type && g_event[j].elem === elem) {
                    var func = g_event[j].func;
                    g_event.splice(j, 1);
                    break;
                }
            }
            return func;
        },
        /**
         * selector 내부의 selector 찾기.
         */
        find: function(selector) {
            var findObj = [],
                obj = NWLibrary.copy(this),
                searchSelector = function(parentNode) {
                    var tmp = [];
                    if (NWLibrary.browser == "ie" && NWLibrary.browserver < 9) {
                        var moreSel = selector.split(",");
                        if (moreSel.length > 1) {
                            for (var key in moreSel) {
                                var _el = obj.defineEl(NWLibrary.trim(moreSel[key]), parentNode, "find");
                                if (_el.length == undefined) _el = [_el];
                                for (var i = 0, len = _el.length; i < len; i++) {
                                    if (_el != '') {
                                        tmp.push(_el[i]);
                                    }
                                }
                            }
                        } else {
                            tmp = obj.defineEl(selector, parentNode, "find");
                        }
                    } else {
                        tmp = parentNode.querySelectorAll(selector);
                        if (tmp.length == 1) tmp = tmp[0];
                    }
                    return tmp;
                };
            if (obj.el.nodeName) {
                obj.el = searchSelector(obj.el);
            } else {
                for (var i = 0; i < obj.el.length; i++) {
                    var tmp = searchSelector(obj.el[i]);
                    if (this.nodetype(tmp) == "element") {
                        findObj.push(tmp);
                    } else {
                        for (var j = 0; j < tmp.length; j++) {
                            findObj.push(tmp[j]);
                        }
                    }
                }
                obj.el = findObj;
            }
            return obj;
        },
        /**
         * array element에서 특정 index element 반환
         *  @return {Object} nw
         */
        get: function(idx) {
            var cloneNW = NWLibrary.copy(this);
            cloneNW.el = cloneNW.el[idx];
            return cloneNW;
        },
        /**
         * 엘리먼트 idx.
         * @return {int} i
         */
        index: function(el) {
            var idx = 0;
            el = (el.el) ? el.el : el;

            if (el.length) throw "parameter element's length must be one!";

            this.each(function(i) {
                if (this == el) idx = i;
            });
            return idx;
        },
        /**
         * Dom element의 textNode 반환 / 세팅
         * @return {String} || {Array} || not
         */
        text: function() {
            if (arguments[0] != null) {
                var obj = this,
                    txt = arguments[0].toString(),
                    nodeValueSet = function(node) {
                        var tmp = false;
                        for (var j in node) {
                            if (obj.nodetype(node[j]) == "text" && /\S/.test(node[j].nodeValue)) {
                                node[j].nodeValue = txt;
                                tmp = true;
                            }
                        }
                        return tmp;
                    }
                if (!this.el.nodeName) {
                    this.each(function(i) {
                        nodeValueSet(this.childNodes);
                    });
                } else {
                    if (!nodeValueSet(this.el.childNodes)) {
                        var textNode = document.createTextNode(txt);
                        this.el.insertBefore(textNode, this.el.childNodes[0]);
                    }
                }
                return this;
            } else {
                var txtNodes = [];
                if (!this.el.nodeName) throw "element count must be one";
                for (var i in this.el.childNodes) {
                    if (this.nodetype(this.el.childNodes[i]) == "text" && /\S/.test(this.el.childNodes[i].nodeValue)) {
                        txtNodes.push(NWLibrary.trim(this.el.childNodes[i].nodeValue));
                    }
                }
                return txtNodes;
            }
        },
        /**
         * innerHTML
         */
        html: function() {
            if (arguments[0]) {
                var arg = arguments[0]
                this.each(function(i) {
                    if (typeof arg == "string") this.innerHTML = arg;
                    else {
                        var clone = arg.cloneNode(true);
                        this.innerHTML = '';
                        this.appendChild(clone);
                        clone = null;
                    }
                });
                return this;
            } else {
                return this.el.innerHTML;
            }
        },
        /*  노드 타입의 String 반환 
         *  @return {String} || NULL
         */
        nodetype: function(element) {
            var nodeType = {
                'element': 1,
                'attr': 2,
                'text': 3,
                'cdatasection': 4,
                'entityreference': 5,
                'entity': 6,
                'processinginstruction': 7,
                'comment': 8,
                'document': 9,
                'documenttype': 10,
                'documentfragment': 11,
                'notation': 12
            };
            var elNode = element.nodeType;
            for (var key in nodeType) {
                if (nodeType[key] == elNode) {
                    return key;
                }
            }
            return null;
        },
        parent: function() {
            var cloneNW = NWLibrary.copy(this);
            if (cloneNW.el.nodeName) cloneNW.el = cloneNW.el.parentNode;
            else throw "element count is not 1";
            return cloneNW;
        },
        prevnode: function() {
            var cloneNW = NWLibrary.copy(this);
            if (cloneNW.el.nodeName) {
                do {
                    cloneNW.el = cloneNW.el.previousSibling;
                } while (cloneNW.el && cloneNW.el.nodeType != 1);
            } else throw "element count is not 1";
            return cloneNW;
        },
        nextnode: function() {
            var cloneNW = NWLibrary.copy(this);
            if (cloneNW.el.nodeName) {
                do {
                    cloneNW.el = cloneNW.el.nextSibling;
                } while (cloneNW.el && cloneNW.el.nodeType != 1);
            } else throw "element count is not 1";
            return cloneNW;
        },
        child: function() {
            var cloneNW = NWLibrary.copy(this);
            if (cloneNW.el.nodeName) {
                var ret = [];
                cloneNW.el = cloneNW.el.childNodes;
                for (var i = 0; i < cloneNW.el.length; i++) {
                    if (!(cloneNW.nodetype(cloneNW.el[i]) == "text" && /(\n|\r|\S)/.test(cloneNW.el[i].nodeValue))) {
                        ret.push(cloneNW.el[i]);
                    }
                }
                cloneNW.el = ret;
            } else throw "element count is not 1";
            return cloneNW;
        },
        /**
         * value 값을 가진 element에 대한 값 반환 / 세팅
         * @return {String} || not 
         */
        val: function() {
            if (this.el.length) throw "selector's length bigger than 1! use nw.each";
            if (arguments[0] !== undefined) {
                this.el.value = arguments[0];
                return this;
            } else {
                return this.el.value;
            }
        },
        /**
         * 엘리먼트에 해당 attr이 있는지 검사.
         * @param {Object} attr
         * @return Boolean
         */
        isAttr: function(attr) {
            return this.el.getAttribute(attr) != null;
        },
        /**
         * css || attr property 정의
         * @param {Object} type
         * @param {Object} obj
         */
        setProp: function(type, obj) {
            this.each(function(i) {
                for (var prop in obj) {
                    if (type == "css") {
                        if (this.style[prop] !== undefined) {
                            this.style[prop] = obj[prop];
                        }
                    } else {
                        if (NWLibrary.inArray(['checked', 'selected'], prop)) this[prop] = obj[prop];
                        else this.setAttribute(prop, obj[prop]);
                    }
                }
            });
        },
        /**
         * attr 세팅 / 반환
         * @param {Object} obj
         */
        attr: function(obj) {
            if (typeof obj == "object") {
                this.setProp.call(this, "attr", obj);
                return this;
            } else {
                if (NWLibrary.browser == "ie" && NWLibrary.browserver < 8 && obj == "class") obj = "className";
                if (NWLibrary.inArray(['checked', 'selected'], obj)) return this.el[obj];
                else return this.el.getAttribute(obj);
            }
        },
        /**
         * css 세팅 / 반환
         * @param {Object} obj
         */
        css: function(obj) {
            if (typeof obj == "object") {
                this.setProp.call(this, "css", obj);
                return this;
            } else {
                if (window.getComputedStyle) {
                    return window.getComputedStyle(this.el, null)[obj];
                } else {
                    return this.el.currentStyle[obj];
                }
            }
        },
        /**
         * className 추가
         */
        hasClass: function(className) {
            var cls = [],
                rtn = false;
            this.each(function(i) {
                var arrCls = this.className.split(" ");
                for (var i = 0, len = arrCls.length; i < len; i++) {
                    if (arrCls[i] === className) {
                        rtn = true;
                        break;
                    }
                }
            })
            return rtn;
        },
        /**
         * className 추가
         */
        addClass: function(className) {
            className = NWLibrary.trim(className);
            this.each(function(i) {
                if (this.className.indexOf(className) === -1) this.className = this.className + " " + className;
            });
            return this;
        },
        /**
         * className 삭제
         */
        removeClass: function(className) {
            className = NWLibrary.trim(className);
            this.each(function(i) {
                var cls = [];
                var arrCls = this.className.split(" ");
                for (var i = 0, len = arrCls.length; i < len; i++) {
                    if (arrCls[i] !== className) cls.push(arrCls[i]);
                }
                this.className = cls.join(" ");
            })
            return this;
        },
        /**
         * element 갯수 반환
         * @return Number
         */
        length: function() {
            var length = (this.el.length == 0) ? 0 : (this.el.length > 1) ? this.el.length : 1;
            return length;
        },
        /**
         * 엘리먼트 tagName 반환
         * @return array || string
         */
        tagName: function() {
            var tagNames = [];
            if (this.el.length > 1) {
                for (var i = 0; i < this.el.length; i++) tagNames.push(this.el[i].tagName);
            } else {
                tagNames.push(this.el.tagName);
            }
            return (tagNames.length > 1) ? tagNames : tagNames[0];
        },
        /**
         * 자식 엘리먼트 판단
         * @return boolean
         */
        isChildOf: function(parent) {
            var nMatchChild = 0,
                j = 0;
            this.each(function(i) {
                var element = this;
                while (element && (element !== document.body)) {
                    if (element === parent) {
                        nMatchChild++;
                        break;
                    }
                    element = element.parentNode;
                }
                j = i + 1;
            });
            if (nMatchChild == j) return true;
            else return false;
        },
        /**
         * 엘리먼트 삭제
         * @param {Object} element
         */
        remove: function(element) {
            function removeChildSafe(el) {
                while (el.childNodes.length > 0)
                removeChildSafe(el.childNodes[el.childNodes.length - 1]);
                el.parentNode.removeChild(el);
            }
            this.each(function(i) {
                if (element) {
                    if (NWLibrary(element).isChildOf(this)) removeChildSafe(element);
                } else {
                    removeChildSafe(this);
                }
            });
            return this;
        },
        /**
         * 엘리먼트의 offset 값 반환
         * @return {Object} left, top, width, height, absleft, abstop
         */
        offset: function() {
            var curNode = this.el;
            var abs = {
                left: 0,
                top: 0
            };
            while (curNode && curNode.tagName) {
                abs.left += curNode.offsetLeft;
                abs.top += curNode.offsetTop;
                curNode = curNode.offsetParent;
            }
            return {
                left: this.el.offsetLeft,
                top: this.el.offsetTop,
                width: this.el.offsetWidth,
                height: this.el.offsetHeight,
                absleft: abs.left,
                abstop: abs.top
            };
        },
        /**
         * 엘리먼트의 커스텀 data 정의
         * @param {Object} name
         */
        data: function(name) {
            if (arguments.length > 1) {
                this.el.setAttribute("data-" + name, arguments[1]);
                return this;
            } else {
                return this.el.getAttribute("data-" + name);
            }
        },
        /**
         * data 삭제
         * @param {Object} name
         */
        delData: function(name) {
            this.el.removeAttribute("data-" + name);
            return this;
        },
        /**
         * 엘리먼트 toggle
         */
        toggle: function() {
            this.each(function(i) {
                var isDisplay = NWLibrary(this).offset();
                this.style.display = (this.style.display == "none" || isDisplay.width == 0) ? "block" : "none";
            });
        },
        /**
         * 선택된 엘리먼트 마지막에 컨텐츠 삽입.
         * @param {Object} obj
         */
        append: function(obj) {
            if (this.el.length) {
                for (var i = 0; i < this.el.length; i++) {
                    if (typeof obj == "string") this.el[i].innerHTML += obj;
                    else {
                        var clone = obj.cloneNode(true);
                        this.el[i].appendChild(clone);
                        clone = null;
                    }
                }
            } else {
                if (typeof obj == "string") this.el.innerHTML += obj;
                else this.el.appendChild(obj);
            }
            return this;
        },
        /**
         * 선택된 엘리먼트 처음에 컨텐츠 삽입.
         * @param {Object} obj
         */
        prepend: function(obj) {
            if (this.el.length) {
                for (var i = 0; i < this.el.length; i++) {
                    if (typeof obj == "string") this.el[i].innerHTML = obj + this.el[i].innerHTML;
                    else {
                        var clone = obj.cloneNode(true);
                        this.el[i].insertBefore(clone, this.el[i].firstChild);
                        clone = null;
                    }
                }
            } else {
                if (typeof obj == "string") this.el.innerHTML = obj + this.el.innerHTML;
                else this.el.insertBefore(obj, this.el.firstChild);
            }
            return this;
        },
        hide: function() {
            this.each(function(i) {
                this.style.display = "none";
            });
        },
        show: function() {
            this.each(function(i) {
                this.style.display = "block";
            });
        },

        slideDown: function(type, callback) {
            if (NWLibrary.isAni != true) {
                this.each(function(i) {
                    var obj = NWLibrary(this),
                        _h = parseInt(obj.css("height"), 10);

                    if (_h <= 0) {
                        clone = this.cloneNode(true);
                        document.body.appendChild(clone);
                        clone.style.position = "absolute";
                        clone.style.top = "-9999px";
                        clone.style.display = "block";
                        var offsetClone = NWLibrary(clone).offset();
                        document.body.removeChild(clone);
                        clone = undefined;
                    }

                    var absHeight = (_h > 0) ? _h : offsetClone.height,
                        startPoint = 0,
                        speed = (type == "slow") ? 5 : 1,
                        perHeight = (speed == 1) ? 15 : 10;
                    obj.css({
                        'display': 'block',
                        'overflow': 'hidden',
                        'height': '0px',
                        'zIndex': '555'
                    });

                    var pInterval = setInterval(function() {
                        startPoint = startPoint + perHeight;
                        if (startPoint < absHeight) {
                            NWLibrary.isAni = true;
                            obj.css({
                                'height': startPoint + "px"
                            });
                        } else {
                            NWLibrary.isAni = false;
                            obj.css({
                                'height': absHeight + "px"
                            });
                            if (callback) callback.call(null);
                            clearInterval(pInterval);
                        }
                    }, speed);
                });
            }
            return this;
        },

        slideUp: function(type, callback) {
            if (NWLibrary.isAni != true) {
                this.each(function(i) {
                    var obj = NWLibrary(this),
                        _h = parseInt(obj.css("height"), 10);
                    absHeight = (_h <= 0) ? obj.offset().height : _h;
                    startPoint = _h || absHeight, speed = (type == "slow") ? 5 : 1, perHeight = (speed = 1) ? 15 : 10;

                    var pInterval = setInterval(function() {
                        if (startPoint > perHeight) {
                            NWLibrary.isAni = true;
                            startPoint = startPoint - perHeight;
                            obj.css({
                                'height': startPoint + "px"
                            });
                        } else {
                            NWLibrary.isAni = false;
                            obj.css({
                                'display': 'none',
                                'height': _h + "px"
                            });
                            if (callback) callback.call(null);
                            clearInterval(pInterval);
                        }
                    }, speed);
                });
            }
            return this;
        },
        fadeIn: function(speed, callback) {
            this.each(function(i) {
                var obj = this;
                if (obj.style.opacity) obj.style.opacity = 0;
                else obj.style.filter = 'alpha(opacity=0)';
                obj.style.display = "block";
                var fadeValue = 1;

                var fadeInterval = setInterval(function() {
                    if (Math.floor(fadeValue / (speed * 10)) < 1) {
                        if (obj.style.opacity) obj.style.opacity = fadeValue / (speed * 10);
                        else obj.style.filter = 'alpha(opacity=' + fadeValue / (speed * 10) * 100 + ')';
                        fadeValue++;
                    } else {
                        if (obj.style.opacity) obj.style.opacity = 1;
                        else obj.style.filter = 100;
                        clearInterval(fadeInterval);
                        if (callback) callback.call(null);
                    }
                }, 80);
            });
            return this;
        },
        fadeOut: function(speed, callback) {
            this.each(function(i) {
                var obj = this;
                obj.style.display = "block";
                var fadeValue = 0;

                var fadeInterval = setInterval(function() {
                    if (Math.floor(fadeValue / (speed * 10)) < 1) {
                        if (obj.style.opacity) obj.style.opacity = 1 - fadeValue / (speed * 10);
                        else obj.style.filter = 'alpha(opacity=' + (100 - (fadeValue / (speed * 10) * 100)) + ')';
                        fadeValue++;
                    } else {
                        if (obj.style.opacity) obj.style.opacity = 0;
                        else obj.style.filter = 'alpha(opacity=0)';
                        clearInterval(fadeInterval);
                        if (callback) callback.call(null);
                    }
                }, 80);
            });
            return this;
        },

        serialize: function() {
            var arrFormData = [],
                ret = [],
                tmp = [],
                str, param = arguments[0];

            this.each(function(i) {
                var childs = NWLibrary(this).find("input, select, textarea");

                childs.each(function(i) {
                    var obj = this,
                        type = obj.getAttribute("type");
                    if (type !== "button" && type !== "submit") {
                        if (/(checkbox|radio)/gi.test(type)) {
                            if (obj.checked) arrFormData.push({
                                name: obj.name,
                                value: encodeURIComponent(obj.value)
                            });
                        } else {
                            arrFormData.push({
                                name: obj.name,
                                value: encodeURIComponent(obj.value)
                            });
                        }
                    }
                });
            });

            NWLibrary.each(arrFormData, function(i) {
                if (param !== "object") {
                    ret.push(this.name + "=" + this.value);
                } else {
                    if (/\[\]/g.test(this.name)) {
                        var strKey = this.name.replace(/\[\]/g, '');
                        if (NWLibrary.isArray(tmp[strKey]) === false) tmp[strKey] = [];
                        tmp[strKey].push(this.value);
                    } else {
                        ret.push(this.name + ":'" + this.value + "'");
                    }
                }
            });

            if (param !== "object") {
                str = ret.join("&");
                return str;
            } else {
                for (var i in tmp) {
                    var tmpStr = [];
                    for (var j = 0, len = tmp[i].length; j < len; j++) {
                        tmpStr.push("'" + tmp[i][j] + "'");
                    }
                    ret.push(i + ":[" + tmpStr.join(",") + "]");
                }
                str = ret.join(",");
                return NWLibrary.exec("{" + str + "}");
            }
        }
    }
    // NWLibrary 체이닝에 NWLibrary의 반환된 객체 NWLibrary.core의 연결.
    NWLibrary.prototype = NWLibrary;
    // 확장을 위한 함수.
    NWLibrary.prototype.extend = function(name, fn) {
        NWLibrary.prototype[name] = NWLibrary.core.prototype[name] = fn;
    };
    NWLibrary.extend("each", function() {
        if (arguments[1]) {
            if (NWLibrary.isArray(arguments[0])) {
                for (var i = 0, len = arguments[0].length; i < len; i++) {
                    var oRet = arguments[1].call(arguments[0][i], i);
                    if (oRet !== undefined && oRet === true || oRet === false) {
                        break;
                    }
                }
            } else {
                throw "not Array";
            }
        } else {
            if (this.el.nodeType == 1) {
                arguments[0].call(this.el, 0);
            } else {
                for (var i = 0, len = this.el.length; i < len; i++) {
                    var oRet = arguments[0].call(this.el[i], i);
                    if (oRet !== undefined && oRet === true || oRet === false) {
                        break;
                    }
                }
            }
        }
        return this;
    });
    /**
     * browser action cancel
     */
    NWLibrary.extend("cancelDefault", function(e) {
        if (e && e.preventDefault) e.preventDefault();
        else window.event.returnValue = false;
    });
    /**
     * cancelbubble
     */
    NWLibrary.extend("cancelBubble", function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        else window.event.cacelBubble = true;
    });
    /**
     * DomLoad후 발생될 이벤트.
     * @param {Object} fn
     */
    NWLibrary.prototype.ready = function(fn) {
        if (document.readyState === "complete") {
            setTimeout(fn, 1);
        }
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState === "complete") {
                    fn.call(null);
                }
            });
        }
    };
    /**
     * 쿠키 set
     * @param {Object} cookieName
     * @param {Object} value
     * @param {Object} expiredays
     */
    NWLibrary.extend("setCookie", function(cookieName, value, expiredays) {
        var exdate = new Date();
        var path = (arguments[3]) ? arguments[3] : "/"
        var arrDomain = document.domain.split(".");
        var arrDomainLen = arrDomain.length;
        strdomain = arrDomain[arrDomainLen - 2] + "." + arrDomain[arrDomainLen - 1];
        var domain = ";domain=" + strdomain;
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = cookieName + "=" + escape(value) + ((expiredays == null) ? "; path=" + path : "; path=" + path + "; expires=" + exdate.toGMTString()) + domain;
    });
    /**
     * 쿠키 get
     * @param {Object} cookieName
     */
    NWLibrary.extend("getCookie", function(cookieName) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(cookieName + "=");
            if (c_start != -1) {
                c_start = c_start + cookieName.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    });
    /**
     * 쿠키 delete
     * @param {Object} cookieName
     */
    NWLibrary.extend("delCookie", function(cookieName) {
        var expireDate = new Date();
        var path = (arguments[1]) ? arguments[1] : "/"
        var arrDomain = document.domain.split(".");
        var arrDomainLen = arrDomain.length;
        strdomain = arrDomain[arrDomainLen - 2] + "." + arrDomain[arrDomainLen - 1];
        var domain = ";domain=" + strdomain;
        expireDate.setDate(expireDate.getDate() - 1);
        document.cookie = cookieName + "= " + "; path=" + path + "; expires=" + expireDate.toGMTString() + domain;
    });
    /**
     * Trim 양쪽 여백 없애기
     * @param {Object} str
     */
    NWLibrary.extend("trim", function(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    });
    /**
     * urlencode
     * @param {Object} url
     */
    NWLibrary.extend("urlencode", function(url) {
        return encodeURIComponent(url);
    });
    /**
     * urldecode
     * @param {Object} url
     */
    NWLibrary.extend("urldecode", function(url) {
        return decodeURIComponent(url);
    });
    /**
     * number_format
     * @param {Object} number
     */
    NWLibrary.extend("number_format", function(number) {
        var num = number.toString();
        var reg = /(\-?\d+)(\d{3})($|\.\d+)/g;
        if (reg.test(num)) {
            return num.replace(reg, function(str, n1, n2, n3) {
                return NWLibrary.number_format(n1) + "," + n2 + "" + n3;
            });
        } else {
            return num;
        }
    });
    /**
     * eval 대체 함수.
     * @param {Object} str
     */
    NWLibrary.extend("exec", function(str) {
        return (new Function('', 'return ' + str + ';'))();
    });
    /**
     * strPad - 빈공간 문자열 채우기
     * @param {Object} origin
     * @param {Object} word
     * @param {Object} scope
     */
    NWLibrary.extend("strPad", function(origin, scope, word) {
        var tmp = '';
        origin = origin.toString();
        for (var i = 0; i < scope - origin.length; i++) {
            tmp += word;
        }
        return tmp + origin;
    });
    /**
     * 플러그인 존재 여부
     * @param {Object} plugin
     */
    NWLibrary.extend("isPlugin", function(plugin) {
        var arg = plugin.toLowerCase();
        if (NWLibrary.browser == "ie") {
            var activeX = ['AcroPDF.PDF', 'ShockwaveFlash.ShockwaveFlash', 'QuickTime.QuickTime', 'WMPlayer.OCX'];
            var searchActiveX = '';
            for (var i = 0; i < activeX.length; i++) {
                if (activeX[i].toLowerCase().indexOf(arg) > -1) {
                    searchActiveX = activeX[i];
                    break;
                }
            }
            if (searchActiveX == '') return false;
            try {
                var control = new ActiveXObject(searchActiveX);
                if (control) return true;
            } catch (e) {
                return false;
            }
        } else {
            for (var i = 0; i < navigator.plugins.length; i++) {
                var pluginDes = navigator.plugins[i].description.toLowerCase();
                if (pluginDes.indexOf(arg) > -1) {
                    return true;
                }
            }
            return false;
        }
    });
    /**
     * 링크 이동시 referrer가 꼭 필요할 경우 사용.
     * @param {Object} url
     */
    NWLibrary.extend("refURL", function(url) {
        if (NWLibrary.browser == "ie") {
            var anchor = document.createElement('a');
            anchor.href = url;
            document.body.appendChild(anchor);
            anchor.click();
        } else {
            document.location.href = url;
        }
    });
    /**
     * 쿼리스트링 값 가져오기.
     * @param {Object} key
     */
    NWLibrary.extend("qString", function(key) {
        var ret = qs = "";
        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        if (arguments[1] != undefined) {
            qs = regex.exec(arguments[1]);
        } else {
            qs = regex.exec(document.location.href);
        }
        if (qs == null) ret = "";
        else ret = qs[1];
        return ret;
    });
    /**
     * length 구하기
     * @param {Object} key
     */
    NWLibrary.extend("size", function(o) {
        if (o.length) return o.length;
        else if (typeof o == 'object') return (function() {
            var size = 0,
                key;
            for (key in o)
            if (o.hasOwnProperty(key)) size++;
            return size;
        })();
        else return 0;
    });
    /**
     * var의 타입 가져오기
     * @param {Object} obj
     */
    NWLibrary.extend("getType", function(o) {
        var typeName = Object.prototype.toString.call(o);
        return typeName.substring(7, typeName.length - 1).toLowerCase();
    });
    /**
     * isArray
     * @param {Object} obj
     */
    NWLibrary.extend("isArray", function(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    });
    NWLibrary.extend("inArray", function(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === val) return true;
        }
        return false;
    });
    /**
     * isObject
     * @param {Object} obj
     */
    NWLibrary.extend("isObject", function(obj) {
        return Object.prototype.toString.call(obj) == '[object Object]';
    });
    /**
     * isFunction
     * @param {Object} obj
     */
    NWLibrary.extend("isFunction", function(obj) {
        return Object.prototype.toString.call(obj) == '[object Function]';
    });
    /**
     * isBoolean
     * @param {Object} obj
     */
    NWLibrary.extend("isBoolean", function(obj) {
        return Object.prototype.toString.call(obj) == '[object Boolean]';
    });
    /**
     * isString
     * @param {Object} obj
     */
    NWLibrary.extend("isString", function(obj) {
        return Object.prototype.toString.call(obj) == '[object String]';
    });
    /**
     * isNumber
     * @param {Object} obj
     */
    NWLibrary.extend("isNumber", function(obj) {
        return Object.prototype.toString.call(obj) == '[object Number]';
    });
    /**
     * isDate
     * @param {Object} obj
     */
    NWLibrary.extend("isDate", function(obj) {
        return Object.prototype.toString.call(obj) == '[object Date]';
    });
    /**
     * isRegExp
     * @param {Object} obj
     */
    NWLibrary.extend("isRegExp", function(obj) {
        return Object.prototype.toString.call(obj) == '[object RegExp]';
    });
    /**
     * Ajax 모듈.
     */
    NWLibrary.extend("ajax", function() {
        var vars = {
            url: "",
            param: "",
            method: "get",
            dataType: "text",
            timeout: 10000,
            async: true,
            cache: false,
            // 디폴트로 캐시 하지 않음.
            xhr: null,
            onload: null,
            onabort: null,
            onerror: null,
            onsuccess: null,
            onprogress: null,
            onsendbefore: null,
            onreadystatechange: null,
            overridemimetype: ["text/xml", "text/html", "text/plain", "application/json"]
        };
        for (var attr in arguments[0]) {
            if (NWLibrary.isString(arguments[0][attr])) {
                if (attr != "url" && attr != "param") vars[attr] = (arguments[0][attr]).toLowerCase();
                else vars[attr] = arguments[0][attr];
            } else {
                vars[attr] = arguments[0][attr];
            }
        }
        var mime = (vars.dataType == "json") ? vars.overridemimetype[3] : (vars.dataType == "xml") ? vars.overridemimetype[0] : (vars.dataType == "html") ? vars.overridemimetype[1] : vars.overridemimetype[2];
        if (window.XMLHttpRequest) {
            vars.xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                vars.xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                vars.xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            vars.xhr = false;
        }
        if (vars.xhr) {
            if (vars.xhr.timeout) vars.xhr.timeout = vars.timeout;
            vars.xhr.onload = function(data) {
                if (vars.onload) vars.onload.call(null, data);
            };
            vars.xhr.onprogress = function(data) {
                if (vars.onprogress) vars.onprogress.call(null, data);
            };
            vars.xhr.onabort = function(data) {
                if (vars.abort) vars.onabort.call(null, data);
            };
            vars.xhr.onreadystatechange = function() {
                function evalScript(doc) {
                    try {
                        if (doc != '') {
                            var script = '';
                            doc = doc.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function() {
                                if (doc !== null) script += arguments[1] + '\n';
                                return '';
                            });
                            if (script)(window.execScript) ? window.execScript(script) : window.setTimeout(script, 0);
                        }
                        return false;
                    } catch (e) {}
                }
                if (this.readyState == 4) {
                    if (this.status == 200 || this.statusText == "OK") {
                        var data = (vars.dataType == "xml") ? this.responseXML : (vars.dataType == "json") ? NWLibrary.exec(this.responseText) : this.responseText;
                        evalScript(data);
                        vars.onsuccess.call(this, data);
                    } else {
                        vars.onerror.call(this, data);
                    }
                }
            };
            if (vars.method == "get") {
                vars.url = (vars.param != "") ? vars.url += "?" + vars.param : vars.url + "?";
                vars.url += (vars.cache == false) ? "&" + Math.floor(Math.random() * 9999999) : "";
            }
            if (vars.onsendbefore) vars.onsendbefore.call(null);
            vars.xhr.open(vars.method, vars.url, vars.async);
            if (vars.xhr.overrideMimeType) vars.xhr.overrideMimeType(mime);
            switch (vars.method) {
            case "get":
                vars.xhr.send(null);
                break;
            case "post":
                vars.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                if (vars.cache == false) {
                    vars.xhr.setRequestHeader("Cache-Control", "no-cache, must-revalidate");
                    vars.xhr.setRequestHeader("Pragma", "no-cache");
                }
                vars.xhr.send(vars.param);
                break;
            }
        } else {
            alert("Can't support Ajax this browser");
        }
    });
    /**
     * timestamp 가져오기
     */
    NWLibrary.extend("timestamp", function() {
        return new Date().getTime();
    });
    /**
     * 동적 스크립트 로드
     * @param {Object} src
     * @param {Object} callback
     */
    NWLibrary.extend("loadScript", function(src, callback) {
        var scripts = document.getElementsByTagName("script"),
            isScript = false;
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf(src) > -1) {
                isScript = true;
                callback.call(null);
                break;
            }
        }
        if (isScript == false) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", src);
            script.async = true;
            document.getElementsByTagName("head")[0].appendChild(script);
            if (typeof callback == 'function') {
                script.onload = script.onreadystatechange = function() {
                    if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                        script = script.onreadystatechange = null;
                        callback.call(null);
                    }
                }
            }
        }
    });
    /**
     * 스크립트 동적 삭제
     * @param {Object} src
     */
    NWLibrary.extend("delScript", function(src) {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src.indexOf(src) > -1) {
                NWLibrary(scripts[i]).remove();
            }
        }
    });
    /**
     * jsonp 
     * @param {Object} src
     * @param {Object} callback
     */
    NWLibrary.extend("jsonp", function(src, callback) {
        var jsonpcallback = "NW" + Math.ceil(Math.random() * NWLibrary.timestamp());
        var script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", src.replace("callback=?", "callback=" + jsonpcallback));
        script.setAttribute("async", true);
        document.getElementsByTagName("head")[0].appendChild(script);
        window[jsonpcallback] = callback;
        var obj = this;
        if (typeof callback == 'function') {
            script.onload = script.onreadystatechange = function() {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    script.onload = script.onreadystatechange = null;
                    obj.delScript(script.src);
                    delete window[jsonpcallback];
                }
            }
        }
    });
    /**
     * is_mobile
     * @return {Boolean}
     */
    NWLibrary.extend("is_mobile", function() {
        var arrAgent = ['iPhone', 'iPod', 'BlackBerry', 'Android', 'Windows CE', 'LG', 'MOT', 'SAMSUNG', 'SonyEricsson'];
        var userAgent = navigator.userAgent;
        for (var i = 0; i < arrAgent.length; i++) {
            if (new RegExp(arrAgent[i]).test(userAgent) === true) return true;
        }
        return false;
    });
    /**
     * in_array
     * @param {Object} value
     * @param {Array} hashStack
     * @return {Boolean}
     */
    NWLibrary.extend("in_array", function(value, hashStack) {
        for (var key in hashStack) {
            if (hashStack[key] === value) return true;
        }
        return false;
    });
    /**
     * 배열 셔플.
     * @param {Object} arr
     */
    NWLibrary.extend("arrayShuffle", function(arr) {
        return arr.sort(function(a, b) {
            return Math.round(Math.random() * 2) - 1;
        });
    });
    /**
     * 배열 인자 삭제하기 
     * @param {Object} arr
     * @param {Object} from
     * @param {Object} to
     */
    NWLibrary.extend("arrayRemove", function(arr, from, to) {
        var rest = arr.slice((to || from) + 1 || arr.length);
        arr.length = from < 0 ? arr.length + from : from;
        arr.push.apply(arr, rest);
        return arr;
    });
    /**
     * 브라우저 정보.
     * @return {browser, os, browserver}
     */
    (function() {
        var userAgent = navigator.userAgent,
            platform = navigator.platform,
            de = document.documentElement,
            arrData = [{
                'exp': /Chrome/,
                'ver': /Chrome\/[0-9.]+/i,
                'name': 'chrome'
            }, {
                'exp': /CriOS/,
                'ver': /CriOS\/[0-9.]+/i,
                'name': 'chrome-ios'
            }, {
                'exp': /Firefox/,
                'ver': /Firefox\/[0-9.]+/i,
                'name': 'firefox'
            }, {
                'exp': /Safari/,
                'ver': /Version\/[0-9.]+/i,
                'name': 'safari'
            }, {
                'exp': /MSIE/,
                'ver': /MSIE\s{1}[0-9.]+/i,
                'name': 'ie'
            }, {
                'exp': /Opera/,
                'ver': /Version\/[0-9.]+/i,
                'name': 'opera'
            }];
        var browser = OS = version = '';
        for (var i = 0; i < arrData.length; i++) {
            if (arrData[i].exp.test(userAgent) === true) {
                browser = arrData[i].name;
                if (userAgent.match(arrData[i].ver) != null) version = (browser == 'ie') ? userAgent.match(arrData[i].ver)[0].split(" ")[1] : userAgent.match(arrData[i].ver)[0].split("/")[1];
                break;
            }
        }
        if (browser == '') {
            browser = undefined;
            version = undefined;
        }
        if (/Win/.test(platform)) {
            OS = "win";
        } else if (/Mac/.test(platform)) {
            OS = "mac";
        } else if (/Linux/.test(platform)) {
            OS = "linux";
        } else {
            OS = undefined;
        }
        NWLibrary.browser = browser;
        NWLibrary.os = OS;
        NWLibrary.browserver = version;
        NWLibrary.lang = navigator.userLanguage || navigator.language; // 리턴 값 통일 필요.
        NWLibrary.globalHash = '';
        window.___eventList = [];

        NWLibrary.ready(function() {
            NWLibrary.windowHeight = self.innerHeight || de.clientHeight || document.body.clientHeight;
            NWLibrary.windowWidth = self.innerWidth || de.clientWidth || document.body.clientWidth;
        });
    })();

    // 현재 스크롤 x 좌표
    NWLibrary.extend("scrollX", function() {
        return self.pageXoffset || document.documentElement.scrollLeft || document.body.scrollLeft;
    });

    // 현재 스크롤 y 좌표
    NWLibrary.extend("scrollY", function() {
        return self.pageYoffset || document.documentElement.scrollTop || document.body.scrollTop;
    });

    // 현재 페이지 높이
    NWLibrary.extend("pageHeight", function() {
        return document.documentElement.scrollHeight || document.body.scrollHeight;
    });

    // 현재 페이지 넓이
    NWLibrary.extend("pageWidth", function() {
        return document.documentElement.scrollWidth || document.body.scrollWidth;
    });

    NWLibrary.extend("offsetX", function(e) {
        var elm = e.srcElement || e.target;
        return (!e.offsetX) ? e.layerX : e.offsetX;
    });

    NWLibrary.extend("offsetY", function(e) {
        var elm = e.srcElement || e.target;
        return (!e.offsetY) ? e.layerY : e.offsetY;
    });

    NWLibrary.extend("copy", function(obj) {
        var newObj = (NWLibrary.isArray(obj)) ? [] : {};
        for (i in obj) newObj[i] = obj[i];
        return newObj;
    });

    NWLibrary.extend("callHashContents", function(url, callback) {
        if (nw.browser == "ie") {
            var ifr = document.frames['__hashControl'];
            ifr.hash = NWLibrary.globalHash;
        }
        callback.call(null, url);
    });
    NWLibrary.extend("startHashControl", function(callback) {
        if (nw.browser == "ie") {
            var frm = document.createElement('IFRAME');
            frm.setAttribute("name", "__hashControl");
            frm.setAttribute("id", "__hashControl");
            frm.setAttribute("width", 0);
            frm.setAttribute("height", 0);
            document.body.appendChild(frm);

            var ifrm = document.getElementById('__hashControl');
            ifrm_doc = ifrm.contentWindow.document;
            ifrm_doc.open();
            ifrm_doc.write("<script type='text/javascript'>var hash = '';<\/script>");
            ifrm_doc.close();
        }
        NWLibrary.__hashInterval = setInterval(function() {
            if (nw.browser == "ie") {
                if (nw("#__hashControl").readyState == "complete") {
                    var ifr = document.frames['__hashControl'];
                    var getHash = ifr.hash;
                    if (getHash.length > 0) {
                        NWLibrary.callHashContents(getHash, callback);
                    }
                }
            }
            var sHash = window.location.hash.replace('#', '');
            if (NWLibrary.globalHash != sHash) {
                if (sHash.length > 0) {
                    NWLibrary.callHashContents(sHash, callback);
                    NWLibrary.globalHash = sHash;
                }
            }
            if (arguments[1]) location.hash = arguments[1];
        }, 100);
    });

    window.nw = NWLibrary;
})();
 