var previous;
var current;

window.onload = function() {
    const gameBoard = document.getElementById("whole-board");
    for (var i = 1; i <= 30; i++) {
        let row = document.createElement("tr");
        gameBoard.appendChild(row);
        for (var j = 1; j <= 30; j++) {
            let cell = document.createElement("td");
            cell.classList.add('tile');
            row.appendChild(cell);
            let image = document.createElement("img");
            image.setAttribute('height', '40px');
            image.setAttribute('width', '40px');
            cell.appendChild(image);
        }
    }

    const eventSource = new EventSource('/sse');

    eventSource.onmessage = event => {
        const data = JSON.parse(event.data);
        for (var i = 0; i < data.length; i++) {
            if (data[i].playerID) {
                var x;
                var y;
                if (data[i].prev_pos) {
                    x = data[i].prev_pos[1];
                    y = data[i].prev_pos[0];
                }
                else {
                    x = data[i].pos.y;
                    y = data[i].pos.x;
                }

                if (gameBoard.children[x].children[y].children[0].classList.contains('occupied')) {
                    gameBoard.children[x].children[y].children[0].classList.remove('occupied');
                    gameBoard.children[x].children[y].children[0].removeAttribute('src');
                    gameBoard.children[x].children[y].children[0].removeAttribute('alt');
                    gameBoard.children[x].children[y].removeChild(gameBoard.children[x].children[y].children[1]);
                }

                gameBoard.children[data[i].pos.y].children[data[i].pos.x].children[0].classList.add('occupied');

                gameBoard.children[data[i].pos.y].children[data[i].pos.x].children[0].setAttribute('src', `https://cdn.discordapp.com/avatars/${data[i].playerID}/${data[i].icon}`);

                gameBoard.children[data[i].pos.y].children[data[i].pos.x].children[0].setAttribute('alt', data[i].playerUser);

                const playerValue = document.createElement('div');
                playerValue.classList.add('player-data');
                playerValue.style.display = 'none';

                playerValue.innerHTML = `<div class='idunno'><img class='avatar' src='https://cdn.discordapp.com/avatars/${data[i].playerID}/${data[i].icon}' height='250px' width='250px'> <h2>${data[i].playerUser}</h2><br> <p>Range: ${data[i].range}</p><br> <p>Health: ${data[i].health}</p><br> <p>Action Points: ${data[i].action}</p><br></div>`
                gameBoard.children[data[i].pos.y].children[data[i].pos.x].appendChild(playerValue);
            }
        }
    }

    gameBoard.addEventListener("click", (event) => {
        if (event.target.classList.contains('tile')) {
            current = event.target;

            if (previous && previous.children[1]) {
                previous.children[1].style.display = 'none';
            }

            if (previous != current && current.children[1]) {
                current.children[1].style.display = 'flex';
                previous = current;
            }
            else {
                previous = null;
            }
        }
    });
}