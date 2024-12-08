import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import apiClient from "../../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const PageAdmin = ({ role, user, setUserLogged }) => {
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [dataSemana, setDataSemana] = useState([]);
  const [dataMes, setDataMes] = useState([]);
  const [dataAnual, setDataAnual] = useState([]);

  const handleLogout = () => {
    console.log("cerrar sesión");

    setUserLogged(null);
    setrole("");
  };

  const getProductosBajoStock = async () => {
    const catalogo = await getCatalogo();
    // console.log(catalogo);

    const response = await apiClient.get("/inventario-catalogos");

    const productosBajoStock = response.data.filter((producto) => {
      return producto.stock < 4;
    });

    // console.log(productosBajoStock);
    //buscar nombre en el catalogo
    const productosBajoStockConNombre = productosBajoStock.map((producto) => {
      const productoCatalogo = catalogo.find(
        (productoCatalogo) => productoCatalogo._id === producto.catalogoId
      );
      // console.log(productoCatalogo);

      return {
        ...producto,
        nombre: productoCatalogo.nombre,
      };
    });

    // console.log(productosBajoStockConNombre);

    setProductosBajoStock(productosBajoStockConNombre);
  };

  const getCatalogo = async () => {
    try {
      const response = await apiClient.get("/catalogos");
      return response.data; // Almacena los datos en el estado
    } catch (error) {
      console.error("Error fetching catalogo:", error);
    }
  };

  const getVentas = async () => {
    const response = await apiClient.get("/ventas");
    // console.log(response.data);

    let meses = [
      {
        mes: "Enero",
        ventas: 0,
      },
      {
        mes: "Febrero",
        ventas: 0,
      },
      {
        mes: "Marzo",
        ventas: 0,
      },
      {
        mes: "Abril",
        ventas: 0,
      },
      {
        mes: "Mayo",
        ventas: 0,
      },
      {
        mes: "Junio",
        ventas: 0,
      },
      {
        mes: "Julio",
        ventas: 0,
      },
      {
        mes: "Agosto",
        ventas: 0,
      },
      {
        mes: "Septiembre",
        ventas: 0,
      },
      {
        mes: "Octubre",
        ventas: 0,
      },
      {
        mes: "Noviembre",
        ventas: 0,
      },
      {
        mes: "Diciembre",
        ventas: 0,
      },
    ];

    let dias = [
      {
        dia: "Lunes",
        ventas: 0,
      },
      {
        dia: "Martes",
        ventas: 0,
      },
      {
        dia: "Miércoles",
        ventas: 0,
      },
      {
        dia: "Jueves",
        ventas: 0,
      },
      {
        dia: "Viernes",
        ventas: 0,
      },
      {
        dia: "Sábado",
        ventas: 0,
      },
      {
        dia: "Domingo",
        ventas: 0,
      }
    ]

    response.data.forEach((venta) => {
      const fecha = new Date(venta.fecha);
      const mes = fecha.getMonth();
      meses.forEach((item) => {
        if (mes === meses.indexOf(item)) {
          item.ventas += 1;
        }
      });

      const dia = fecha.getDay();
      dias.forEach((item) => {
        if (dia === dias.indexOf(item)) {
          item.ventas += 1;
        }
      });
    });

    setVentas(response.data);
    setDataAnual(meses);
    setDataSemana(dias);

  };

  useEffect(() => {
    getProductosBajoStock();
    getVentas();
  }, []);

  return (
    <>
      <div
        className="px-4 py-2 d-flex justify-content-between bg-primary"
        style={{
          width: "100vw",
        }}
      >
        <div>
          <h3 className="text-white">Panel de administrador</h3>
        </div>
        <div>
          <Button
            variant="success mx-2"
            size="sm"
            style={{ marginTop: "20px" }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
      <div
        className="p-4"
        style={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <h4>Análisis de stock</h4>
        <h5
          style={{
            marginBottom: "20px",
          }}
        >
          Productos con bajo stock
        </h5>

        {productosBajoStock.length > 0 ? (
          <div>
            {productosBajoStock.map((producto) => (
              <div key={producto._id} className="alert alert-warning">
                {producto.nombre} | Stock: {producto.stock}
              </div>
            ))}
          </div>
        ) : (
          <p>No hay productos con bajo stock.</p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <h4 className="text-center bg-success py-2 text-white rounded">
              Ventas realizadas
            </h4>
            {ventas && <h5 className="text-center" style={{fontSize: '70px'}}>{ventas.length}</h5>}
          </div>
          <div>


            <h3 style={{
              marginBottom: '10px'
            }} className="text-center bg-primary text-white rounded p-2">Ventas por mes</h3>
            <LineChart width={300} height={300} data={dataAnual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#8884d8" />
            </LineChart>
          </div>

          <div>
            <h3 style={{
              marginBottom: '10px'
            }} className="text-center bg-primary text-white rounded p-2">Ventas por día</h3>
            <LineChart width={300} height={300} data={dataSemana}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#8884d8" />
            </LineChart>
            </div>

         
        </div>
      </div>
    </>
  );
};

export default PageAdmin;
