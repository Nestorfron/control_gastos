import dayjs from "dayjs";
import { db } from "../database/db";

export default function RespaldoTotal({ onImportComplete }) {
  // Exportar todo
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

  // Importar todo
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
        if (onImportComplete) onImportComplete();
      } catch (error) {
        alert("Error leyendo el archivo");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex space-x-2 mb-6 justify-center">
      <button
        onClick={exportarTodo}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow"
        title="Exportar todas las listas"
      >
        Exportar Todo
      </button>

      <label
        className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow"
        title="Importar todas las listas"
      >
        Importar Todo
        <input
          type="file"
          accept="application/json"
          onChange={importarTodo}
          className="hidden"
        />
      </label>
    </div>
  );
}
