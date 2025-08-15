import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{rounded}</motion.span>;
}

export default function Resumen({ pagados, noPagados, totalPesos, totalDolares }) {
  return (
    <div className="flex w-full flex-wrap gap-4 mb-6 text-gray-700 justify-center">
      {/* Card de Pagados/Pendientes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 border shadow-lg rounded-xl px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white min-w-[250px]"
      >
        <div className="text-center flex-1">
          <p className="text-sm font-medium opacity-90">Pagados</p>
          <p className="text-2xl font-bold">
            <AnimatedNumber value={pagados} />
          </p>
        </div>
        <div className="w-px bg-white/40 h-10"></div>
        <div className="text-center flex-1">
          <p className="text-sm font-medium opacity-90">Pendientes</p>
          <p className="text-2xl font-bold">
            <AnimatedNumber value={noPagados} />
          </p>
        </div>
      </motion.div>

      {/* Card de Totales */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-4 border shadow-lg rounded-xl px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white min-w-[250px]"
      >
        <div className="text-center flex-1">
          <p className="text-sm font-medium opacity-90">Total Pesos</p>
          <p className="text-2xl font-bold">
            $ <AnimatedNumber value={totalPesos} />
          </p>
        </div>
        <div className="w-px bg-white/40 h-10"></div>
        <div className="text-center flex-1">
          <p className="text-sm font-medium opacity-90">Total Dólares</p>
          <p className="text-2xl font-bold">
            $ <AnimatedNumber value={totalDolares} />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
