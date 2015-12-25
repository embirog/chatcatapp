module.exports = (io, rooms) => {
	var chatrooms = io.of('/roomlist').on('connection', (socket) => {
		console.log('Connection Established on the server!!');
		socket.emit('roomupdate', JSON.stringify(rooms));

		socket.on('newroom', (data) => {
			rooms.push(data);
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
			socket.emit('roomupdate', JSON.stringify(rooms));
		})
	})

	var messages = io.of('/messages').on('connection', (socket) => {
		console.log('Connected to the chatroom!!! ');

		socket.on('joinroom', (data) => {

			socket.username = data.user;
			socket.userPic = data.userPic;
			socket.join(data.room);

			updateUserList(data.room, true);
		})

		socket.on('newMessage', function(data){
			socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
		})

		function updateUserList(room, updateAll){
			//issue on old version of io
			var getUsers = io.of('/messages').clients(room);

			//lates io.but still buggy
			// var getUsers = getUsersFromRoom(room);


			var userList = [];
			for(var i in getUsers){

				userList.push({user:getUsers[i].username, userPic: getUsers[i].userPic});
			}
			socket.to(room).emit('updateUsersList', JSON.stringify(userList));

			if(updateAll){

				socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userList));
			}
		}

		function getUsersFromRoom(room){
			var usersArray = [];
			var nsp = io.of('/messages');
			var clientsInRoom = nsp.adapter.rooms[room];
			for(var client in clientsInRoom){
				usersArray.push(nsp.connected[client]);
			}

		}

		socket.on('updateList', function(data){

			updateUserList(data.room);
		})
	})
}