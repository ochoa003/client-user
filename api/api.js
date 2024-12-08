// crear instancia de axios
// const axios = require('axios')
//

import axios from 'axios';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3001', // Dirección base de la API
  timeout: 10000, // Tiempo de espera en milisegundos
  headers: {
    'Content-Type': 'application/json', // Encabezado común para JSON
  },
});

export default apiClient;