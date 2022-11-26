const socket = io.connect('http://localhost:3030');
socket.on('image', (image) => {
  const img = document.getElementById('image');
  img.src = `data:image/jpeg;base64,${image}`;
});
socket.on('position', (data) => {
  const position = document.getElementById('position');
  position.innerText = `x: ${data.x}\ny: ${data.y}\nz: ${data.z}`;
});

const handleError = (res) => {
  document.getElementById('message').innerText = res.success ? `Success: ${res.response}` : `Error: ${res.error}`;
};

document.getElementById('shoot').addEventListener('click', () => {
  socket.emit('shoot', {}, handleError);
});

document.getElementById('turn').addEventListener('click', () => {
  socket.emit('turn', {}, handleError);
});
