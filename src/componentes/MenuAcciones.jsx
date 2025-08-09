import { useState, useRef, useEffect } from "react";
import { MoreVertical, Download, Upload, FileText, Copy } from "lucide-react";

export default function MenuAcciones({
  onExportarJSON,
  onImportarJSON,
  onExportarTodo,
  onImportarTodo,
  mesActual,
  mesDestino,
  setMesDestino,
  copiarPendientes,
  copiando,
  className,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Cerrar dropdown si clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        aria-expanded={open}
        aria-haspopup="true"
        title="Opciones"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 p-2">
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                onExportarJSON();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="w-4 h-4 mr-2" /> Exportar mes actual
            </button>

            <label
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              title="Importar mes actual"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar mes actual
              <input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  setOpen(false);
                  onImportarJSON(e);
                }}
                className="hidden"
              />
            </label>

            <hr className="my-1" />

            <button
              onClick={() => {
                setOpen(false);
                onExportarTodo();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar respaldo total
            </button>

            <label
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              title="Importar respaldo total"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar respaldo total
              <input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  setOpen(false);
                  onImportarTodo(e);
                }}
                className="hidden"
              />
            </label>

            <hr className="my-1" />

            {/* Copiar pendientes */}
            <div className="px-4 py-2 text-sm text-gray-700">
              <label className="block font-semibold mb-1">Copiar pendientes</label>

              <div className="mb-2">
                <label className="block text-xs font-medium mb-1">Mes actual (origen)</label>
                <input
                  type="month"
                  value={mesActual}
                  disabled
                  className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                  title="Mes origen (actual)"
                />
              </div>

              <div className="mb-2">
                <label className="block text-xs font-medium mb-1">Mes destino</label>
                <input
                  type="month"
                  value={mesDestino}
                  onChange={(e) => setMesDestino(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  title="Seleccionar mes destino"
                />
              </div>

              <button
                onClick={() => {
                  copiarPendientes();
                  setOpen(false);
                }}
                disabled={copiando || mesDestino === mesActual}
                className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                title={mesDestino === mesActual ? "El mes destino debe ser distinto" : "Copiar pendientes"}
              >
                {copiando ? "Copiando..." : <><Copy className="inline w-4 h-4 mr-1" /> Copiar pendientes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
