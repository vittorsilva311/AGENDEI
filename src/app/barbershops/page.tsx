import GeoBarbershopGrid from "../_components/geo-barbershop-grid"
import Header from "../_components/header"
import Search from "../_components/search"
import { db } from "../_lib/prisma"

interface BarbershopsPageProps {
  searchParams: {
    title?: string
    service?: string
  }
}

const BarbershopsPage = async ({ searchParams }: BarbershopsPageProps) => {
  const barbershops = await db.barbershop.findMany({
    where: {
      OR: [
        searchParams?.title
          ? { name: { contains: searchParams.title, mode: "insensitive" } }
          : {},
        searchParams?.service
          ? {
              services: {
                some: {
                  name: {
                    contains: searchParams.service,
                    mode: "insensitive",
                  },
                },
              },
            }
          : {},
      ],
    },
    include: { reviews: { select: { rating: true } } },
  })

  return (
    <div>
      <Header />

      <div className="mx-auto max-w-5xl px-5 py-6">
        <Search />

        <h2 className="mb-4 mt-6 text-xs font-bold uppercase text-gray-400">
          Resultados para &quot;
          {searchParams?.title ?? searchParams?.service}&quot;
        </h2>

        {barbershops.length === 0 ? (
          <p className="text-sm text-gray-400">
            Nenhuma barbearia encontrada.
          </p>
        ) : (
          <GeoBarbershopGrid
            barbershops={barbershops}
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          />
        )}
      </div>
    </div>
  )
}

export default BarbershopsPage
