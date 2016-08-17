
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
    socket.on("joined room", (room) => {
        const $roomItem = $(`<div class="bar" id="${room.id}">${room.id}</div>`);
        $roomItem.on("click", switchRoom);
        $roomItem.data("roomData", room)
        $(".chat-room").append($roomItem);
    });

    socket.on("other message", (message) => {
        messageRecive(message);
    });

    socket.on("entered room", (roomID) => {
        $("#chat-show").data("targetID", roomID)
        $(".title").text(roomID);
        $(".message").remove();
        const messages = getMessage(roomID);
        renderChatView(messages);
    });


}

function socketIOSendMessage(id, message)
{
    socket.emit("send to someone", id, message);
}

function messageRecive(message)
{
    if (message.type === "public")
    {
        if (message.toID === getTargetUserID())
        {
            renderNewMessage(message);
        }
        push(message.toID, message);
    }
    else
    {
        if (message.fromID === getCurrentUserID())
        {
            if (message.toID === getTargetUserID())
            {
                renderNewMessage(message);
            }
            push(message.toID, message);
        }
        else
        {
            if (message.toID === getCurrentUserID())
            {
                if (message.fromID === getTargetUserID())
                {
                    renderNewMessage(message);
                }
                push(message.from, message);
            }
        }
    }
}

function renderChatView(messages)
{
    messages.map(message => {
        renderNewMessage(message);
    });
}

function renderNewMessage(message)
{
    if (message.type === "public")
    {
        if ( message.toID === getTargetUserID() && message.fromID === getCurrentUserID())
        {
            $("#chat-show").append(`<div class="message right">${ message.message + " :" + message.fromID }</div>`);
        }
        else
        {
            $("#chat-show").append(`<div class="message left">${ message.fromID + " :" + message.message }</div>`);
        }
    }
    else
    {
        // type private
        if ( message.toID === getTargetUserID() && message.fromID === getCurrentUserID())
        {
            $("#chat-show").append(`<div class="message right">${message.message + " :" + message.fromID}</div>`);
        }

        if ( message.toID === getCurrentUserID() && message.fromID === getTargetUserID())
        {
            $("#chat-show").append(`<div class="message left">${ message.fromID + ": " + message.message }</div>`);
        }
    }
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
    const roomID = $(e.currentTarget).data("roomData").id;
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

// 以roomID作为key value: [] item: {toID, message, fromID, type:}
const messageCenter = {};
//
function push(roomID, message)
{
    if (messageCenter[roomID] && Array.isArray(messageCenter[roomID]))
    {
        messageCenter[roomID].push(message);
    }
    else
    {
        messageCenter[roomID] = [message];
    }
}

function getMessage(roomID)
{
    if (messageCenter[roomID] && Array.isArray(messageCenter[roomID]))
    {
        return messageCenter[roomID];
    }
    else
    {
        return null;
    }
}
