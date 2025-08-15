import { useState, useEffect } from "react";

export default function FormularioPendiente({ onAgregar, pendienteEditar, onCancelarEdicion }) {
  const [form, setForm] = useState({
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    montoPesos: "",
    montoDolares: "",
  });

  useEffect(() => {
    if (pendienteEditar) {
      setForm({
        descripcion: pendienteEditar.descripcion,
        fecha: pendienteEditar.fecha,
        montoPesos: pendienteEditar.montoPesos ?? "",
        montoDolares: pendienteEditar.montoDolares ?? "",
      });
    } else {
      setForm({ descripcion: "", fecha: new Date().toISOString().split("T")[0], montoPesos: "", montoDolares: "" });
    }
  }, [pendienteEditar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.fecha) return alert("Complete la descripción y fecha");
    if (form.montoPesos === "" && form.montoDolares === "") return alert("Debe ingresar al menos un monto, en pesos o dólares.");

    const nuevoPendiente = {
      id: pendienteEditar?.id,
      descripcion: form.descripcion,
      fecha: form.fecha,
      montoPesos: form.montoPesos === "" ? null : parseFloat(form.montoPesos),
      montoDolares: form.montoDolares === "" ? null : parseFloat(form.montoDolares),
      pagado: pendienteEditar?.pagado ?? false,
    };

    onAgregar(nuevoPendiente);

    if (!pendienteEditar) {
      setForm({ descripcion: "", fecha: new Date().toISOString().split("T")[0], montoPesos: "", montoDolares: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col sm:flex-row gap-3 m-2">
      <input
        type="text"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={e => setForm({ ...form, descripcion: e.target.value })}
        className="border p-2 rounded w-full"
      />
      <input
        type="date"
        value={form.fecha}
        onChange={e => setForm({ ...form, fecha: e.target.value })}
        className="border p-2 rounded w-full"
      />
      <input
        type="number"
        placeholder="Monto Pesos"
        value={form.montoPesos}
        onChange={e => setForm({ ...form, montoPesos: e.target.value })}
        className="border p-2 rounded w-full"
      />
      <input
        type="number"
        placeholder="Monto Dólares"
        value={form.montoDolares}
        onChange={e => setForm({ ...form, montoDolares: e.target.value })}
        className="border p-2 rounded w-full"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow"
        >
          {pendienteEditar ? "Guardar cambios" : "Agregar"}
        </button>
     
          <button
            type="button"
            onClick={onCancelarEdicion}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded shadow"
          >
            Cancelar
          </button>

      </div>
    </form>
  );
}
