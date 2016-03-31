angular.module('ngChat', ['ui.router']).config(function myAppConfig($sceProvider) {
	$sceProvider.enabled(false);

}).controller('AppCtrl', function AppCtrl($scope, $rootScope, $timeout, $sce) {

	$scope.chatText = "";
	$scope.input = {
		username : '',
		chatMsg : ''
	};
    $scope.singleUser = true;
	$scope.onlineUser = " ";

	var myEl = angular.element(document.getElementById('newNotification'));
	connectToSocket();
	function connectToSocket() {
		$scope.socket = io.connect();

		$scope.socket.on('connect', function(err) {
			console.log("connect");
		});

		$scope.socket.on('connect_error', function(err) {
			console.log("connect_error", err);
		});

		$scope.socket.on('connect_timeout', function(err) {
			console.log("connect_timeout", err);
		});

	}


	$scope.sendMsgonEnterKey = function(keyCode) {
		if (keyCode == "13") {
			$scope.sendMsg();
		}
	};

	$scope.sendMsg = function() {
		if ($scope.input.chatMsg === undefined || $scope.input.chatMsg === "" || $scope.singleUser == true ) {
			return;
		}
		var obj = {};
		obj.msg = $scope.input.chatMsg;
		obj.name = $scope.input.username;
		$scope.chatText += "<div class='msg'><div class='senderName'>" + obj.name + "</div><div class='sendedMsg'>" + obj.msg + "<span class='msgTime'>" + getTime() + "</span></div></div>";
		$scope.input.chatMsg = '';
		$scope.socket.emit('messageSend', obj);
		scrolltoBottom();

	};

	$scope.$watch('showPopup', function(newValue, oldValue) {
		if (newValue == false) {
			$scope.socket.emit('getStatusUpdate');
		}
	});

	$scope.socket.on('sendStatusUpdate', function(users) {
		var statement = ((users - 1) <= 1) ? " user is online." : " users are online.";
		$scope.$apply(function() {
			if (users == "1") {
				$scope.onlineUser = "Only you are online.";
				$scope.singleUser = true;
			} else {
				$scope.singleUser = false;
				$scope.onlineUser = users - 1 + statement;
			}
		});

	});

	$scope.socket.on('messageReceived', function(obj) {
		$scope.$apply(function() {
			$scope.chatText += "<div class='msg'><div class='recieverName'>" + obj.name + "</div><div class='receivedMsg'>" + obj.msg + "<span class='msgTime'>" + getTime() + "</span></div></div>";
			$scope.newNotification = obj.name + " has sent you a message";
		});
		myEl.addClass('blink_me');
		removeClass();
		scrolltoBottom();
	});

	function getTime() {
		var msgDate = new Date();
		var time = (msgDate.getHours() >= 10 ? msgDate.getHours() : "0" + msgDate.getHours()) + ":" + (msgDate.getMinutes() >= 10 ? msgDate.getMinutes() : "0" + msgDate.getMinutes());
		return time;
	}

	function removeClass() {
		$timeout(function() {
			$scope.newNotification = " ";
			myEl.removeClass('blink_me');
		}, 1000);
	};

	function scrolltoBottom() {
		$timeout(function() {
			var objDiv = document.getElementById("chat_console");
			objDiv.scrollTop = objDiv.scrollHeight;
		}, 0);

	}

});

