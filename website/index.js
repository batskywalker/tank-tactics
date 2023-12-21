window.onload = function() {
    const gameBoard = document.getElementById("whole-board");
    for (var i = 1; i <= 30; i++) {
        let row = document.createElement("tr");
        gameBoard.appendChild(row);
        for (var j = 1; j <= 30; j++) {
            let cell = document.createElement("td");
            row.appendChild(cell);
            let image = document.createElement("img");
            image.setAttribute('height', '20px');
            image.setAttribute('width', '20px');
            cell.appendChild(image);
        }
    }

    const eventSource = new EventSource('/sse');

    eventSource.onmessage = event => {
        gameBoard.innerHTML += event.data;
    }
}