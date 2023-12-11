window.onload = function() {
    document.getElementById("test").textContent = "This did work";
    const eventSource = new EventSource('/sse');

    eventSource.onmessage = event => {
        const parent = document.querySelector("body");
        parent.innerHTML += `${event.data}<br>`;
    }
}

