import PendienteItem from "./PendienteItem";

export default function ListaPendientes({ pendientes, onTogglePagado, onBorrar }) {
  if (pendientes.length === 0) {
    return <p className="text-center text-gray-500">No hay pendientes.</p>;
  }

  return (
    <ul className="space-y-3">
      {pendientes.map((item) => (
        <PendienteItem
          key={item.id}
          pendiente={item}
          onToggle={() => onTogglePagado(item.id)}
          onBorrar={() => onBorrar(item.id)}
        />
      ))}
    </ul>
  );
}
