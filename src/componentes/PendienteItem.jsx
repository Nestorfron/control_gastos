export default function PendienteItem({ pendiente, onToggle, onBorrar }) {
    return (
      <li
        className={`flex items-center justify-between p-3 border rounded shadow-sm ${
          pendiente.pagado ? "bg-gray-200 text-gray-500 line-through" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={pendiente.pagado}
            onChange={onToggle}
          />
          <div>
            <p className="font-semibold">${pendiente.monto}</p>
            <p>{pendiente.descripcion}</p>
            <p className="text-sm text-gray-600">Fecha: {pendiente.fecha}</p>
          </div>
        </div>
        <button
          onClick={onBorrar}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          🗑
        </button>
      </li>
    );
  }
  