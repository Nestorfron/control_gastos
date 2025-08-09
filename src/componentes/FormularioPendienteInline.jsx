import React from "react";

export default function FormularioPendienteInline({
  form,
  setForm,
  onCancelar,
  onGuardar,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar();
      }}
      className="flex flex-wrap items-center gap-2 flex-1"
    >
      <input
        type="text"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        className="border rounded p-1 flex-grow min-w-[150px]"
        required
      />
      <input
        type="date"
        value={form.fecha}
        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        className="border rounded p-1 w-[140px]"
        required
      />
      <input
        type="number"
        placeholder="Monto Pesos"
        value={form.montoPesos}
        onChange={(e) => setForm({ ...form, montoPesos: e.target.value })}
        className="border rounded p-1 w-[100px]"
        min="0"
        step="0.01"
      />
      <input
        type="number"
        placeholder="Monto Dólares"
        value={form.montoDolares}
        onChange={(e) => setForm({ ...form, montoDolares: e.target.value })}
        className="border rounded p-1 w-[100px]"
        min="0"
        step="0.01"
      />

      <button
        type="submit"
        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow"
        title="Guardar"
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={onCancelar}
        className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded shadow"
        title="Cancelar"
      >
        Cancelar
      </button>
    </form>
  );
}
