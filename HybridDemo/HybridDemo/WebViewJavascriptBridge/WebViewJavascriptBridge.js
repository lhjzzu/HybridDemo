;(function() {
//(function(){})匿名函数，自动调用
    //如果WebViewJavascriptBridge存在（webView与js之间的桥梁），则return
	if (window.WebViewJavascriptBridge) { return }
	var messagingIframe//消息内联框架
	var sendMessageQueue = [] //发送的消息数组
	var receiveMessageQueue = []//接收的消息数组
	var messageHandlers = {} //消息处理字典

    //自定义的协议名
	var CUSTOM_PROTOCOL_SCHEME = 'wvjbscheme'
    //队列消息的哈希值
	var QUEUE_HAS_MESSAGE = '__WVJB_QUEUE_MESSAGE__'

    //相应的回调字典
	var responseCallbacks = {}
    //消息的id（条数）
	var uniqueId = 1

	//创建内联框架
	function _createQueueReadyIframe(doc) {
        //为messagingIframe创建对象
		messagingIframe = doc.createElement('iframe')
        //为messagingIframe相应的属性赋值
		messagingIframe.style.display = 'none'
		messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE
		doc.documentElement.appendChild(messagingIframe)
	}


    //初始化(只能调用一次)
    //消息处理messageHandler是初始化传入的函数
	function init(messageHandler) {
		if (WebViewJavascriptBridge._messageHandler) { throw new Error('WebViewJavascriptBridge.init called twice') }
        //当外部调用bridge.init进行初始化的时候,WebViewJavascriptBridge._messageHandler为nil
		WebViewJavascriptBridge._messageHandler = messageHandler
		var receivedMessages = receiveMessageQueue
		receiveMessageQueue = null
        //将bridge.init调用之前的消息进行处理
		for (var i=0; i<receivedMessages.length; i++) {
			_dispatchMessageFromObjC(receivedMessages[i])
		}
	}

	function send(data, responseCallback) {
		_doSend({ data:data }, responseCallback)
	}
	
	function registerHandler(handlerName, handler) {
		messageHandlers[handlerName] = handler
	}
	
	function callHandler(handlerName, data, responseCallback) {
		_doSend({ handlerName:handlerName, data:data }, responseCallback)

	}
	
	function _doSend(message, responseCallback) {
		if (responseCallback) {
			var callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime()
			responseCallbacks[callbackId] = responseCallback
			message['callbackId'] = callbackId
		}
    // 如果responseCallback不存在那么message = { responseId:callbackResponseId, responseData:responseData };
		sendMessageQueue.push(message)
		messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE
	}

	function _fetchQueue() {
		var messageQueueString = JSON.stringify(sendMessageQueue)
        var message = sendMessageQueue[0]
		sendMessageQueue = []
		return messageQueueString
	}

    //处理来自oc的消息字符串
	function _dispatchMessageFromObjC(messageJSON) {
		setTimeout(function _timeoutDispatchMessageFromObjC() {
			var message = JSON.parse(messageJSON)
			var messageHandler //声明messageHandler
			var responseCallback // 声明responseCallback

			if (message.responseId) {
				responseCallback = responseCallbacks[message.responseId]
				if (!responseCallback) { return; }
				responseCallback(message.responseData)
				delete responseCallbacks[message.responseId]
			} else {
                //从oc过来的消息 messageJson = {"callbackId":"objc_cb_3","data":"A string sent from ObjC to JS"}
				if (message.callbackId) {
                 // 将callbackId换成responseId
					var callbackResponseId = message.callbackId
                    //给responseCallback赋值
                    //调用responseCallback时，      responseData外界传的值
					responseCallback = function(responseData) {
						_doSend({ responseId:callbackResponseId, responseData:responseData })
					}
				}

                //WebViewJavascriptBridge._messageHandler即是调用bridge.init时传入的函数（messageHandler）
				var handler = WebViewJavascriptBridge._messageHandler
				if (message.handlerName) {
                    //messageHandlers消息处理字典（里面存储了一些消息的具体处理）
					handler = messageHandlers[message.handlerName]
				}
				try {
                    //调用handler
                    //而在handler中又回调了responseCallback所以调用_doSend。
                    //即为html中初始化的时候调用bridge.init传递的参数（函数）
					handler(message.data, responseCallback)
				} catch(exception) {
					if (typeof console != 'undefined') {
						console.log("WebViewJavascriptBridge: WARNING: javascript handler threw.", message, exception)
					}
				}
			}
		})
	}

   //处理来自oc的消息
	function _handleMessageFromObjC(messageJSON) {
    //在调用bridge.init之前，receiveMessageQueue存在，并且将收到的来自oc的消息存储在receiveMessageQueue中
		if (receiveMessageQueue) {
			receiveMessageQueue.push(messageJSON)
		} else {
			_dispatchMessageFromObjC(messageJSON)
		}
	}

   //创建WebViewJavascriptBridge对象
   //函数对象作为一个属性
	window.WebViewJavascriptBridge = {
		init: init,
		send: send,
		registerHandler: registerHandler,
		callHandler: callHandler,
		_fetchQueue: _fetchQueue,
		_handleMessageFromObjC: _handleMessageFromObjC
	}

    //给doc赋值
	var doc = document
	_createQueueReadyIframe(doc)
     //创建并实例化一个事件对象
	var readyEvent = doc.createEvent('Events')
	readyEvent.initEvent('WebViewJavascriptBridgeReady')
	readyEvent.bridge = WebViewJavascriptBridge
    //触发事件
	doc.dispatchEvent(readyEvent)
})();
