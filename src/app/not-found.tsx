import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full px-6 bg-[radial-gradient(circle_at_75%_30%,#2E1F5E_0%,#1A1235_45%,#0D0818_100%),linear-gradient(135deg,rgba(64,118,195,0.08)_0%,transparent_50%)] bg-blend-screen">
      <div className="relative flex flex-col items-center text-center">
        {/* - Glow - */}

        <div className="absolute w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(232,185,35,0.2)_0%,rgba(64,118,195,0.12)_45%,transparent_75%)] blur-2xl pointer-events-none" />

        <div className="relative flex flex-col items-center px-4 py-2 w-100 h-60 bg-white/20 border border-white/10 rounded-xl shadow-md shadow-black">
          <h1 className="text-6xl sm:text-7xl font-black text-[#E8B923]">
            <span>404</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-white mt-3">
            Página <span className="text-[#E8B923]">Não Encontrada</span>
          </p>

          <p className="text-sm sm:text-base text-[#C9C1EE] font-semibold mt-3 mb-8">
            A página que você está procurando não existe.
          </p>

          <Link
            className="flex items-center justify-center px-4 py-2 bg-[#E8B923] hover:bg-[#AA891A] text-lg font-bold rounded-full text-[#241852] hover:text-[#1B1141] cursor-pointer shadow-[0_0_20px_rgba(232,185,35,0.35)] hover:shadow-[0_0_28px_rgba(232,185,35,0.55)] transition-shadow hover:scale-105 active:scale-95"
            href="/"
          >
            Voltar à Página Principal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
