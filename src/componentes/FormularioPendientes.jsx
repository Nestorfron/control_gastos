import { useState } from "react";

export default function FormularioPendiente({ onAgregar }) {
  const [form, setForm] = useState({
    monto: "",
    descripcion: "",
    fecha: "",
  });

  const agregarPendiente = (e) => {
    e.preventDefault();
    if (!form.monto || !form.descripcion || !form.fecha) return;

    const nuevoPendiente = {
      id: Date.now(),
      monto: parseFloat(form.monto),
      descripcion: form.descripcion,
      fecha: form.fecha,
      pagado: false,
    };

    onAgregar(nuevoPendiente);

    setForm({ monto: "", descripcion: "", fecha: "" });
  };

  return (
    <form
      onSubmit={agregarPendiente}
      className="mb-6 flex flex-col sm:flex-row gap-3"
    >
    
      <input
        type="text"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        className="border p-2 rounded w-full"
      />
        <input
        type="number"
        placeholder="Monto"
        value={form.monto}
        onChange={(e) => setForm({ ...form, monto: e.target.value })}
        className="border p-2 rounded w-full"
      />
      <input
        type="date"
        value={form.fecha}
        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow"
      >
        ➕ Agregar
      </button>
    </form>
  );
}
