import { Link } from 'react-router-dom'

export const NotFound = () => (
  <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gray-50">
    <div className="mx-auto w-full max-w-6xl text-center">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">Página não encontrada</h1>
      <p className="mt-2 text-gray-500">O endereço que você acessou não existe.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  </main>
)
