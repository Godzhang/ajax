(function(){
	var ajax = function(options){
		//编码数据
		function setData(){

		}

		function getXHR(){
			if(typeof XMLHttpRequest != 'undefined'){
				return new XMLHttpRequest();
			}else if(typeof ActiveXObject != "undefined"){
				if(typeof arguments.callee.activeXString != 'string'){
					//遍历IE中不同版本的Active对象
					var versions = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP"];
					for(var i = 0, len = versions.length; i < len; i++){
						try{
							new ActiveXObject(versions[i]);
							arguments.callee.activeXString = versions[i];
							break;
						}catch(e){}
					}
				}
				return new ActiveXObject(arguments.callee.activeXString);
			}
		};
		
		//JSONP
		function createJsonp(){
			var script = document.createElement("script"),
				timeName = new Date().getTime() + Math.round(Math.random() * 1000),
				callback = "JSONP_" + timeName;

			window[callback] = function(data){
				clearTimeout(timeout_flag);
				document.body.removeChild(script);
				success(data);
			}

			script.src = url + (url.indexOf("?") > -1 ? "&" : "?") + jsonp + "=" + callback;
			script.type = "text/javascript";
			document.body.appendChild(script);
			setTime(callback, script);
		}
		
		//设置请求超时
		function setTime(callback, script){
			if(timeOut !== undefined){
				timeout_flag = setTimeout(function(){
					if(dataType === 'jsonp'){
						//若是jsonp超时，删除回调事件，移除script元素
						delete window[callback];
						document.body.removeChild(script);
					}else{
						timeout_bool = true;
						xhr && xhr.abort();
					}
				}, timeOut);
			}
		}

		//XHR
		function createXHR(){
			//创建对象
			xhr = getXHR();
			xhr.open(type, url, async);		//启动一个请求以备发送
			//设置请求头
			if(type === 'post' && !contentType){
				//若是post提交，则设置content-Type为application/x-www-form-urlencoded;charset=UTF-8
				//会将表单内的数据转换为键值对name=zhangqi&age=30
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
			}else if(contentType){
				xhr.setRequestHeader("Content-Type", contentType);
			}
			//添加监听
			xhr.onreadystatechange = function(){
				if(xhr.readyState === 4){
					//若设置了超时
					if(timeOut !== undefined){
						//由于执行abort()方法后，有可能触发onreadystatechange事件，
						//所以设置了一个timeout_bool标识，来忽略终止触发的事件
						if(timeout_bool){
							return;
						}
						clearTimeout(timeout_flag);
					}
					if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
						success(xhr.responseText);
					}else{
						error(xhr.status, xhr.statusText);
					}
				}
			}
			xhr.onprogress = function(event){
				//event属性：
				//lengthComputable: 表示进度信息是否可用
				//position: 已经接受的字节数
				//totalSize: 根据Content-Length响应头确定的预期字节数
				if(event.lengthComputable){
					progress(event.position, event.totalSize);
				}
			}

			//添加超时处理(由于只兼容IE8+，不采用)
			// xhr.timeout = timeOut;
			// xhr.ontimeout = function(){
			// 	timeout_bool = true;
			// 	xhr.abort();
			// }

			xhr.send(type === "get" ? null : data);
			setTime();
		}

	
		var url = options.url || "",					    //请求链接
			type = (options.type || "get").toLowerCase(),   //请求方法
			async = options.async || true,					//是否异步
			data = options.data || null,                    //请求数据的参数 || 发送的数据
			dataType = options.dataType || "",				//请求类型
			jsonp = options.jsonp || "callback",			//jsonp请求中重写回调函数的名字
			contentType = options.contentType || "",		//请求头
			timeOut = options.timeOut,						//超时时间
			before = options.before || function(){},		//发送请求之前的回调
			progress = options.progress || function(){},	//请求过程中的回调
			success = options.success || function(){},		//请求成功的回调
			error = options.error || function(){};			//请求错误的函数

		var timeout_bool = false,							//是否请求超时
			timeout_flag = null,							//超时标志
			xhr = null;

		//处理数据
		setData();
		//执行发送前的函数
		before();

		if(dataType === 'jsonp'){
			createJsonp();
		}else{
			createXHR();
		}
	}

	window.ajax = ajax;
})();