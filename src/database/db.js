import Dexie from "dexie";

export const db = new Dexie("ControlGastosDB");

// Versión 1: tablas movimientos y pendientes
db.version(1).stores({
  movimientos: "++id, tipo, monto, descripcion, fecha",
  pendientes: "++id, monto, descripcion, fecha, pagado",
});

// Versión 2: agregar la tabla listasMensuales para control mensual
db.version(2).stores({
  listasMensuales: "++id, mes",
});



