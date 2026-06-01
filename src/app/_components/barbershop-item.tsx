import { Barbershop } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { MapPinIcon, StarIcon } from "lucide-react"
import Link from "next/link"

interface BarbershopItemProps {
  barbershop: Barbershop
  distanceKm?: number
  averageRating?: number | null
}

const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`

const BarbershopItem = ({ barbershop, distanceKm, averageRating }: BarbershopItemProps) => {
  return (
    <Card className="group min-w-[167px] cursor-pointer overflow-hidden rounded-2xl border-secondary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="p-0">
        <div className="relative h-[159px] w-full overflow-hidden">
          <Image
            alt={barbershop.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            src={barbershop.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {averageRating !== null && averageRating !== undefined ? (
            <Badge
              className="absolute left-2 top-2 gap-1 border-0 bg-black/60 backdrop-blur-sm"
              variant="secondary"
            >
              <StarIcon size={10} className="fill-primary text-primary" />
              <span className="text-xs font-semibold">
                {averageRating.toFixed(1).replace(".", ",")}
              </span>
            </Badge>
          ) : (
            <Badge
              className="absolute left-2 top-2 border-0 bg-black/60 backdrop-blur-sm"
              variant="secondary"
            >
              <span className="text-xs font-semibold text-gray-400">Novo</span>
            </Badge>
          )}
          {distanceKm !== undefined && (
            <Badge
              className="absolute right-2 top-2 gap-1 border-0 bg-black/60 backdrop-blur-sm"
              variant="secondary"
            >
              <MapPinIcon size={10} className="text-primary" />
              <span className="text-xs font-semibold">{formatDistance(distanceKm)}</span>
            </Badge>
          )}
        </div>

        <div className="px-3 py-3">
          <h3 className="truncate text-sm font-bold">{barbershop.name}</h3>
          <p className="truncate text-xs text-gray-400">{barbershop.address}</p>
          <Button
            variant="secondary"
            className="mt-3 w-full text-xs font-semibold transition-colors hover:bg-primary hover:text-white"
            asChild
          >
            <Link href={`/barbershops/${barbershop.id}`}>Reservar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarbershopItem
