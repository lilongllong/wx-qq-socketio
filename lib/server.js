exports.bindSocketIO = function (server)
{
    const messageCenter = require("socket.io")(server).of("/mx-qq");
    const rooms = [];
    const privateRooms = [];
    const publicRooms = [];// room = {roomId: string, joiners: [userID ...]}
    const testRoom = { roomId: "default", joiners: [] };
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
                    socket.emit("joined room", room.roomId);
                }
            });
            privateRooms.map(roomID => {
                socket.emit("joined room", roomID);
            });

            if (privateRooms.indexOf(userID) === -1)
            {
                privateRooms.push(userID);
                socket.broadcast.emit("joined room", userID);
            }
        });


        socket.on("message", (message) => {
            socket.broadcast.send(userName + ": " + message);
        });

        socket.on("send to someone", (id, message) => {
            messageCenter.to(id).emit("other message", { fromID: userName, message: message, toID: id});
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
