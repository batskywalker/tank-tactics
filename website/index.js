window.onload = function() {
    const gameBoard = document.getElementById("whole-board");
    for (var i = 1; i <= 30; i++) {
        let row = document.createElement("tr");
        gameBoard.appendChild(row)
        for (var j = 1; j <= 30; j++) {
            let cell = document.createElement("td");
            cell.textContent = i + j;
            row.appendChild(cell)
        }
    }

    const eventSource = new EventSource('/sse');

    eventSource.onmessage = event => {
        const parent = document.querySelector("body");
        parent.innerHTML += `${event.data}<br>`;
    }
}