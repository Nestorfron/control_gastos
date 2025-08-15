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
    <ul className="space-y-4 p-4">
  {pendientes.length === 0 && (
    <li className="text-center text-gray-500 italic">No hay pendientes.</li>
  )}

  {pendientes.map((item) => (
    <li
      key={item.id}
      className={`flex items-center justify-between p-4 rounded-xl shadow-md border transition-all ${
        item.pagado
          ? "bg-gray-100 text-gray-400 line-through"
          : "bg-white hover:shadow-lg"
      }`}
    >
      {/* Izquierda */}
      <div className="flex items-start gap-4 flex-1">
        <input
          type="checkbox"
          checked={item.pagado}
          onChange={() => onTogglePagado(item.id)}
          className="mt-1 h-5 w-5 accent-green-500 cursor-pointer"
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
            <p className="font-semibold text-lg">{item.descripcion}</p>

            <div className="flex items-center gap-3 mt-1 text-sm">
              {item.montoPesos != null && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  ${item.montoPesos} UYU
                </span>
              )}
              {item.montoDolares != null && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                  ${item.montoDolares} USD
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-1">
              📅 {item.fecha}
            </p>
          </div>
        )}
      </div>

      {/* Botones */}
      {idEditando !== item.id && (
        <div className="flex gap-2">
          <button
            onClick={() => setIdEditando(item.id)}
            className="p-2 text-gray-500 hover:text-yellow-500 rounded-full hover:bg-yellow-50 transition"
            title="Editar"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => onBorrar(item.id)}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition"
            title="Borrar"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </li>
  ))}
</ul>

  );
}
