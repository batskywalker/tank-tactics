window.onload = function() {
    const gameBoard = document.getElementById("whole-board");
    for (var i = 0; i < 40; i++) {
        let row = document.createElement("tr");
        gameBoard.appendChild(row);
        for (var j = 0; j < 40; j++) {
            let cell = document.createElement("td");
            cell.classList.add(`y${i}`);
            cell.classList.add(`x${j}`);
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

                if (data[i].alive) {
                    playerValue.innerHTML = `<div class='idunno'><img class='avatar' src='https://cdn.discordapp.com/avatars/${data[i].playerID}/${data[i].icon}' height='250px' width='250px'> <h2>${data[i].playerUser}</h2><br> <p>Range: ${data[i].range}</p><br> <p>Health: ${data[i].health}</p><br> <p>Action Points: ${data[i].action}</p><br></div>`
                    gameBoard.children[data[i].pos.y].children[data[i].pos.x].appendChild(playerValue);
                }
                else {
                    gameBoard.children[data[i].pos.y].children[data[i].pos.x].classList.add('dead');
                    playerValue.innerHTML = `<div class='idunno'><img class='avatar' src='https://cdn.discordapp.com/avatars/${data[i].playerID}/${data[i].icon}' height='250px' width='250px'> <h2>${data[i].playerUser}</h2><br> <h2>Dead</h2></div>`
                    gameBoard.children[data[i].pos.y].children[data[i].pos.x].appendChild(playerValue);
                }
            }
        }
    }

    var previous;
    var current;

    const attackDirection = [
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1]
    ];

    gameBoard.addEventListener("click", (event) => {
        if (event.target.classList.contains('tile')) {
            current = event.target;

            if (previous && previous.children[1]) {
                previous.children[1].style.display = 'none';
                var attacking = document.querySelectorAll('td.attacked');

                for (var elem of attacking) {
                    elem.classList.remove('attacked');
                }
            }

            if (previous != current && current.children[1]) {
                
                current.children[1].style.display = 'flex';
                current.children[1].children[0].style.display = 'block';
                previous = current;

                var range = parseInt(current.children[1].children[0].children[3].textContent.slice(7), 10);
                var pos = [];
                var m = 0;
                for (const classes of current.classList) {
                    if (m < 2) {
                        pos[m] = parseInt(classes.slice(1), 10);
                        m += 1;
                    }
                }
                
                var i;
                var j;
                for (i = 0; i < 8; i++) {
                    for (j = 1; j <= range; j++) {
                        var row = pos[0] + (attackDirection[i][1] * j);
                        var col = pos[1] + (attackDirection[i][0] * j);

                        if (row >= 0 && row < 40 && col >= 0 && col < 40) {
                            //current.children[1].children[0].children[3].textContent += row;
                            //current.children[1].children[0].children[3].textContent += col;
                            var beingAttacked = gameBoard.children[row].children[col];
                            //current.children[1].children[0].children[3].textContent += beingAttacked;
                            beingAttacked.classList.add('attacked');

                            if (beingAttacked.children[0].classList.contains('occupied')) {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            else {
                previous = null;
            }
        }
        else if (event.target.classList.contains('idunno')) {
            event.target.style.display = 'none';
        }
    });
}