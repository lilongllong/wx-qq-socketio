exports.bindSocketIO = function (server)
{
    const messageCenter = require("socket.io")(server).of("/mx-qq");
    const rooms = [];
    const privateRooms = [];
    const publicRooms = [];// room = {roomID: string, joiners: [userID ...]}
    const testRoom = { roomID: "default", joiners: [] };
    publicRooms.push(testRoom);

    messageCenter.on("connection", function (socket) {
        let userName = "";
        socket.on("connect", () => {
            socket.broadcast.emit("partiant message", name + " has joined. welcome!");
        });
        // user login
        socket.on("login", (userID) => {
            userName = userID;
            testRoom.joiners.push(userID);
            socket.join(userID);
            socket.join("default");
            publicRooms.map(room => {
                if (room.joiners.indexOf(userID) !== -1)
                {
                    socket.emit("joined room", {id: room.roomID, type: "public"});
                }
            });
            privateRooms.map(roomID => {
                socket.emit("joined room", {id: roomID, type: "private"});
            });

            if (privateRooms.indexOf(userID) === -1)
            {
                privateRooms.push(userID);
                socket.broadcast.emit("joined room", {id: userID, type: "private"});
            }
        });


        socket.on("message", (message) => {
            socket.broadcast.send(userName + ": " + message);
        });

        socket.on("send to someone", (id, message) => {
            if (privateRooms.indexOf(id) !== -1)
            {
                messageCenter.to(id).emit("other message", { fromID: userName, message: message, toID: id, type: "private"});
            }
            const publicRoomIDs = publicRooms.map(room => room.roomID);
            if (publicRoomIDs.indexOf(id) !== -1)
            {
                messageCenter.to(id).emit("other message", { fromID: userName, message: message, toID: id, type: "public"});
            }
        });

        socket.on("enter room", (leaveID, roomID) => {
            socket.join(roomID);
            socket.leave(leaveID);
            socket.emit("entered room", roomID);
        });

        socket.on("disconnect", () => {
            let index = testRoom.joiners.indexOf(userName);
            testRoom.joiners.splice(index, 1);
            index = privateRooms.indexOf(userName);
            privateRooms.splice(index, 1);
            console.log(`user ${userName}leaved`);
        });
    });

    messageCenter.on("user disconnected", () => {

    });
}
