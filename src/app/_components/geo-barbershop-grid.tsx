"use client"

import { useEffect, useState } from "react"
import { Barbershop } from "@prisma/client"
import BarbershopItem from "./barbershop-item"

type BarbershopWithCoords = Barbershop & {
  lat?: number | null
  lng?: number | null
  reviews?: { rating: number }[]
}

interface Props {
  barbershops: BarbershopWithCoords[]
  className?: string
}

function avgRating(reviews?: { rating: number }[]): number | null {
  if (!reviews || reviews.length === 0) return null
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const GeoBarbershopGrid = ({ barbershops, className }: Props) => {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000 },
    )
  }, [])

  const sorted = userPos
    ? [...barbershops].sort((a, b) => {
        const da =
          a.lat && a.lng ? haversineKm(userPos.lat, userPos.lng, a.lat, a.lng) : Infinity
        const db2 =
          b.lat && b.lng ? haversineKm(userPos.lat, userPos.lng, b.lat, b.lng) : Infinity
        return da - db2
      })
    : barbershops

  return (
    <div
      className={
        className ??
        "flex gap-4 overflow-auto pb-1 [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4"
      }
    >
      {sorted.map((b) => {
        const distanceKm =
          userPos && b.lat && b.lng
            ? haversineKm(userPos.lat, userPos.lng, b.lat, b.lng)
            : undefined
        return (
          <BarbershopItem
            key={b.id}
            barbershop={b as Barbershop}
            distanceKm={distanceKm}
            averageRating={avgRating(b.reviews)}
          />
        )
      })}
    </div>
  )
}

export default GeoBarbershopGrid
