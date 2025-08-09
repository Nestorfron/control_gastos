import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import FormularioPendienteInline from "./FormularioPendienteInline";

export default function ListaPendientes({
  pendientes,
  onTogglePagado,
  onBorrar,
  onEditar,
}) {
  const [idEditando, setIdEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({
    descripcion: "",
    fecha: "",
    montoPesos: "",
    montoDolares: "",
  });

  useEffect(() => {
    if (idEditando) {
      const pendiente = pendientes.find((p) => p.id === idEditando);
      if (pendiente) {
        setFormEdit({
          descripcion: pendiente.descripcion,
          fecha: pendiente.fecha,
          montoPesos: pendiente.montoPesos ?? "",
          montoDolares: pendiente.montoDolares ?? "",
        });
      }
    } else {
      setFormEdit({
        descripcion: "",
        fecha: new Date().toISOString().split("T")[0],
        montoPesos: "",
        montoDolares: "",
      });
    }
  }, [idEditando, pendientes]);

  const guardarEdicion = () => {
    if (!formEdit.descripcion || !formEdit.fecha) {
      alert("Complete descripción y fecha");
      return;
    }
    onEditar(idEditando, {
      descripcion: formEdit.descripcion,
      fecha: formEdit.fecha,
      montoPesos:
        formEdit.montoPesos === "" ? null : parseFloat(formEdit.montoPesos),
      montoDolares:
        formEdit.montoDolares === "" ? null : parseFloat(formEdit.montoDolares),
    });
    setIdEditando(null);
  };

  return (
    <ul className="space-y-3">
      {pendientes.length === 0 && (
        <li className="text-center text-gray-500">No hay pendientes.</li>
      )}

      {pendientes.map((item) => (
        <li
          key={item.id}
          className={`flex items-center justify-between p-3 border rounded shadow-sm ${
            item.pagado ? "bg-gray-200 text-gray-500 line-through" : ""
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={item.pagado}
              onChange={() => onTogglePagado(item.id)}
            />

            {idEditando === item.id ? (
              <FormularioPendienteInline
                form={formEdit}
                setForm={setFormEdit}
                onCancelar={() => setIdEditando(null)}
                onGuardar={guardarEdicion}
              />
            ) : (
              <div>
                <p className="font-semibold">{item.descripcion}</p>
                <p>
                  {item.montoPesos != null && <>${item.montoPesos} UYU</>}
                  {item.montoDolares != null && <> / ${item.montoDolares} USD</>}
                </p>
                <p className="text-sm text-gray-600">Fecha: {item.fecha}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {idEditando === item.id ? null : (
              <>
                <button
                  onClick={() => setIdEditando(item.id)}
                  className="px-2 py-1 text-gray-600 hover:text-yellow-600 rounded"
                  title="Editar"
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onBorrar(item.id)}
                  className="px-2 py-1 text-gray-600 hover:text-red-600 rounded"
                  title="Borrar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
