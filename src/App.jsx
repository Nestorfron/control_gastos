import { useState, useEffect } from "react";
import { db } from "../src/database/db";
import dayjs from "dayjs";
import { Home, Plus } from "lucide-react";
import FormularioPendiente from "../src/componentes/FormularioPendientes";
import ListaPendientes from "../src/componentes/ListaPendientes";
import MenuAcciones from "../src/componentes/MenuAcciones";

export default function App() {
  const [mesActual, setMesActual] = useState(dayjs().format("YYYY-MM"));
  const [mesDestino, setMesDestino] = useState(
    dayjs().add(1, "month").format("YYYY-MM")
  );
  const [listaMes, setListaMes] = useState(null);
  const [copiando, setCopiando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pendienteEditar, setPendienteEditar] = useState(null); // Solo para edición tradicional (puede quedar null)

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

  // Cancelar edición tradicional (formulario)
  const cancelarEdicion = () => {
    setPendienteEditar(null);
    setMostrarFormulario(false);
  };

  // Guardar pendiente nuevo desde formulario tradicional
  const guardarPendienteNuevo = async (pendiente) => {
    const nuevaLista = {
      ...listaMes,
      pendientes: [
        ...listaMes.pendientes,
        {
          ...pendiente,
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          pagado: false,
        },
      ],
    };
    await guardarLista(nuevaLista);
    setMostrarFormulario(false);
  };

  // Guardar pendiente editado inline
  const guardarPendienteInline = async (id, datosPendiente) => {
    const nuevaLista = {
      ...listaMes,
      pendientes: listaMes.pendientes.map((p) =>
        p.id === id ? { ...p, ...datosPendiente } : p
      ),
    };
    await guardarLista(nuevaLista);
  };

  // Exportar JSON individual (mes actual)
  const exportarJSON = () => {
    if (!listaMes) return;
    const data = JSON.stringify(listaMes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pendientes-${listaMes.mes}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar JSON individual (mes actual)
  const importarJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const datosImportados = JSON.parse(evt.target.result);
        if (!datosImportados.mes || !Array.isArray(datosImportados.pendientes)) {
          alert("Archivo inválido");
          return;
        }
        await db.listasMensuales.put(datosImportados);
        cargarListaMes(datosImportados.mes);
        alert("Importación exitosa");
      } catch {
        alert("Error leyendo el archivo");
      }
    };
    reader.readAsText(file);
  };

  // Exportar respaldo total
  const exportarTodo = async () => {
    const todasLasListas = await db.listasMensuales.toArray();
    const data = JSON.stringify(todasLasListas, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respaldo-todo-${dayjs().format("YYYY-MM-DD")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar respaldo total
  const importarTodo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const datosImportados = JSON.parse(evt.target.result);
        if (!Array.isArray(datosImportados)) {
          alert("Archivo inválido");
          return;
        }
        await db.listasMensuales.clear();
        await db.listasMensuales.bulkAdd(datosImportados);
        alert("Importación completa exitosa");
        cargarListaMes(mesActual);
      } catch (error) {
        alert("Error leyendo el archivo");
      }
    };
    reader.readAsText(file);
  };

  // Copiar pendientes de mesActual a mesDestino
  const copiarPendientes = async () => {
    if (mesDestino === mesActual) {
      alert("El mes destino debe ser diferente al mes actual");
      return;
    }

    setCopiando(true);
    try {
      const origen = await db.listasMensuales.where("mes").equals(mesActual).first();
      let destino = await db.listasMensuales.where("mes").equals(mesDestino).first();

      if (!origen || !origen.pendientes.length) {
        alert("El mes origen no tiene pendientes para copiar.");
        setCopiando(false);
        return;
      }

      if (!destino) {
        const id = await db.listasMensuales.add({
          mes: mesDestino,
          pendientes: [],
        });
        destino = await db.listasMensuales.get(id);
      }

      const normalizarPendiente = (p) => ({
        descripcion: p.descripcion.trim().toLowerCase(),
        fecha: p.fecha,
        montoPesos: Number(parseFloat(p.montoPesos).toFixed(2)) || 0,
        montoDolares: Number(parseFloat(p.montoDolares).toFixed(2)) || 0,
      });

      const clavesDestino = new Set(
        destino.pendientes.map((p) => {
          const np = normalizarPendiente(p);
          return `${np.descripcion}|${np.fecha}|${np.montoPesos}|${np.montoDolares}`;
        })
      );

      const pendientesNuevos = origen.pendientes.filter((p) => {
        const np = normalizarPendiente(p);
        const clave = `${np.descripcion}|${np.fecha}|${np.montoPesos}|${np.montoDolares}`;
        return !clavesDestino.has(clave);
      });

      if (pendientesNuevos.length === 0) {
        alert("No hay pendientes nuevos para copiar. Ya fueron copiados anteriormente.");
        setCopiando(false);
        return;
      }

      const pendientesCopiados = pendientesNuevos.map((p) => ({
        ...p,
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        pagado: false,
      }));

      const nuevaListaDestino = {
        ...destino,
        pendientes: [...destino.pendientes, ...pendientesCopiados],
      };

      await db.listasMensuales.put(nuevaListaDestino);

      alert(
        `Copiados ${pendientesCopiados.length} pendientes nuevos de ${mesActual} a ${mesDestino}.`
      );

      if (mesDestino === mesActual) {
        cargarListaMes(mesActual);
      }
    } catch (error) {
      console.error(error);
      alert("Error al copiar pendientes.");
    }
    setCopiando(false);
  };

  if (!listaMes) return <p>Cargando...</p>;

  const totalPendientes = listaMes.pendientes.length;
  const pagados = listaMes.pendientes.filter((p) => p.pagado).length;
  const noPagados = totalPendientes - pagados;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-emerald-600 mt-2">
        📋 Gastos - Pendientes
      </h1>

      <div className="flex items-end justify-end mb-6 space-x-2">
        <MenuAcciones
          onExportarJSON={exportarJSON}
          onImportarJSON={importarJSON}
          onExportarTodo={exportarTodo}
          onImportarTodo={importarTodo}
          mesActual={mesActual}
          mesDestino={mesDestino}
          setMesDestino={setMesDestino}
          copiarPendientes={copiarPendientes}
          copiando={copiando}
        />
      </div>

      <div className="flex items-center justify-center mb-6 space-x-2 text-center">
        <input
          type="month"
          value={mesActual}
          onChange={cambiarMes}
          className="border p-2 rounded"
          title="Seleccionar mes actual (origen)"
        />
        <button
          onClick={() => setMesActual(dayjs().format("YYYY-MM"))}
          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow"
          title="Mes actual"
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            setMostrarFormulario((v) => !v);
            setPendienteEditar(null);
          }}
          className="ml-2 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow"
          title="Agregar pendiente"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {mostrarFormulario && (
        <FormularioPendiente
          pendienteEditar={pendienteEditar}
          onAgregar={guardarPendienteNuevo}
          onCancelarEdicion={cancelarEdicion}
        />
      )}

      <div className="mb-6 text-center text-gray-700">
        <p>
          <strong>Pagados:</strong> {pagados}
        </p>
        <p>
          <strong>Pendientes:</strong> {noPagados}
        </p>
      </div>

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
          // Si estuviera editando con el formulario tradicional y borra el pendiente, cancelar edición
          if (pendienteEditar?.id === id) cancelarEdicion();
        }}
        onEditar={guardarPendienteInline} // edición inline aquí, recibe (id, datosEditados)
      />
      <footer>
        <p className="text-center text-gray-500 mt-2">Creado por <a href="https://www.linkedin.com/in/nestor-frones/" target="_blank" rel="noreferrer">Nestor FRONES 👋</a></p>
      </footer>
    </div>
    
  );
}
