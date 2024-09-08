document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const inputField = document.getElementById('input-field');
    const sendButton = document.getElementById('send-button');
    const socket = new WebSocket('wss://8f64-2-81-240-20.ngrok-free.app');

    socket.onopen = () => {
        console.log('Client: Ok! | Server: Ok!');
        saveMessage(username, 'welcome to JustAFrog chat module', 'system');
        socket.send(JSON.stringify({ username, message: 'user_joined' }));
        loadMessages(); 
        flushMessageQueue(); 
    };

    socket.onerror = (error) => {
        console.log('Client: Ok! | Server: connection failed');
        chatBox.textContent = '[client] error: cannot connect to server';
    };

    socket.onmessage = (event) => {
        console.log('Message received:', event.data);
        const data = JSON.parse(event.data);
        const mention = `@${username}`;

        if (data.command === '/clear') {
            localStorage.removeItem('messages');
            chatBox.innerHTML = '';
        } else if (data.message === 'user_joined') {
            const joinMessage = `${data.username} joined`;
            chatBox.innerHTML += `<div><i>${joinMessage}</i></div>`;
        } else {
            const { username: sender, message } = data;
            const isMention = message.includes(mention);

            if (isMention) {
                pingSound.pause();
                pingSound.currentTime = 0;
                pingSound.play();
            }

            const formattedMessage = formatMessage(sender, message, 'user', isMention);
            chatBox.innerHTML += formattedMessage;
            chatBox.scrollTop = chatBox.scrollHeight; 
        }
        saveMessage(data.username, data.message, 'user');
    };

    let lastMessageTime = 0; 
    let messageQueue = []; 

    function generateUsername() {
        const usernames = JSON.parse(localStorage.getItem('usernames')) || [];
        let username = `User${Math.floor(Math.random() * 1000)}`;
        while (usernames.includes(username)) {
            username = `User${Math.floor(Math.random() * 1000)}`;
        }
        usernames.push(username);
        localStorage.setItem('usernames', JSON.stringify(usernames));
        return username;
    }

    const username = generateUsername();
    console.log(`current username: ${username}`); 

    const pingSound = new Audio('./sounds/ping.wav');

    function formatMessage(username, message, type, highlight = false) {
        const backgroundColor = highlight ? 'background-color: yellow;' : '';
        return type === 'system'
            ? `<i>${message}</i>`
            : `<div style="${backgroundColor}"><strong>${username}:</strong> ${message}</div>`;
    }

    function loadMessages() {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        chatBox.innerHTML = messages.map(msg => `<div>${msg}</div>`).join('');
        chatBox.scrollTop = chatBox.scrollHeight; 
    }

    function saveMessage(username, message, type, highlight = false) {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        const formattedMessage = formatMessage(username, message, type, highlight);
        if (messages[messages.length - 1] !== formattedMessage) {
            messages.push(formattedMessage);
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }

    function sendMessage(input) {
        if (input) {
            const formattedMessage = formatMessage(username, input, 'user');
            saveMessage(username, input, 'user');
            socket.send(JSON.stringify({ username, message: input }));
            inputField.value = '';
            chatBox.scrollTop = chatBox.scrollHeight; 
        }
    }

    function flushMessageQueue() {
        while (messageQueue.length > 0) {
            const message = messageQueue.shift();
            sendMessage(message);
        }
    }

    function send() {
        const input = inputField.value.trim();
        const currentTime = Date.now();

        if (input && (currentTime - lastMessageTime >= 1000)) {
            lastMessageTime = currentTime; 

            if (input.startsWith('/')) {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ command: input }));
                } else {
                    messageQueue.push(input);
                }
            } else {
                if (socket.readyState === WebSocket.OPEN) {
                    sendMessage(input);
                } else {
                    messageQueue.push(input);
                }
            }
        } else if (input) {
            alert('wait for 1 second before sending another message');
        }
    }

    sendButton.addEventListener('click', send);

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            send();
        }
    });
});

