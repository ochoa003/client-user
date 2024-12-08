import React, { useEffect, useState } from "react";
import apiClient from "../../api/api";
import { Button, Form } from "react-bootstrap"
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const PageVendedor = () => {
  const [sucursales, setSucursales] = useState([]); // Nuevo estado para sucursales
  const [catalogo, setCatalogo] = useState([]); // Nuevo estado para el catálogo
  const [inventario, setInventario] = useState([]); // Nuevo estado para el inventario
  const [ventas, setVentas] = useState([]); // Nuevo estado para las ventas

  const [esDomicilio, setEsDomicilio] = useState(true);

  const handleCheckboxChange = (e) => {
    setEsDomicilio(e.target.value === "domicilio");
  };

  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

   //* formulario
   const [cedula, setCedula] = useState('1054479437')
   const [cantidad, setCantidad] = useState(1)
   const [productoSeleccionado, setProductoSeleccionado] = useState([])

  const getSucursales = async () => {
    try {
      const response = await apiClient.get("/sucursals");
      setSucursales(response.data); // Almacena los datos en el estado
    } catch (error) {
      console.error("Error fetching sucursales:", error);
    }
  };

  const getCatalogo = async () => {
    try {
      const response = await apiClient.get("/catalogos");
      setCatalogo(response.data); // Almacena los datos en el estado
    } catch (error) {
      console.error("Error fetching catalogo:", error);
    }
  };

  const getVentas = async (idSucursal) => {
    try {
      const response = await apiClient.get(`/sucursals/${idSucursal}/ventas`);
      console.log(response.data)
      setVentas(response.data); // Almacena los datos en el estado
    } catch (error) {
      console.error("Error fetching ventas:", error);
    }
  };


  // const getInventario = async (sucursalId) => {
  //   try {
  //     const response = await apiClient.get(`/sucursals/${sucursalId}/inventarios`);
  //     setInventario(response.data[0]); // Almacena los datos en el estado
  //   } catch (error) {
  //     console.error("Error fetching inventario:", error);
  //   }
  // }

  const getCatalogoInventario = async (sucursalId) => {
    try {

      const response1 = await apiClient.get(`/sucursals/${sucursalId}/inventarios`);
      const inventario = response1.data[0]

      console.log(inventario)

      const response = await apiClient.get(`/inventario-catalogos`);
      const idInventario = inventario._id
      // console.log(response.data)
      const catalogoInventario = response.data.filter((item) => item.inventarioId === idInventario)

      console.log("CATALOGO", catalogoInventario)
      
      const nuevoCatalogo = []
      catalogoInventario.forEach(item => {
        console.log("ITEM", item)
        const producto = catalogo.find((prod) => prod._id === item.catalogoId)
        if (!producto) {
          return;
        }
        nuevoCatalogo.push({
          ...producto,
          catalogoId: item.catalogoId,
          inventarioId: item.inventarioId,
          cantidad: item.cantidad,
          catalogoInventarioId: item._id
        })
      })

      setInventario(nuevoCatalogo); // Almacena los datos en el estado
      console.log(nuevoCatalogo)

    } catch (error) {
      console.error("Error fetching inventario:", error);
    }
  }

  const handleAgregarProducto = (nuevoProducto) => {
    // console.log("producto", nuevoProducto)
    if(productoSeleccionado.find((item) => item._id === nuevoProducto._id)) {
      alert("Producto ya seleccionado")
      return
    }
    setProductoSeleccionado((prevProductos) => [...prevProductos, nuevoProducto]);
  };

  const getClienteNombre = async (id) => {
    const resp = await apiClient.get(`/clientes/${id}`)
    return resp.data.nombre
  }

  const handleCrearVenta = async () => {

    if(productoSeleccionado.length === 0) {
      alert("No hay productos seleccionados")
      return
    }

    if(!sucursalSeleccionada) {
      alert("Seleccione una sucursal")
      return
    }

    if(!cedula) {
      alert("Ingrese la cédula del cliente")
      return
    }



    // console.log("crear venta")
    // console.log(productoSeleccionado)
    const resp = await apiClient.get(`/clientes/cedula/${cedula}`)
    // console.log(resp.data)

    if(!resp.data) {
     Swal.fire({
        icon: 'error',
        title: 'Cliente no encontrado',
        text: 'Por favor registre al cliente',
      })
      return
     }

    let clienteId = resp.data._id
    let obj = {
      fecha: `${new Date()}`,
      tipoVenta: esDomicilio ? 'domicilio' : 'sucursal',
      totalPagado: productoSeleccionado.reduce((acc, item) => acc + item.precio, 0),
      vendedorId: '00000000000000',
      clienteId: clienteId,
      sucursalId: sucursalSeleccionada,
    }

    const response = await apiClient.post('/ventas', obj)
    console.log(response.data)
    const ventaId = response.data._id

    console.log("productos seleccionados")
    productoSeleccionado.forEach(async (producto) => {
      console.log(producto)
      let obj = {
        ventaId: ventaId,
        subTotal: producto.precio,
        cantidad: 1,
        inventarioCatalogoId: producto.catalogoInventarioId
      }
     
      try {
        console.log(obj)
        const response = await apiClient.post('/sub-ventas', obj)
        console.log("subventa", response.data)
      } catch(e) {
          Swal.fire({
          icon: 'error',
          title: 'Error al comprar',
          text: e.response.data.error.message,
          })
      }
      
    })

    Swal.fire({
      icon: 'success',
      title: 'Compra realizada con éxito',
      text: 'La compra se ha registrado correctamente',
    })

    //* formulario para seleccionar si 
  }

  const handleCrearCliente = async () => {
    const MySwal = withReactContent(Swal);
  
    // Crear el formulario con SweetAlert
    const { value: formValues } = await MySwal.fire({
      title: 'Registrar Cliente',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre">
        <input id="apellido" class="swal2-input" placeholder="Apellido">
        <input id="cedula" class="swal2-input" placeholder="Cédula">
        <input id="correo" class="swal2-input" placeholder="Correo">
        <input id="telefono" class="swal2-input" placeholder="Teléfono">
        <input id="direccion" class="swal2-input" placeholder="Dirección">
        <input id="clave" type="password" class="swal2-input" placeholder="Clave">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          nombre: document.getElementById('nombre').value,
          apellido: document.getElementById('apellido').value,
          cedula: document.getElementById('cedula').value,
          correo: document.getElementById('correo').value,
          telefono: document.getElementById('telefono').value,
          direccion: document.getElementById('direccion').value,
          clave: document.getElementById('clave').value,
        };
      },
    });
  
    if (!formValues) {
      // Si el usuario cancela el formulario
      return;
    }
  
    // Validar campos vacíos
    const { nombre, apellido, cedula, correo, telefono, direccion, clave } = formValues;
    if (!nombre || !apellido || !cedula || !correo || !telefono || !direccion || !clave) {
      alert('Por favor, complete todos los campos.');
      return;
    }
  
    try {
      // Verificar si el cliente ya existe
      const resp = await apiClient.get(`/clientes/cedula/${cedula}`);
      if (resp.data) {
        alert('Cliente ya registrado.');
        return;
      }
  
      // Crear el cliente
      const newClient = { nombre, apellido, cedula, correo, telefono, direccion, clave };
      const createResp = await apiClient.post('/clientes', newClient);
  
      alert('Cliente creado con éxito');
      console.log(createResp.data);
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      alert('Ocurrió un error al registrar el cliente.');
    }
  };


  useEffect(() => {
    getSucursales();
    getCatalogo();
  }, []);


  return (
    <div>
      <div className="px-4 py-2 d-flex justify-content-between">
        <div>
        <h4>Seleccione su sucursal</h4>
        <select
          className="form-select"
          style={{ width: "300px" }}
          value={sucursalSeleccionada}
          onChange={(e) => {
            setSucursalSeleccionada(e.target.value)
            // getInventario(e.target.value)
            getCatalogoInventario(e.target.value)
            getVentas(e.target.value)

            setProductoSeleccionado([])
            setInventario([])
          }} 
        >
          <option value="">Seleccione una sucursal</option>
          {sucursales.map((sucursal) => (
            <option key={sucursal._id} value={sucursal._id}>
              {sucursal.nombre}
            </option>
          ))}
        </select>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <h2>Carrito <span style={{
            padding: '10px 20px',
            backgroundColor: 'lightblue',
            borderRadius: '10px',
          }}>{productoSeleccionado.length}</span></h2>
        </div>
      </div>

      <hr />
      <div className="grid-ventas">
        <div className="p-4">
          <h2>Realizar una compra</h2>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Cédula del cliente</Form.Label>
            <Form.Control
              type="text"
              required
              value={cedula}
              onChange={(e) => setCedula(e.target.value)} // Actualiza el estado de correo
            />
          </Form.Group>

          <Button variant="primary" style={{
            marginBottom: '20px',
          }}onClick={handleCrearCliente}>Registrarte si no tienes cuenta</Button>

          <div>

          <div>
            <h3>Opciones de envío</h3>
            <div>
              <label>
                <input
                  type="radio"
                  name="opcionEnvio"
                  value="domicilio"
                  checked={esDomicilio}
                  onChange={handleCheckboxChange}
                />
                Envío a domicilio
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="opcionEnvio"
                  value="sucursal"
                  checked={!esDomicilio}
                  onChange={handleCheckboxChange}
                />
                Recoger en sucursal
              </label>
            </div>

            <div style={{ marginTop: "20px" }}>
              {esDomicilio ? (
                <p>Se realizará un envío a domicilio.</p>
              ) : (
                <p>Se recogerá el pedido en la sucursal.</p>
              )}
            </div>
          </div>

          </div>

        </div>
        <div>
        <h4>Productos de la sucursal</h4>
          {inventario.map((producto) => (
            
            <div key={producto._id} className="producto mb-2">
              <p>{producto.nombre} -  <strong>${producto.precio}</strong></p>
              <p>Cantidad seleccionada: {cantidad}</p>
              <Button variant="success" size="sm" 
                onClick={() => handleAgregarProducto(producto)}
              >Agregar</Button>
            </div>
          ))}
          <p className="my-2">Total: {productoSeleccionado.reduce((acc, item) => acc + item.precio, 0)}</p>
          <Button
            onClick={handleCrearVenta}
          >Realizar Compra</Button>
        </div>
      </div>
    </div>
  );
};

export default PageVendedor;
