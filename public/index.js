const socket = io.connect('http://localhost:8080/mx-qq');

$(document).ready(() => {
    const userID = getUserID();
    $("#myName").val("welcome " + userID);
    $(".chat-main").data("userID", userID);
    $("#chat-show").data("targetID", getDefaultUserID());
    startSocketIO(userID);
    $("#send-btn").on("click", sendMessage);
});


function startSocketIO(userID)
{
    socket.emit("login", userID);
    socket.on('partiant message', function (data) {
        $(".chat-content").append(`<p>${data}</p>`);
    });
    socket.on("joined room", (roomID) => {
        const $roomItem = $(`<div class="bar" id="${roomID}">${roomID}</div>`);
        $roomItem.on("click", switchRoom);
        $roomItem.data("roomID", roomID)
        $(".chat-room").append($roomItem);
    });

    socket.on("other message", (message) => {
        if ( message.toID === getTargetUserID() && message.fromID === getCurrentUserID())
        {
            $("#chat-show").append(`<div class="message right">${message.message + " :" + message.fromID}</div>`);
        }
        else
        {
            if ( message.toID === getCurrentUserID() && message.fromID === getTargetUserID())
            {
                $("#chat-show").append(`<div class="message left">${ message.fromID + ": " + message.message }</div>`);
            }
        }
    });

    socket.on("entered room", (roomID) => {
        $("#chat-show").data("targetID", roomID)
        $(".title").text(roomID);
        $(".message").remove();
    });


}

function socketIOSendMessage(id, message)
{
    socket.emit("send to someone", id, message);
}

function sendMessage()
{
    const id = $("#chat-show").data("targetID");
    const message = $(".input-content > input").val();
    if (message && message !== "")
    {
        socketIOSendMessage(id, message);
    }
}

function switchRoom(e)
{
    const leaveID = getTargetUserID();
    const roomID = $(e.currentTarget).data("roomID");
    socket.emit("enter room", leaveID, roomID);
}

function getUserID()
{
    const userID = prompt("请输入用户ID：");
    if (userID && typeof(userID) === "string")
    {
        return userID;
    }
    else
    {
        return getUserID();
    }
}

function getTargetUserID()
{
    return $("#chat-show").data("targetID");
}

function getCurrentUserID()
{
    return $(".chat-main").data("userID");
}

function getDefaultUserID()
{
    return "default";
}
