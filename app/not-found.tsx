import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Clause Not Found
          </h1>
          <p className="text-sm text-gray-400">
            The legal document, analysis route, or resource you requested could not be located in our index.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 transition"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
          >
            <FileText className="w-4 h-4" />
            Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
