import { useState, useEffect } from "react";
import { db } from "../src/database/db";
import dayjs from "dayjs";
import { Home } from "lucide-react";
import FormularioPendiente from "../src/componentes/FormularioPendientes";
import ListaPendientes from "../src/componentes/ListaPendientes";

export default function App() {
  const [mesActual, setMesActual] = useState(dayjs().format("YYYY-MM")); // e.g. "2025-08"
  const [listaMes, setListaMes] = useState(null); // { id, mes, pendientes }

  useEffect(() => {
    cargarListaMes(mesActual);
  }, [mesActual]);

  const cargarListaMes = async (mes) => {
    let lista = await db.listasMensuales.where("mes").equals(mes).first();
    if (!lista) {
      const id = await db.listasMensuales.add({ mes, pendientes: [] });
      lista = await db.listasMensuales.get(id);
    }
    setListaMes(lista);
  };

  const guardarLista = async (nuevaLista) => {
    await db.listasMensuales.put(nuevaLista);
    setListaMes(nuevaLista);
  };

  const cambiarMes = (e) => {
    setMesActual(e.target.value);
  };

  if (!listaMes) return <p>Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-emerald-600">
        📋 Pendientes
      </h1>

      <div className="flex items-center justify-center mb-6 text-center">
        <input
          type="month"
          value={mesActual}
          onChange={cambiarMes}
          className="ms-auto border p-2 rounded"
        />
        <button
          onClick={() => setMesActual(dayjs().format("YYYY-MM"))}
          className="me-auto ml-2 px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow"
        >
          <Home className="w-6 h-6" />
        </button>
      </div>

      <FormularioPendiente
        onAgregar={async (nuevoPendiente) => {
          const nuevaLista = {
            ...listaMes,
            pendientes: [...listaMes.pendientes, nuevoPendiente],
          };
          await guardarLista(nuevaLista);
        }}
      />

      <ListaPendientes
        pendientes={listaMes.pendientes}
        onTogglePagado={async (id) => {
          const nuevaLista = {
            ...listaMes,
            pendientes: listaMes.pendientes.map((p) =>
              p.id === id ? { ...p, pagado: !p.pagado } : p
            ),
          };
          await guardarLista(nuevaLista);
        }}
        onBorrar={async (id) => {
          const nuevaLista = {
            ...listaMes,
            pendientes: listaMes.pendientes.filter((p) => p.id !== id),
          };
          await guardarLista(nuevaLista);
        }}
      />
    </div>
  );
}
