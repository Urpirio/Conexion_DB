
fetch('http://localhost:4000/api/Users')
  .then(response => response.json())
  .then(data => {
    const lista = document.getElementById('lista');
    
    // Asegurarse de que 'data' es un array antes de hacer forEach
    if (Array.isArray(data.data)) {
      data.data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.sexo; // Asegúrate de que el campo es correcto
        lista.appendChild(li);
      });
    } else {
      console.error('No se encontraron datos');
    }
  })
  .catch(error => console.error('Error:', error));



