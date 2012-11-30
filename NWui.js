/**
 * NWUILibrary
 * @author : asterism612@gmail.com
 */
(function(ui){
  /**
   * date countdown skeleton
   * @param : targetDay
   */
  ui.extend("countDown", function(specialDay, callback){ /*{{{*/
    if(this.el.nodeName){
      var obj = this;
      var date = new Date();
      date.setFullYear(specialDay.substr(0, 4));
      date.setMonth(specialDay.substr(4, 2)-1);
      date.setDate(specialDay.substr(6, 2));
      date.setHours(specialDay.substr(8, 2), specialDay.substr(10, 2), specialDay.substr(12, 2));
      var timestamp = date.getTime();

     	nw_ui_chkInterval = setInterval(function(){
        var now = new Date();
        var targetDay = new Date(timestamp);
        var Mil = targetDay.getTime()-now.getTime();
        var Sec = parseInt(Mil/1000),
            Min = parseInt(Sec / 60),
            Hour = parseInt(Min / 60),
            Days = parseInt(Hour / 24),
//            Month = parseInt(Days / 30),
            Year = parseInt(Days / 365);
        var displayTimes;
				
				if(isNaN(Mil) || Mil < 0){
					clearInterval(nw_ui_chkInterval);
					callback.call(obj);
					return false;
				}else{
//        if(Year > 0) displayTimes = Year+"년 전";
//        else if(Month > 0) displayTimes = Month+"개월 전"+(Days%30)+"일"+(Hour%24)+"시간"+(Min%60)+"분"+(Sec%60)+"초 전";
					if(Days >= 0) displayTimes = Days+"days"+(Hour%24)+":"+(Min%60)+":"+(Sec%60);
					else if(Hour >= 0) displayTimes = Hour+":"+(Min%60)+":"+(Sec%60);
					else if(Min >= 0) displayTimes = Min+":"+(Sec%60);
					else if(Sec >= 0) displayTimes = "00:"+Sec;
					else displayTimes = "";

					ui(obj.el).html(displayTimes);
       	}
			}, 500);
    }
  }); /*}}}*/

	/**
	 * Object flicking 
   * - mobile only
	 */
  ui.extend("flicking", function(callback){ /*{{{*/
    var obj = this,
	  		dir, viewTarget,	  		
	  		__f_idx = 0,
	  		__f_touch = false,
	  		__f_start_point,
	  		__f_width = parseInt(this.css('width'), 10),	  		
	  		containerOffsetX = this.offset().absleft,
	  		animation = function(type){
	  			// 일단 이 녀석만 구현하면 대충 플리킹 완성.
	  			// 리팩토링은 이거 구현 후에 하겠음.
	  			switch(type){
	  				case "right" : break;
	  				case "left" : break;
	  			}
	  		},
	  		//cur, next, prev 순서.
	  		idxset = function(childs){
          viewTarget = [nw(childs.el[__f_idx]), 
          							(__f_idx+1 > childs.length()-1) ? nw(childs.el[0]) : nw(childs.el[__f_idx+1]), 
          							(__f_idx-1 < 0) ? nw(childs.el[childs.length()-1]) : nw(childs.el[__f_idx-1])];
	  		},
	  		displayset = function(childs){
		  		childs.each(function(i){if(i != __f_idx) this.style.display='none';});
         	for(var i=0; i < 3; i++){
         		var type = (i == 2) ? "-" : "";
         		var width = (i == 0) ? 0 : __f_width;
         		viewTarget[i].css({left:type+""+width+'px', display:'block'});
					}
	  		},
	  		offsetX = function(e){
		    	var pageX = (e.touches[0]) ? e.touches[0].pageX : e.changedTouches[0].pageX;
		    	var osLeft = ui(e.srcElement).offset().absleft || ui(e.target).offset().absleft;
		    	return pageX - osLeft;
	  		};
  	this.each(function(i){
  		var self = ui(this),
  		    childs = ui(this).child();

  		obj.css({position:'relative', overflow:'hidden'});
  		childs.css({position:'absolute', display:'none'});
   		idxset(childs);
			displayset(childs);

  		self.addEvent('touchstart', function(e){
  			__f_touch = true;
  			__f_start_point = {ox:offsetX(e)};
      }).addEvent('touchmove', function(e){
        ui.cancelDefault();
  		  if(__f_touch === true){
			  	dir = offsetX(e);
   		    var direction = __f_start_point.ox - dir;
          if(direction > 0){
          	for(var i=0; i < 3; i++)
          		viewTarget[i].css({left: parseInt(viewTarget[i].css('left'), 10)-direction+'px'})
          }else{
          	for(var i=0; i < 3; i++)
          		viewTarget[i].css({left: parseInt(viewTarget[i].css('left'), 10)+Math.abs(direction)+'px'})
          }
        }
  		}).addEvent('touchend', function(e){
				if(dir !== undefined){
					var endPageX = (e.touches[0]) ? e.touches[0].pageX-containerOffsetX : 
													e.changedTouches[0].pageX-containerOffsetX;
		  		var direction = __f_start_point.ox - endPageX;
	  			if(direction > 0){
	  				animation('right');
	  				__f_idx = (__f_idx == childs.length()-1) ? 0 : __f_idx+1;
	  			}else{
	  				animation('left');
	  				__f_idx = (__f_idx == 0) ? childs.length()-1 : __f_idx-1;
	  			}
					idxset(childs);
	 				displayset(childs);
	 				dir = undefined;
	  		  __f_touch = false;
          callback.call(this);
	  		}
  		});
  	});
  }); /*}}}*/

  /**
   *  customScrollBar.
   */
  ui.extend("customScroll", function(param){ /*{{{*/
    return new customScroll(param);
  }); /*}}}*/

  ui.extend("blockUI", function(param,callback){ /*{{{*/
    var uiObj = document.getElementById("__blockUIObj");
    var uiCont = document.getElementById("__blockUIContent");
    if(!uiObj){
      var baseDiv = document.createElement("div"),
          customCss = param.cssText ? param.cssText : '';
      baseDiv.setAttribute("id", "__blockUIObj");
      baseDiv.style.cssText = "background:#000;width:100%; height:100%; z-index:99998;position:fixed;top:0;left:0;" 
                        +"-moz-opacity:"+param.opacity+" !important;"
                        +"-webkit-opacity:"+param.opacity+" !important;"
                        +"-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity="+param.opacity+")';filter:alpha(opacity="+(param.opacity*100)+") !important;opacity: "+param.opacity+" !important;"+customCss;

      document.body.appendChild(baseDiv);
    }

    if(!uiCont){
      var tmpDiv = document.createElement("div");
      tmpDiv.setAttribute("id", "__blockUIContent");
    }else{
      var tmpDiv = uiCont;
    }

    if(ui.isString(param.message)){
      tmpDiv.innerHTML = param.message;
      param.message = ui(tmpDiv);
    }else{
      //var clone = param.message.el.cloneNode(true);
      //document.body.appendChild(clone);
      tmpDiv.innerHTML = "";
      tmpDiv.appendChild(param.message.el);
    }
    param.message.show();
    if(!uiCont){
      document.body.appendChild(tmpDiv);
    }else{
      uiCont.style.display = "block";
    }
    var __block = ui("#__blockUIObj"),
        contentOffset = param.message.offset(),
        contentHeight = contentOffset.height,
        contentWidth = contentOffset.width;
    param.message.css({'top':'50%', 'left':'50%', 'margin':'-'+(contentHeight/2)+'px 0px 0px -'+(contentWidth/2)+'px', 'zIndex':'99999', 'position':'fixed'});
    
    if(callback && typeof(callback) == 'function')  callback.call(null);
  }); /*}}}*/

  ui.extend("unblockUI", function(callback){ /*{{{*/
    var uiCont = document.getElementById("__blockUIContent"),
        originData = document.getElementById("__originBlockData__"),
        origin = uiCont.childNodes[0];
        origin.style.left = "-99999px";
        
    if(originData == null){
      var history = document.createElement("div");
      history.setAttribute("id", "__originBlockData__");
      document.body.appendChild(history);
    }
    ui("#__originBlockData__").prepend(origin);
    ui(document.body).remove("#__blockUIObj").remove("#__blockUIContent");
    
    if(callback && typeof(callback) == 'function')  callback.call(null);
  }); /*}}}*/
  
  ui.extend("scrollImgViewer", function(param){ /*{{{*/
    var controlAreaWidth = param.style.thumbwidth + param.style.thumbmarginleft + param.style.thumbmarginright + param.style.scrollwidth,
        viewerAreaWidth = parseInt(this.css("width"), 10) - controlAreaWidth,
        viewerAreaHeight = parseInt(this.css("height"), 10),
        randomID = Math.floor(Math.random() * 1000000) + 1,
        controlArea = [], viewerArea, idxImg,
        loadingMsg = "loading....",
        overImg = "_ove", actImg = "_act";
   
    function loadImg(src, index){
      var image = new Image();
      nw(image).attr({width:viewerAreaWidth, height:viewerAreaHeight, index:index});
      image.onload = function() {
        ui("#__viewerImg"+randomID).html(image);
      };
      image.src = src;
    }
   
    function changeImage(obj, type){
      if(type == "over"){
        var str = obj.src;
        var ext = str.substr(str.length - 4, str.length);
        var file = str.replace(ext, "");
        obj.src = file+overImg+ext;
      }else if(type == "out"){
        if(obj.tagName.toLowerCase() == "img"){
          obj.src = obj.src.replace(overImg, "");
        }
      }
    }

    // 이부분은 html단의 view 분리하기전 코드임. 
    controlArea.push("<div id='__ctlArea"+randomID+"' style='width:"+controlAreaWidth+"px;height:"+viewerAreaHeight+"px;'><ul id='__vimglist'>");
    for(var i = 0, len = param.thumblist.length; i < len; i++){
      controlArea.push("<li class='_thumbContainer' style='position:relative;width:"+param.style.thumbwidth+"px;height:"+param.style.thumbheight+"px;overflow:hidden;");
      controlArea.push("margin-left:"+param.style.thumbmarginleft+"px;");
      controlArea.push("margin-right:"+param.style.thumbmarginright+"px;");
      controlArea.push("margin-top:"+param.style.thumbmargintop+"px;");
      controlArea.push("margin-bottom:"+param.style.thumbmarginbottom+"px;'>");
      controlArea.push("<img src='"+param.thumblist[i]+"' width='"+param.style.thumbwidth+"' height='"+param.style.thumbheight*param.style.sprite+"' origin='"+param.originlist[i]+"' index='"+i+"'/></li>");
    }
    controlArea.push("</ul></div>");
    controlArea = controlArea.join("");
    
    if(param.style.prevleft){
      var absmiddle = viewerAreaHeight / 2 - param.style.prevcontrolHeight / 2;
      viewerContrlLeft = " <img src='"+param.style.prevleft+"' style='position:absolute;left:0;z-index:1000;top:"+absmiddle+"px;cursor:pointer;' id='prev"+randomID+"'/>";
      viewerContrlRight = "<img src='"+param.style.prevright+"' style='position:absolute;right:0;z-index:1000;top:"+absmiddle+"px;cursor:pointer;' id='next"+randomID+"'/>";
      viewerArea = "<div id='__viewerArea"+randomID+"' style='position:relative;width:"+viewerAreaWidth+"px;height:"+viewerAreaHeight+"px;float:left;'>"+
                   "<div id='__viewerImg"+randomID+"'></div>"+viewerContrlLeft+""+viewerContrlRight+"</div>";
    }else{
      viewerArea = "<div id='__viewerArea"+randomID+"' style='position:relative;width:"+viewerAreaWidth+"px;height:"+viewerAreaHeight+"px;float:left;'><div id='__viewerImg"+randomID+"'></div></div>";
    }
    this.append(viewerArea).append(controlArea);
    var ctlArea = ui("#__ctlArea"+randomID),
        imgs = ui("#__ctlArea"+randomID+" img").css({cursor:'pointer'}); 

    if(param.style.prevleft){
      ui("#prev"+randomID).addEvent("mouseover", function(e){
        changeImage(this, "over");
      }).addEvent("mouseout", function(e){
        changeImage(this, "out");
      }).addEvent("click", function(e){
        var idx = parseInt(this.parentNode.childNodes[0].childNodes[0].getAttribute("index"), 10),
            index = (idx - 1 < 0) ? param.thumblist.length - 1 : idx - 1;
        ctlArea.trigger("click", {'idx':""+index, 'scroll':customScr});
      });
      ui("#next"+randomID).addEvent("mouseover", function(e){
        changeImage(this, "over");
      }).addEvent("mouseout", function(e){
        changeImage(this, "out");
      }).addEvent("click", function(e){
        var idx = parseInt(this.parentNode.childNodes[0].childNodes[0].getAttribute("index"), 10),
            index = (idx + 1 == param.thumblist.length) ? 0 : idx + 1;
        ctlArea.trigger("click", {'idx':""+index, 'scroll':customScr, 'type':'down'});
      });
    }

    ctlArea.addEvent('mouseover', function(e){
      var target = e.target; 
      if(target.tagName.toLowerCase() == "img"){
        if(/(_act)/i.test(target.src) === false){
          changeImage(target, "over");
        }
      }
    }).addEvent('mouseout', function(e){
      var target = e.target; 
      changeImage(target, "out");
    }).addEvent('click', function(e){
      var target = e.target;

      if(e.data !== undefined && e.data !== null && e.data !== ""){
        target = ui(this).find("img").get(e.data).el;
      }
      
      if(e.idx !== undefined && e.idx !== null && e.idx !== ""){
        target = ui(this).find("img").get(e.idx).el;
      }

      if(e.idx){
        var totalSize = this.childNodes[0].offsetHeight,
            toSize = (target.offsetHeight + param.style.thumbmargintop + param.style.thumbmarginbottom) * e.idx;
        e.scroll.changeScroll(Math.floor(toSize/totalSize * 100));
      } 

      if(target.tagName.toLowerCase() == "img"){
        ui(target.parentNode.parentNode).find("img").each(function(i){
          this.src = this.src.replace(overImg, "").replace(actImg, "");
        });
        document.getElementById("__viewerImg"+randomID).innerHTML = loadingMsg;
        loadImg(target.getAttribute("origin"), target.getAttribute("index"));
        var str = target.src;
        var ext = target.src.substr(str.length - 4, str.length);
        var file = target.src.replace(ext, "").replace(overImg, "").replace(actImg, "");
        target.src = file+actImg+ext;
      }
    });
    loadImg(param.originlist[0], 0);
    //ctlArea.trigger("click", 0);
    var customScr = ctlArea.customScroll({el:"__ctlArea"+randomID,  
                          scrollbar_width:param.style.scrollwidth, 
                          tImage:param.style.scrolltop, 
                          mImage:param.style.scrollimg, 
                          bImage:param.style.scrollbottom,
                          thumbudheight:param.style.scrolltopheight});
    return {
      selectThumb : function(idx){
        ctlArea.trigger("click", {'idx':idx, 'scroll':customScr});
      }
    };
  });/*}}}*/

  ui.extend("rollingViewer",function(param){ /*{{{*/
    var thumbArea = []
      , randomID = Math.floor(Math.random() * 1000000) + 1
      , controlHtml = ''
      , ulWidth = 0
      , overImg = '_ove'
      , callback = arguments[1] || null;
    
      function changeImage(obj, type){
        if(type == 'over'){
          var str = obj.src;
          var ext = str.substr(str.length - 4, str.length);
          var file = str.replace(ext, '');
          obj.src = file+overImg+ext;
        }else if(type == 'out'){
          if(obj.tagName.toLowerCase() == 'img'){
            obj.src = obj.src.replace(overImg, '');
          }
        }
      }
    
    thumbArea.push('<div style="width:'+param.style.controllerWidth+'px;margin:2px 23px 15px;overflow-x:hidden;"><ul id="_ctlArea_'+randomID+'" style="overflow:hidden;display:block;">');
    for(var i = 0, len = param.thumbImgs.length; i < len; i++){
      if(i == 0){
        var tmpUrl = param.thumbImgs[i];
        var ext = tmpUrl.substr(tmpUrl.length-4,tmpUrl.length);
        var overUrl = tmpUrl.replace(ext,'');
        param.thumbImgs[i] = overUrl+overImg+ext;
      }
      thumbArea.push('<li style="float:left;margin-left:'+param.style.thumbLeftMargin+'px;"><img src="'+param.thumbImgs[i]+'" width="'+param.style.thumbWidth+'" height="'+param.style.thumbHeight+'" big="'+param.bigImgs[i]+'" idx="'+i+'" style="cursor:pointer;"/></li>');
      ulWidth += parseInt(param.style.thumbWidth+param.style.thumbLeftMargin,10);
      
    }
    thumbArea.push('</ul></div>');
    thumbArea.push('<div class="nav"><span class="lt"><img src="http://file.poby.kr/clg/sso/en/teaser/img/common/btn_ss_navleft.jpg" id="_lbtn_'+randomID+'" style="cursor:pointer;"/></span><span class="rt"><img src="http://file.poby.kr/clg/sso/en/teaser/img/common/btn_ss_navright.jpg" id="_rbtn_'+randomID+'" style="cursor:pointer;"/></span></div>');
    controlHtml = thumbArea.join('');
    
    this.append('<div id="_rolling_'+randomID+'" style="position:relative;width:'+param.style.viewerWidth+'px;height:'+param.style.viewerHeight+'px;"><div style="padding:15px;"><img src="'+param.bigImgs[0]+'" width="'+param.style.bigWidth+'" height="'+param.style.bigHeight+'" id="_Img_'+randomID+'" idx="0" style="border:1px solid #000;cursor:pointer;"/></div>'+controlHtml+'</div>');

    var rollingArea = ui('#_rolling_'+randomID)
      , ImgArea = ui('#_Img_'+randomID)
      , ctlArea = ui('#_ctlArea_'+randomID)
      , lbtn = ui('#_lbtn_'+randomID)
      , rbtn = ui('#_rbtn_'+randomID)
      , parentWidth = parseInt(ctlArea.parent().css('width'),10)
      , allPages = 0
      , nowPage = 1;

    ctlArea.css({width:ulWidth+'px'});
    allPages = Math.ceil(ulWidth/parentWidth);
    
    rollingArea.addEvent('mouseover', function(e){
      var target = e.target; 
      if(target.tagName.toLowerCase() == 'img'){
        if(target.src.indexOf(overImg+'.') < 0)
          changeImage(target, 'over');
      }
    }).addEvent('mouseout', function(e){
      var target = e.target;
      if(target.tagName.toLowerCase() == 'img'){
        if(target.getAttribute('big')){
          if(target.getAttribute('idx') != ImgArea.attr('idx')){
            changeImage(target, 'out');
          }
        } else {
          changeImage(target, 'out');
        }
     }
    });
    
    var isAnimating = false;

    rbtn.addEvent('click',function(e){
      if(isAnimating) return false;

      if(allPages != nowPage) {
        var Interval = setInterval(function(){
          isAnimating = true;
          var tmpMargin = parseInt(ctlArea.css('marginLeft'),10);
          
          if(-(nowPage*parentWidth) >= tmpMargin){
            clearInterval(Interval);
            nowPage++;
            isAnimating = false;
          } else {
            ctlArea.css({'marginLeft':(tmpMargin-5)+'px'});
          }
        },5);
      } else {
        isAnimating = true;
        nowPage = 1;

        var Interval = setInterval(function(){
          var tmpMargin = parseInt(ctlArea.css('marginLeft'),10);

          if( 0 <= tmpMargin){
            clearInterval(Interval);
            isAnimating = false;
          } else {
            ctlArea.css({'marginLeft':(tmpMargin+5)+'px'});
          }
        },5);
 
      }
    });
    
    lbtn.addEvent('click',function(e){
     if(isAnimating) return false;

     if(1 != nowPage) {
        isAnimating = true;
        nowPage--;
        var Interval = setInterval(function(){
          var tmpMargin = parseInt(ctlArea.css('marginLeft'),10);

          if(-((nowPage-1) *parentWidth) <= tmpMargin){
            clearInterval(Interval);
            isAnimating = false;
          } else {
            ctlArea.css({'marginLeft':(tmpMargin+5)+'px'});
          }
        },5);
      }else {
         isAnimating = true;
         var Interval = setInterval(function(){
           var tmpMargin = parseInt(ctlArea.css('marginLeft'),10);
          
           if( -((allPages-1)*parentWidth) >= tmpMargin){
             clearInterval(Interval);
             nowPage = allPages;
             isAnimating = false;
           } else {
             ctlArea.css({'marginLeft':(tmpMargin-5)+'px'});
           }
         },5);
        
      }
 
    });

    return {
      userEvent : function(callback){
        callback.apply(null, [rollingArea, ImgArea, randomID]);
      }
    }
  }); /*}}}*/

  ui.extend("slider", function(param){
    var self = ui(this.el),
        arrChilds = self.child("li"),
        imgWidth = param.width,
        total = arrChilds.length(),
        parentWidth = imgWidth * total,
        tick = param.pause,
        defaultSpeed = param.speed,
        ctlImg = [param.prev_image, param.next_image],
        controllImg = [new Image(), new Image()],
        controllImgHeight,
        isControllOut = false;
        isOver = false;

    function rotation(){
      var direction = arguments[0];
      var interval = setInterval(function(){
        if(isOver == false){
          var tmpMargin = parseInt(self.css('marginLeft'),10);
          if(-(imgWidth) >= tmpMargin){
            self.append(self.find("li").get(0).el);
            self.css({'marginLeft':'0px'});
            clearInterval(interval);
            setTimeout(rotation, tick);
          } else {
            self.css({'marginLeft':(tmpMargin-defaultSpeed)+'px'});
          }
        }
      }, 5);
    }

    function createControllAnchor(type){
      var anchor = document.createElement("a");
          anchor.id = "_slider"+type;
          anchor.style.cursor = "pointer";
          anchor.style.position = "absolute";
          anchor.style.overflow = "hidden";
          anchor.style.bottom = "10px";
          anchor.style.zIndex = "555";
      if(type == "left") anchor.style.left = "10px";
      else anchor.style.right = "10px";

      self.parent().append(anchor);
    }

    createControllAnchor("left");
    createControllAnchor("right");

    this.el.style.width = parentWidth+"px";
    this.el.style.position = "relative";
    this.parent().css({'position':'relative'});
    
    for(var i = 0; i < controllImg.length; i++){
      controllImg[i].src = ctlImg[i];
      if(i == 0) ui("#_sliderleft").append(controllImg[0]);
      if(i == 1) ui("#_sliderright").append(controllImg[1]);

      controllImg[i].onload = function(e){
        controllImgHeight = this.offsetHeight / 2;
        this.parentNode.style.height = controllImgHeight+"px";
      }
    }
    
    arrChilds.addEvent("mouseover", function(e){isOver = true;isControllOut = false;})
             .addEvent("mouseout", function(e){isOver = false;isControllOut = true;});
    ui("#_sliderleft").addEvent("mouseover", function(e){
      ui(this).child().css({'marginTop':-controllImgHeight+"px"});
      isOver = true;
    }).addEvent("mouseout", function(e){
      ui(this).child().css({'marginTop':"0px"});
    }).addEvent("click", function(e){
      self.prepend(self.find("li").get(total-1).el);
      self.css({'marginLeft':-imgWidth+"px"});
      var interval = setInterval(function(){
        var tmpMargin = parseInt(self.css('marginLeft'),10);
        if(tmpMargin > 0){
          self.css({'marginLeft':'0px'});
          clearInterval(interval);
        } else {
          self.css({'marginLeft':(tmpMargin+defaultSpeed)+'px'});
        }
      }, 5);
      isOver = true;
    });

    ui("#_sliderright").addEvent("mouseover", function(e){
      ui(this).child().css({'marginTop':-controllImgHeight+"px"});
      isOver = true;
    }).addEvent("mouseout", function(e){
      ui(this).child().css({'marginTop':"0px"});
    }).addEvent("click", function(e){
      var interval = setInterval(function(){
        var tmpMargin = parseInt(self.css('marginLeft'),10);
        if(-(imgWidth) >= tmpMargin){
          self.append(self.find("li").get(0).el);
          self.css({'marginLeft':'0px'});
          clearInterval(interval);
        } else {
          self.css({'marginLeft':(tmpMargin-defaultSpeed)+'px'});
        }
      }, 5);
      isOver = true;
    });

    setTimeout(rotation, tick);
  });
  
  // 예전에 만들어둔 것 nw 포팅이 너무 귀찮아 잠시...
  function customScroll(param) /*{{{*/
  {
    this.param = {
      el : "",
      scrollbar_width : 10,
      s_height : 10,
      wheelSpeed : 2,
      thumbudheight: 0, 
      tImage : '',
      bImage : '',
      mImage : '',
      mbImage : ''
    };
    for(var val in param) this.param[val] = param[val];
    this.dragY = 0;
    this.isDrag = false;
    this.s_height = 10;
    this.el = document.getElementById(this.param.el);
    this.wrapper = document.createElement("div");
    this.bottomTimer = this.topTimer = null;
    var ret = this.init();
  }
  customScroll.prototype = {
    init : function(){
      this.el.style.overflow = "hidden";
      this.el.style.position = "relative";
      var contents = this.el.innerHTML;
      this.el.innerHTML = "";

      this.wrapper.innerHTML = contents;
      this.wrapper.style.position = "absolute";
      this.wrapper.style.top = 0 + 'px';
      this.el.appendChild(this.wrapper);
      
      if(this.isNeedScrollbar()){
        var overHeightPer = Math.floor((this.wrapper.offsetHeight / this.el.offsetHeight) * 100);
        this.middleAreaHeight = this.el.offsetHeight; //- (this.param.scrollbar_width*2);
        this.middleThumbHeight = this.middleAreaHeight - Math.floor(this.middleAreaHeight*((overHeightPer-100) * 1/4) / 100);
        if(this.middleThumbHeight < 20) this.middleThumbHeight = 20;
        this.wrapper.style.width = this.el.offsetWidth - this.param.scrollbar_width + "px";
        this.wrapper.style.cssFloat = "left";
        this.wrapper.style.styleFloat = "left";
        this.el.innerHTML += this.attachCustomScrollbar().join("");
        this.attachScrollbarEvent();
      }
    },

    isNeedScrollbar : function(){
      return this.wrapper.offsetHeight > this.el.offsetHeight;
    },
    
    attachCustomScrollbar : function(){
      var scrollbar = [];
      scrollbar.push("<div style='float:right;width:"+this.param.scrollbar_width+"px;height:"+this.el.offsetHeight+"px;background:#eaeaea;'>");
      scrollbar.push("<div class='middleArea' style='position:relative;height:"+this.middleAreaHeight+"px;background:#000;'>");
      if(this.param.mImage){
        scrollbar.push("<div class='middleThumb' style='position:absolute;top:0;width:"+this.param.scrollbar_width+"px;height:"+this.middleThumbHeight+"px;background:url("+this.param.mImage+");cursor:pointer;'>"
                       +"<div class='thumbtop' style='position:absolute;top:0;width:"+this.param.scrollbar_width+"px;height:"+this.param.thumbudheight+"px;background:url("+this.param.tImage+")'></div>"
                       +"<div class='thumbbottom' style='position:absolute;bottom:0;width:"+this.param.scrollbar_width+"px;height:"+this.param.thumbudheight+"px;background:url("+this.param.bImage+")'></div>"
                       +"</div>");
      }else{
        scrollbar.push("<div class='middleThumb' style='position:absolute;top:0;width:"+this.param.scrollbar_width+"px;height:"+this.middleThumbHeight+"px;background:#a2a2a2;cursor:pointer;'></div>");
      }
      scrollbar.push("</div>");
      scrollbar.push("</div>");
      return scrollbar;
    },
    
    cantSelect : function(target){
      if(typeof target.style.MozUserSelect != "undefined"){
        var parent = target.parentNode.parentNode.parentNode;
        var target = parent.childNodes[0];
        target.style.MozUserSelect = "none";
      }else{
        target.onselectstart = new Function("return false");
        target.ondragstart = new Function("return false");
      }
    },
    
    timerStop : function(timer){
      if(timer != null) clearInterval(timer);
    },
    
    upWheel : function(target, activeSize){
      var middleThumb = this.el.childNodes[1].childNodes[0].childNodes[0];
      if(parseInt(target.style.top, 10) > -1) target.style.top = 0 + 'px';
      else target.style.top = (parseInt(target.style.top, 10) + this.param.s_height*this.param.wheelSpeed) + 'px';
      var middlePos = Math.floor(((this.middleAreaHeight - this.middleThumbHeight)*Math.abs(parseInt(target.style.top, 10))) / activeSize);
      middleThumb.style.top = middlePos + 'px';
    },
    
    downWheel : function(target, activeSize){
      var middleThumb = this.el.childNodes[1].childNodes[0].childNodes[0];
      if(Math.abs(parseInt(target.style.top, 10) - this.param.s_height) > activeSize) target.style.top = -activeSize + 'px';
      else target.style.top = (parseInt(target.style.top, 10) - this.param.s_height*this.param.wheelSpeed) + 'px';
      var middlePos = Math.floor(((this.middleAreaHeight - this.middleThumbHeight)*Math.abs(parseInt(target.style.top, 10))) / activeSize);
      middleThumb.style.top = middlePos + 'px';
    },
    
    attachScrollbarEvent : function(){
      var scrollEl = this.el.childNodes[1];
      var middleThumb = scrollEl.childNodes[0].childNodes[0];
      var middleArea = scrollEl.childNodes[0];
      var obj = this;
      
      if(document.addEventListener){
        this.el.addEventListener("DOMMouseScroll", function(e){
          ui.cancelDefault(e);
          var parent = this;
          var target = parent.childNodes[0];
          var activeSize = target.offsetHeight - parent.offsetHeight;
          var e = e || window.event;
          
          if(e.detail < 0){
            obj.upWheel(target, activeSize);
          }else{
            obj.downWheel(target, activeSize);
          }
        }, false);  
      }
      
      this.el.onmousewheel = function(e){
        ui.cancelDefault(e);
        var parent = this;
        var target = parent.childNodes[0];
        var activeSize = target.offsetHeight - parent.offsetHeight;
        var e = e || window.event;
        
        if(e.wheelDelta > 0){
          obj.upWheel(target, activeSize);
        }else if(e.wheelDelta < 0){
          obj.downWheel(target, activeSize);
        } 
      } 

      this.el.onmousemove = function(e){
        var parent = this;
        var target = parent.childNodes[0];
        var activeSize = target.offsetHeight - parent.offsetHeight;
        var e = e || window.event;

        if (obj.isDrag) {
          middleThumb.style.top = parseInt(middleThumb.style.top, 10) + (e.clientY - obj.dragY) + 'px';
          target.style.top = -Math.floor((Math.abs(parseInt(middleThumb.style.top, 10))*activeSize) / (obj.middleAreaHeight - obj.middleThumbHeight)) + 'px';
          if(parseInt(middleThumb.style.top, 10) < 0){
            middleThumb.style.top = 0 + 'px';
            target.style.top = 0 + 'px';              
          }else if(parseInt(middleThumb.style.top, 10) > obj.middleAreaHeight - obj.middleThumbHeight){
            middleThumb.style.top = obj.middleAreaHeight - obj.middleThumbHeight + 'px';
            target.style.top = -activeSize + 'px';
          }

          obj.dragY = e.clientY;    
        }
      }

      this.el.onmouseup = function(e){
        obj.isDrag = false;
        var target = this.childNodes[0];
        target.style.MozUserSelect = "all";
      }
      
      middleThumb.onmousedown = function(e){
        var e = e || window.event;
        if (e.stopPropagation) {
          e.stopPropagation();
          e.preventDefault();
        } else e.cancelBubble = true;
        
        obj.cantSelect(this);
        obj.dragY = e.clientY;
        obj.isDrag = true;
      }
      
      middleArea.onmousedown = function(e){
        var e = e || window.event,
            parent = (this).parentNode.parentNode,
            target = parent.childNodes[0],
            activeSize = target.offsetHeight - parent.offsetHeight,
            offsetY = ui.offsetY(e);
        
        if(offsetY > obj.middleThumbHeight){
          middleThumb.style.top = offsetY - obj.middleThumbHeight + 'px';
        }else{
          middleThumb.style.top = offsetY + 'px';
        }
        
        target.style.top = -Math.floor((Math.abs(parseInt(middleThumb.style.top, 10))*activeSize) / (obj.middleAreaHeight - obj.middleThumbHeight)) + 'px';
      }
    },
    
    changeScroll : function(offsetY){
      var scrollEl = this.el.childNodes[1],
          middleThumb = scrollEl.childNodes[0].childNodes[0],
          middleArea = scrollEl.childNodes[0],
          parent = middleArea.parentNode.parentNode,
          target = parent.childNodes[0],
          activeSize = target.offsetHeight - parent.offsetHeight;

      if(offsetY > 100) offsetY = 100;
      offsetY = Math.ceil((parent.offsetHeight - this.middleThumbHeight) * (offsetY/100));
      
      if(offsetY > this.middleThumbHeight){
        middleThumb.style.top = offsetY - this.middleThumbHeight + 'px';
      }else{
        middleThumb.style.top = offsetY + 'px';
      }
      
      target.style.top = -Math.floor((Math.abs(parseInt(middleThumb.style.top, 10))*activeSize) / (this.middleAreaHeight - this.middleThumbHeight)) + 'px';
    }
  } /*}}}*/
})(nw);

